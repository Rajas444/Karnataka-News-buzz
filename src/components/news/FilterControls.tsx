
'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FilterControlsProps {
  categories: Category[];
}

export default function FilterControls({ categories }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const selectedCategorySlug = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2]
    : 'general';

  const handleCategoryChange = (slug: string) => {
      const targetPath = slug === 'general' ? '/home' : `/categories/${slug}`;
      router.push(targetPath);
  }

  const allCategories = [{ id: 'general', name: 'General', slug: 'general' }, ...categories];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">Filter by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <Select onValueChange={handleCategoryChange} value={selectedCategorySlug}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
  );
}
