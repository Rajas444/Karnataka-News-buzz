

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Article, Category } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import { getCategories } from '@/services/categories';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { getArticles } from '@/services/articles';
import TrendingNews from '@/components/news/TrendingNews';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const categorySlug = searchParams?.category;
  const districtId = searchParams?.district;

  let categories: Category[] = [];
  let districts = [];
  
  try {
    [categories, districts] = await Promise.all([getCategories(), getDistricts()]);
  } catch (e) {
    console.error("Failed to fetch filters data", e);
  }

  const { articles, lastVisibleDocId } = await getArticles({
    pageSize: 10,
    categorySlug: categorySlug,
    districtId: districtId,
  });

  const topArticle = articles.length > 0 ? articles[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      
      <section className="mb-12">
          <FilterControls categories={categories} districts={districts} />
      </section>

      <div className="space-y-12">
        {topArticle && (
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                    <Image
                    src={topArticle.imageUrl || 'https://picsum.photos/seed/1/800/600'}
                    alt={topArticle.title}
                    fill
                    className="object-cover"
                    data-ai-hint={topArticle['data-ai-hint']}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>
                <div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight font-kannada">
                    {topArticle.title}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-6 font-kannada">
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-headline text-3xl font-bold">
                            Recent News
                        </h2>
                    </div>
                    <ArticleList
                        initialArticles={articles}
                        categorySlug={categorySlug}
                        districtId={districtId}
                        initialLastVisibleDocId={lastVisibleDocId}
                    />
                </section>
            </div>
            <div className="lg:col-span-1 space-y-12">
                <section>
                    <TrendingNews />
                </section>

                <section>
                <CommunityHighlights />
                </section>
            </div>
        </div>
      </div>

    </div>
  );
}
