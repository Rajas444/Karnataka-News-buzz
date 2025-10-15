
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { getArticles } from '@/services/articles';
import TrendingNews from '@/components/news/TrendingNews';

type HomePageProps = {
  searchParams: {
    category?: string;
    district?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const categorySlug = searchParams?.category;
  const districtId = searchParams?.district;

  let districts = [];
  let initialArticles: Article[] = [];
  let topArticle: Article | null = null;
  let error: string | null = null;

  try {
    // Fetch districts for the filter controls.
    districts = await getDistricts();
    
    // The getArticles service now handles all fallback logic internally.
    const { articles } = await getArticles({
      pageSize: 11, // Fetch one extra for the top article
      categorySlug,
      districtId,
    });

    if (articles.length > 0) {
      topArticle = articles[0];
      initialArticles = articles.slice(1);
    }

  } catch (e: any) {
    error = e.message || 'An unknown error occurred while fetching articles.';
    console.error("Error on HomePage:", error);
    // In case of a catastrophic error, we can still try to render something.
    initialArticles = [];
    topArticle = null;
  }

  const renderErrorState = () => (
    <div className="text-center bg-card p-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h1>
      <p className="text-muted-foreground font-kannada">{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      
      <section className="mb-12">
          <FilterControls districts={districts} />
      </section>

      {error && renderErrorState()}

      {!error && (
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
                      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight font-kannada">
                      {topArticle.title}
                      </h1>
                      <p className="text-muted-foreground text-lg mb-6 font-kannada">
                        {(topArticle.seo?.metaDescription || topArticle.content || '').substring(0, 150)}...
                      </p>
                      <Button asChild size="lg">
                      <Link href={`/article/${topArticle.id}`}>
                          ಮುಂದೆ ಓದಿ <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      </Button>
                  </div>
                  </div>
              </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                  <h2 className="font-headline text-3xl font-bold">
                    ಇತ್ತೀಚಿನ ಸುದ್ದಿ
                  </h2>
                  <section>
                      <ArticleList
                          initialArticles={initialArticles}
                          categorySlug={categorySlug}
                          districtId={districtId}
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
