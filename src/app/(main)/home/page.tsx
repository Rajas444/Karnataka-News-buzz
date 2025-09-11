
import Image from 'next/image';
import Link from 'next/link';
import { placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';
import FilterControls from '@/components/news/FilterControls';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { fetchNews } from '@/services/news';
import type { Article } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const category = searchParams?.category || 'general';
  const district = searchParams?.district;

  const districtName = placeholderDistricts.find(d => d.id === district)?.name;
  
  const { articles, nextPage } = await fetchNews(category, districtName, null, 'kannada');

  const topArticle: Article | undefined = articles[0];
  const initialArticles = articles.slice(1);

  if (!topArticle) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4 font-kannada">ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ</h1>
            <p className="text-muted-foreground font-kannada">
                ಈ ಸಮಯದಲ್ಲಿ ನಾವು ಯಾವುದೇ ಸುದ್ದಿಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.
            </p>
        </div>
    )
  }

  const hasFilters = !!(searchParams?.category || searchParams?.district);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <Image
              src={topArticle.imageUrl || 'https://picsum.photos/800/600'}
              alt={topArticle.title}
              fill
              className="object-cover"
              data-ai-hint={topArticle['data-ai-hint']}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight font-kannada">
              {topArticle.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-6 font-kannada">
              {topArticle.content.substring(0, 150)}...
            </p>
            <Button asChild size="lg">
              <Link href={`/article/${topArticle.id}`} rel="noopener noreferrer">
                Read More <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <FilterControls categories={placeholderCategories} districts={placeholderDistricts} />
      </section>

      {/* Recent Articles */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-3xl font-bold">
            {hasFilters ? 'Filtered News' : 'Recent News'}
          </h2>
          {hasFilters && (
            <Button variant="ghost" asChild>
              <Link href="/home">Clear Filters</Link>
            </Button>
          )}
        </div>
         <ArticleList 
            initialArticles={initialArticles} 
            initialNextPage={nextPage}
            category={category}
            district={district}
            districtName={districtName}
        />
      </section>
    </div>
  );
}
