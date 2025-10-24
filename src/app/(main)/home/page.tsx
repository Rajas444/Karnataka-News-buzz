
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { getArticles } from '@/services/articles';
import TrendingNews from '@/components/news/TrendingNews';
import { getCategories } from '@/services/categories';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') || undefined;
  const districtId = searchParams.get('district') || undefined;
  const { t } = useTranslation();

  const [districts, setDistricts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [initialArticles, setInitialArticles] = useState<Article[]>([]);
  const [topArticle, setTopArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [districtsData, categoriesData, articlesData] = await Promise.all([
          getDistricts(),
          getCategories(),
          getArticles({
            pageSize: 11,
            categorySlug,
            districtId,
          }),
        ]);

        setDistricts(districtsData);
        setAllCategories(categoriesData);

        if (articlesData.articles.length > 0) {
          setTopArticle(articlesData.articles[0]);
          setInitialArticles(articlesData.articles.slice(1));
        } else {
          setTopArticle(null);
          setInitialArticles([]);
        }

      } catch (e: any) {
        const errorMessage = e.message || t('home_page.error_fetching_articles');
        console.error("[HomePage] CRITICAL ERROR fetching data:", e);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categorySlug, districtId, t]);

  const renderErrorState = () => (
    <div className="text-center bg-card p-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{t('home_page.error_loading_news')}</h1>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      
      <section className="mb-12">
          <FilterControls districts={districts} />
      </section>

      {loading && renderLoadingState()}
      {error && !loading && renderErrorState()}

      {!loading && !error && (
        <div className="space-y-12">
          {topArticle && (
              <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
                  <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <Image
                      src={topArticle.imageUrl || 'https://picsum.photos/seed/1/800/600'}
                      alt={topArticle.title}
                      fill
                      priority
                      className="object-cover"
                      data-ai-hint={topArticle['data-ai-hint']}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                  </div>
                  <div>
                      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight">
                      {topArticle.title}
                      </h1>
                      <p className="text-muted-foreground text-lg mb-6">
                        {(topArticle.seo?.metaDescription || topArticle.content || '').substring(0, 150)}...
                      </p>
                      <Button asChild size="lg">
                      <Link href={`/article/${topArticle.id}`}>
                          {t('home_page.read_more')} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      </Button>
                  </div>
                  </div>
              </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                  <h2 className="font-headline text-3xl font-bold">
                    {t('home_page.latest_news')}
                  </h2>
                  <section>
                      <ArticleList
                          initialArticles={initialArticles}
                          categorySlug={categorySlug}
                          districtId={districtId}
                          allCategories={allCategories}
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
      )}

    </div>
  );
}
