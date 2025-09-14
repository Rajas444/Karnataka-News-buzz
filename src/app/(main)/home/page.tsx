
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { getArticles } from '@/services/articles';
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import { getCategories } from '@/services/categories';
import CommunityHighlights from '@/components/posts/CommunityHighlights';
import { getDistricts } from '@/services/districts';
import { format, subDays } from 'date-fns';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
    date?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  let initialArticles: Article[] = [];
  let lastVisible: any | null = null;
  let error: string | null = null;
  let topArticle: Article | undefined;
  let categories = [];
  let districts = [];

  const category = searchParams?.category;
  const district = searchParams?.district; // District is for UI, logic is inside getArticles
  const selectedDate = searchParams?.date ? new Date(searchParams.date) : new Date();

  try {
      categories = await getCategories();
      districts = await getDistricts();
  } catch (e) {
      console.error("Failed to fetch filters data", e);
  }

  try {
    const response = await getArticles({ categoryId: category, date: selectedDate, pageSize: 11 });
    initialArticles = response.articles;
    lastVisible = response.lastVisible;
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
              Please select a different date or collect news for {format(selectedDate, 'PPP')}.
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
                    src={topArticle.imageUrl || 'https://picsum.photos/seed/1/800/600'}
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
                    {topArticle.content?.substring(0, 150) ?? 'No description available'}...
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
             {error && (
                <div className="text-center bg-card p-8 rounded-lg mb-8">
                    <h2 className="text-xl font-bold mb-2 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h2>
                    <p className="text-muted-foreground text-sm font-kannada">{error}</p>
                </div>
            )}
            <ArticleList
                initialArticles={otherArticles}
                initialLastVisible={lastVisible}
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
