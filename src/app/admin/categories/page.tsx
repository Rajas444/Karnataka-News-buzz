
'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { placeholderCategories } from '@/lib/placeholder-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import CategoryDialog from '@/components/admin/CategoryDialog';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(placeholderCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      setCategories(categories.filter((c) => c.id !== selectedCategory.id));
      toast({
        title: 'Category Deleted',
        description: `The category "${selectedCategory.name}" has been deleted.`,
      });
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleSave = (categoryData: Omit<Category, 'id'> & { id?: string }) => {
    if (categoryData.id) {
      // Edit
      setCategories(
        categories.map((c) => (c.id === categoryData.id ? { ...c, ...categoryData } : c))
      );
      toast({
        title: 'Category Updated',
        description: `The category "${categoryData.name}" has been updated.`,
      });
    } else {
      // Add
      const newCategory: Category = { ...categoryData, id: new Date().toISOString() };
      setCategories([...categories, newCategory]);
      toast({
        title: 'Category Added',
        description: `The category "${categoryData.name}" has been added.`,
      });
    }
    setDialogOpen(false);
    setSelectedCategory(null);
  };
  
  // This is a client-side only random number for display purposes.
  const [articleCounts] = useState(() => {
    const counts = new Map<string, number>();
    placeholderCategories.forEach(cat => {
      counts.set(cat.id, Math.floor(Math.random() * 100));
    });
    return counts;
  });

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Categories</h1>
          <p className="text-muted-foreground">Add, edit, or delete news categories.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>
                A list of all categories in the portal.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAdd}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Category
              </span>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Article Count</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{articleCounts.get(category.id) || 0}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(category)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(category)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        category={selectedCategory}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              &quot;{selectedCategory?.name}&quot;.
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
