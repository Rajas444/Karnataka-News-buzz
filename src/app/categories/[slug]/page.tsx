
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import MainLayout from '@/app/(main)/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/services/categories';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import FilterControls from '@/components/news/FilterControls';
import { getDistricts } from '@/services/districts';
import { fetchAndStoreNews } from '@/services/news';
import { getArticles } from '@/services/articles';


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

  let articles: Article[] = [];
  let error: string | null = null;
  let categories = [];
  let districts = [];

  try {
      categories = await getCategories();
      districts = await getDistricts();
  } catch(e) {
      console.error("Failed to load filter data", e);
  }

  const category = categories.find(c => c.slug === categorySlug);

  try {
    // Attempt to fetch and store new articles
    await fetchAndStoreNews(category?.slug, district);
  } catch (e: any) {
    console.warn("Could not fetch fresh news for category, will show existing.", e.message);
  }

  try {
    // Fetch from our database
    articles = await getArticles({ category: category?.slug, district, pageSize: 20 });
  } catch (e: any) {
      error = e.message || 'An unknown error occurred while fetching articles.';
  }

  const topArticle: Article | undefined = articles[0];
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
                        src={topArticle.imageUrl || 'https://picsum.photos/800/600'}
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
                        {(topArticle.seo.metaDescription || topArticle.content).substring(0, 150)}...
                        </p>
                        <Button asChild size="lg">
                        <Link href={`/article/${topArticle.id}`}>
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
                        We couldn't find any news for this category. Please try a different filter.
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
                        category={category?.slug}
                        district={district}
                    />
                </section>
            )}
        </div>
    </MainLayout>
  );
}
