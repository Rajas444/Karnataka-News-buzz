

import { fetchNews } from '@/services/news';
import type { NewsdataArticle } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import MainLayout from '@/app/(main)/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/services/categories';
import { getDistricts } from '@/services/districts';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import FilterControls from '@/components/news/FilterControls';


type CategoryPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    district?: string;
  };
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categorySlug = params.slug;
  const district = searchParams?.district;
  
  let articles: NewsdataArticle[] = [];
  let nextPage: string | null = null;
  let error: string | null = null;
  let categories = [];
  let districts = [];

  try {
      [categories, districts] = await Promise.all([getCategories(), getDistricts()]);
  } catch(e) {
      console.error("Failed to load filter data", e);
  }

  const category = categories.find(c => c.slug === categorySlug);

  try {
      const response = await fetchNews(categorySlug, district);
      articles = response.articles;
      nextPage = response.nextPage;
  } catch (e: any) {
      error = e.message || 'An unknown error occurred.';
  }

  const topArticle: NewsdataArticle | undefined = articles[0];
  const initialArticles = articles.slice(1);

  return (
    <MainLayout>
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2 leading-tight">
                {category?.name || 'News'}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
                Browsing the {category?.name || 'latest'} news.
            </p>
            
            {error && !topArticle && (
                <div className="text-center py-12 bg-card rounded-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Failed to Load News</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            )}

            {/* Filters Section */}
            <section className="mb-12">
                <FilterControls categories={categories} districts={districts} />
            </section>
            
            {!error && topArticle ? (
                <>
                {/* Top Article for Category */}
                <section className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                        <Image
                        src={topArticle.image_url || 'https://picsum.photos/800/600'}
                        alt={topArticle.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    <div>
                        <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        {topArticle.title}
                        </h2>
                        <p className="text-muted-foreground text-lg mb-6">
                        {topArticle.description?.substring(0, 150) ?? 'No description available.'}...
                        </p>
                        <Button asChild size="lg">
                        <Link href={topArticle.link} target="_blank" rel="noopener noreferrer">
                            Read More <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        </Button>
                    </div>
                    </div>
                </section>
                </>
            ) : !error ? (
                <div className="text-center py-12 bg-card rounded-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">No Articles Found</h2>
                    <p className="text-muted-foreground">
                        We couldn't fetch any news for this category and district at the moment. Please try again later.
                    </p>
                </div>
            ) : null}

            {/* Article List */}
            {(initialArticles.length > 0) && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-headline text-3xl font-bold">
                             More in {category?.name}
                        </h2>
                    </div>
                    <ArticleList 
                        initialArticles={initialArticles} 
                        initialNextPage={nextPage}
                        category={categorySlug}
                        district={district}
                    />
                </section>
            )}
        </div>
    </MainLayout>
  );
}
