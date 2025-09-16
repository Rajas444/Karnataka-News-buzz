
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import { getCategories } from '@/services/categories';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { fetchAndStoreNews } from '@/services/news';
import { getArticles } from '@/services/articles';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  let initialArticles: Article[] = [];
  let error: string | null = null;
  let categories = [];
  let districts = [];

  const category = searchParams?.category;
  const district = searchParams?.district;

  try {
      categories = await getCategories();
      districts = await getDistricts();
  } catch (e) {
      console.error("Failed to fetch filters data", e);
  }

  try {
    // First, try to fetch fresh news from the API and store it
    await fetchAndStoreNews(category, district);
  } catch (e: any) {
    // This might fail if the API limit is reached, which is okay.
    // We will fall back to showing what's in the database.
    console.warn("Could not fetch fresh news, will show existing.", e.message);
  }

  try {
    // Now, fetch articles from our database
    initialArticles = await getArticles({ category, district, pageSize: 20 });
  } catch (e: any) {
     error = e.message || 'An unknown error occurred while fetching articles from the database.';
  }
  
  const topArticle = initialArticles.length > 0 ? initialArticles[0] : null;
  const otherArticles = initialArticles.length > 1 ? initialArticles.slice(1) : [];

  const renderErrorState = () => (
    <div className="text-center bg-card p-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h1>
      <p className="text-muted-foreground font-kannada">{error}</p>
    </div>
  );

  const renderEmptyState = () => (
     <div className="text-center bg-card p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 font-kannada">ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ</h1>
        <p className="text-muted-foreground font-kannada">
          Please try different filter options or check back later.
        </p>
    </div>
  );


  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Filters */}
      <section className="mb-12">
          <FilterControls categories={categories} districts={districts} />
      </section>

       {error && <div className="mb-8">{renderErrorState()}</div>}

      <div className="space-y-12">
        {/* Hero Section */}
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

        {/* Recent Articles */}
        <section>
            <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-3xl font-bold">
                Recent News
            </h2>
            </div>
            {!error && initialArticles.length > 0 ? (
                <ArticleList
                    initialArticles={otherArticles}
                    category={category}
                    district={district}
                />
            ) : !error ? (
                renderEmptyState()
            ) : null}
        </section>

        {/* Community Highlights */}
        <section>
          <CommunityHighlights />
        </section>
      </div>

    </div>
  );
}
