
import Image from 'next/image';
import Link from 'next/link';
import { placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { fetchNews } from '@/services/news';
import type { NewsdataArticle } from '@/lib/types';
import ArticleList from '@/components/news/ArticleList';
import FilterControls from '@/components/news/FilterControls';
import { getCategories } from '@/services/categories';
import { getDistricts } from '@/services/districts';
import KarnatakaMap from '@/components/news/KarnatakaMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type HomePageProps = {
  searchParams?: {
    category?: string;
    district?: string;
  };
};


export default async function HomePage({ searchParams }: HomePageProps) {
  let initialArticles: NewsdataArticle[] = [];
  let nextPage: string | null = null;
  let error: string | null = null;
  let topArticle: NewsdataArticle | undefined;
  let categories, districts = [];

  const category = searchParams?.category;
  const districtId = searchParams?.district;

  try {
      [categories, districts] = await Promise.all([
          getCategories(),
          getDistricts()
      ]);
  } catch (e) {
      console.error("Failed to fetch filters data", e);
  }

  const districtName = districts.find(d => d.id === districtId)?.name;


  try {
    const response = await fetchNews(category, districtName);
    initialArticles = response.articles;
    nextPage = response.nextPage;
    topArticle = initialArticles[0];
  } catch (e: any) {
    error = e.message || 'An unknown error occurred.';
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 font-kannada">ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</h1>
        <p className="text-muted-foreground font-kannada">
          {error}
        </p>
      </div>
    );
  }

  if (!topArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
         <section className="mb-8">
          <FilterControls categories={categories} districts={districts} />
        </section>
        <div className="text-center bg-card p-8 rounded-lg">
            <h1 className="text-2xl font-bold mb-4 font-kannada">ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ</h1>
            <p className="text-muted-foreground font-kannada">
              ಈ ಸಮಯದಲ್ಲಿ ನಾವು ಯಾವುದೇ ಸುದ್ದಿಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.
            </p>
        </div>
      </div>
    );
  }

  const otherArticles = initialArticles.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <Image
              src={topArticle.image_url || 'https://picsum.photos/seed/1/800/600'}
              alt={topArticle.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
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

      {/* Featured Section with Map and Filters */}
      <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">District News Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground mb-4">Click on a district to view its news.</p>
                      <KarnatakaMap districts={districts} />
                  </CardContent>
              </Card>
               <div className="lg:col-span-1">
                   <FilterControls categories={categories} districts={districts} />
              </div>
          </div>
      </section>

      {/* Recent Articles */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-3xl font-bold">
            {districtName ? `News from ${districtName}` : 'Recent News'}
          </h2>
        </div>
        <ArticleList
          initialArticles={otherArticles}
          initialNextPage={nextPage}
          category={category}
          districtName={districtName}
        />
      </section>
    </div>
  );
}
