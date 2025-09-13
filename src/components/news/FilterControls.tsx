
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { useCallback } from 'react';

interface FilterControlsProps {
  categories: Category[];
}

export default function FilterControls({ categories }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use category from URL slug if available, otherwise from search params
  const categorySlugFromPath = pathname.startsWith('/categories/') ? pathname.split('/')[2] : null;
  const selectedCategorySlug = categorySlugFromPath || searchParams.get('category') || 'general';

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== 'general') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (slug: string) => {
    const isGeneral = slug === 'general';
    const targetPath = isGeneral ? '/home' : `/categories/${slug}`;
    const newQueryString = createQueryString({ category: isGeneral ? null : slug });
    router.push(`${targetPath}?${newQueryString}`);
  };

  const allCategories = [{ id: 'general', name: 'All Categories', slug: 'general' }, ...categories];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">Filter News</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                 <label className="text-sm font-medium mb-2 block">Category</label>
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
