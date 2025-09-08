'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { placeholderDistricts } from '@/lib/placeholder-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { District } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import DistrictDialog from '@/components/admin/DistrictDialog';

export default function ManageDistrictsPage() {
  const [districts, setDistricts] = useState<District[]>(placeholderDistricts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedDistrict(null);
    setDialogOpen(true);
  };

  const handleEdit = (district: District) => {
    setSelectedDistrict(district);
    setDialogOpen(true);
  };

  const handleDelete = (district: District) => {
    setSelectedDistrict(district);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDistrict) {
      setDistricts(districts.filter((d) => d.id !== selectedDistrict.id));
      toast({
        title: 'District Deleted',
        description: `The district "${selectedDistrict.name}" has been deleted.`,
      });
    }
    setDeleteDialogOpen(false);
    setSelectedDistrict(null);
  };

  const handleSave = (districtData: Omit<District, 'id'> & { id?: string }) => {
    if (districtData.id) {
      // Edit
      setDistricts(
        districts.map((d) => (d.id === districtData.id ? { ...d, ...districtData } : d))
      );
      toast({
        title: 'District Updated',
        description: `The district "${districtData.name}" has been updated.`,
      });
    } else {
      // Add
      const newDistrict: District = { ...districtData, id: new Date().toISOString() };
      setDistricts([...districts, newDistrict]);
      toast({
        title: 'District Added',
        description: `The district "${districtData.name}" has been added.`,
      });
    }
    setDialogOpen(false);
    setSelectedDistrict(null);
  };

  // This is a client-side only random number for display purposes.
  const [articleCounts] = useState(() => {
    const counts = new Map<string, number>();
    placeholderDistricts.forEach(dist => {
      counts.set(dist.id, Math.floor(Math.random() * 100));
    });
    return counts;
  });

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Districts</h1>
          <p className="text-muted-foreground">Add, edit, or delete districts of Karnataka.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Districts</CardTitle>
              <CardDescription>A list of all districts in the portal.</CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAdd}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add District
              </span>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Article Count</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell>{articleCounts.get(district.id) || 0}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(district)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(district)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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

      <DistrictDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        district={selectedDistrict}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the district
              &quot;{selectedDistrict?.name}&quot;.
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
