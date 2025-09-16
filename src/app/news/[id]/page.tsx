
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { extractArticleContent } from '@/ai/flows/extract-article-content';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Facebook, Twitter, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { NewsdataArticle } from '@/lib/types';
import ShareButtons from './ShareButtons';

async function getArticleDetails(articleId: string): Promise<NewsdataArticle | null> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) return null;

    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('qInMeta', articleId);

    try {
        const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
        const data = await response.json();
        if (data.status === 'success' && data.results.length > 0) {
            return data.results[0];
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch article details:', error);
        return null;
    }
}


type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = await getArticleDetails(params.id);

    if (!article) {
        return {
            title: 'Article Not Found',
            description: 'The requested article could not be found.',
        }
    }

    return {
        title: `${article.title} | Karnataka News Pulse`,
        description: article.description || 'Latest news from Karnataka.',
        openGraph: {
            title: article.title,
            description: article.description || '',
            images: article.image_url ? [article.image_url] : [],
        },
    }
}


export default async function NewsArticlePage({ params }: Props) {
    const { id } = params;

    const article = await getArticleDetails(id);

    if (!article) {
        notFound();
    }

    let articleContent = article.description || 'Full content could not be loaded.';

    try {
        // Fetch full content only if the description is short
        if (article.link && (!article.description || article.description.length < 200)) {
            const extracted = await extractArticleContent({ url: article.link });
            articleContent = extracted.content;
        }
    } catch (error) {
        console.error("Failed to extract full article content:", error);
        // Fallback to description if extraction fails
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link href="/home">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
            <article className="space-y-8">
                <header className="space-y-4">
                    <h1 className="text-4xl font-bold leading-tight tracking-tighter font-headline">
                        {article.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>By {article.source_id || 'Unknown Author'}</span>
                        <span>&bull;</span>
                        <span>{format(new Date(article.pubDate), 'PPP')}</span>
                    </div>
                </header>

                {article.image_url && (
                    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={article.image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 896px"
                        />
                    </div>
                )}

                <Card>
                    <CardContent className="p-6">
                        <div
                            className="prose prose-lg max-w-none font-body"
                            dangerouslySetInnerHTML={{ __html: articleContent.replace(/\n/g, '<br />') }}
                        />
                    </CardContent>
                </Card>

                <footer className="space-y-4">
                    <div className="flex items-center justify-between">
                         <p className="text-sm text-muted-foreground">
                           Source: <Link href={article.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{article.source_id}</Link>
                        </p>
                        <ShareButtons url={article.link} title={article.title} />
                    </div>
                </footer>
            </article>
        </div>
    );
}
