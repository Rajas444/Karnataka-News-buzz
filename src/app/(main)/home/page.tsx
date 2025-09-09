
import Image from 'next/image';
import Link from 'next/link';
import { placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';
import ArticleCard from '@/components/news/ArticleCard';
import FilterControls from '@/components/news/FilterControls';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { fetchNews } from '@/services/gnews';
import type { Article } from '@/lib/types';

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
  
  const articles = await fetchNews(category, districtName);

  const topArticle: Article | undefined = articles[0];
  const recentArticles = articles.slice(1, 5);

  if (!topArticle) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Articles Found</h1>
            <p className="text-muted-foreground">
                We couldn&apos;t fetch any news at the moment. Please try again later.
            </p>
        </div>
    )
  }

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
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {topArticle.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
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
            {searchParams?.category || searchParams?.district ? 'Filtered News' : 'Recent News'}
          </h2>
          {(searchParams?.category || searchParams?.district) && (
            <Button variant="ghost" asChild>
              <Link href="/home">Clear Filters</Link>
            </Button>
          )}
        </div>
        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground">No articles found for the selected filters.</p>
          </div>
        )}
      </section>

      <div className="text-center mt-12">
        <Button variant="outline" size="lg">Load More Articles</Button>
      </div>
    </div>
  );
}
