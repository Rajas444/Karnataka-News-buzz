
'use client';

import { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FilePlus2, ListFilter, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Article } from '@/lib/types';
import { getArticles, deleteArticle } from '@/services/articles';

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchArticles() {
      try {
        // Fetch all articles without pagination for the admin page
        const { articles: fetchedArticles } = await getArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        toast({ title: 'Error fetching articles', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [toast]);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (articleToDelete) {
      try {
        await deleteArticle(articleToDelete.id);
        setArticles(articles.filter(a => a.id !== articleToDelete.id));
        toast({
          title: 'Article Deleted',
          description: `The article "${articleToDelete.title}" has been deleted.`,
        });
      } catch (error) {
        toast({ title: 'Error deleting article', variant: 'destructive' });
      }
    }
    setArticleToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Articles</h1>
          <p className="text-muted-foreground">Here you can create, edit, and manage all news articles.</p>
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search articles..." className="pl-8" />
                  </div>
                  <div className="flex items-center gap-2">
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Filter
                          </span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem checked>
                          Published
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem>Scheduled</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" asChild className="h-8 gap-1">
                          <Link href="/admin/articles/new">
                              <FilePlus2 className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Add Article
                              </span>
                          </Link>
                      </Button>
                  </div>
                </div>
            </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published At</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {articles.map((article) => (
                    <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                            {article.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>{article.publishedAt ? format(new Date(article.publishedAt), 'PPP') : 'Not Published'}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/articles/edit/${article.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(article)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article
              &quot;{articleToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
