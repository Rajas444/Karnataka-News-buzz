
import ArticleForm from '@/components/admin/ArticleForm';

export default function NewArticlePage() {
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Article</h1>
            <p className="text-muted-foreground">Fill out the details below to add a new article to the portal.</p>
        </div>
        <ArticleForm />
    </div>
  );
}
