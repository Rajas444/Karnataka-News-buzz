
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, District } from '@/lib/types';
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
  districts: District[];
}

export default function FilterControls({ categories, districts }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const selectedCategorySlug = searchParams.get('category') || 'general';
  const selectedDistrict = searchParams.get('district') || 'all';

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value) {
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
    const newCategory = slug === 'general' ? '' : slug;
    const queryString = createQueryString({ category: newCategory });
    const targetPath = newCategory ? `/categories/${newCategory}` : '/home';
    router.push(`${targetPath}?${queryString}`);
  };

  const handleDistrictChange = (district: string) => {
    const newDistrict = district === 'all' ? '' : district;
    router.push(`${pathname}?${createQueryString({ district: newDistrict })}`);
  };

  const allCategories = [{ id: 'general', name: 'General', slug: 'general' }, ...categories];
  const allDistricts = [{ id: 'all', name: 'All Karnataka' }, ...districts];

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
             <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">District</label>
                <Select onValueChange={handleDistrictChange} value={selectedDistrict}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a district (e.g., Bagalkote, Bengaluru)" />
                    </SelectTrigger>
                    <SelectContent>
                         {allDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id === 'all' ? 'all' : district.name}>
                                {district.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
  );
}
