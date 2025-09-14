
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import type { NewsdataArticle } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import { getCategories } from '@/services/categories';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { format } from 'date-fns';
import { fetchNews } from '@/services/news';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
    date?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  let initialArticles: NewsdataArticle[] = [];
  let nextPage: string | null = null;
  let error: string | null = null;
  let topArticle: NewsdataArticle | undefined;
  let categories = [];
  let districts = [];

  const category = searchParams?.category;
  const district = searchParams?.district;
  const selectedDate = searchParams?.date ? new Date(searchParams.date) : new Date();

  try {
      categories = await getCategories();
      districts = await getDistricts();
  } catch (e) {
      console.error("Failed to fetch filters data", e);
  }

  try {
    const response = await fetchNews(category, district, null, selectedDate);
    initialArticles = response.articles;
    nextPage = response.nextPage;
    topArticle = initialArticles[0];
  } catch (e: any) {
    error = e.message || 'An unknown error occurred.';
  }

  if (error && initialArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <FilterControls categories={categories} districts={districts} />
        </section>
        <div className="text-center bg-card p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h1>
          <p className="text-muted-foreground font-kannada">
            {error}
          </p>
        </div>
      </div>
    );
  }
  
  if (!topArticle && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
         <section className="mb-8">
          <FilterControls categories={categories} districts={districts} />
        </section>
        <div className="text-center bg-card p-8 rounded-lg">
            <h1 className="text-2xl font-bold mb-4 font-kannada">ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ</h1>
            <p className="text-muted-foreground font-kannada">
              Please select a different date or check your news API.
            </p>
        </div>
      </div>
    );
  }

  const otherArticles = initialArticles.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Filters */}
      <section className="mb-12">
          <FilterControls categories={categories} districts={districts} />
      </section>

      <div className="space-y-12">
        {/* Hero Section */}
        {topArticle && (
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                    <Image
                    src={topArticle.image_url || 'https://picsum.photos/seed/1/800/600'}
                    alt={topArticle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>
                <div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight font-kannada">
                    {topArticle.title}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-6 font-kannada">
                    {topArticle.description?.substring(0, 150) ?? 'No description available'}...
                    </p>
                    <Button asChild size="lg">
                    <Link href={topArticle.link} target="_blank" rel="noopener noreferrer">
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
             {error && (
                <div className="text-center bg-card p-8 rounded-lg mb-8">
                    <h2 className="text-xl font-bold mb-2 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h2>
                    <p className="text-muted-foreground text-sm font-kannada">{error}</p>
                </div>
            )}
            <ArticleList
                initialArticles={otherArticles}
                initialNextPage={nextPage}
                category={category}
                district={district}
                date={selectedDate}
            />
        </section>

        {/* Community Highlights */}
        <section>
          <CommunityHighlights />
        </section>
      </div>

    </div>
  );
}
