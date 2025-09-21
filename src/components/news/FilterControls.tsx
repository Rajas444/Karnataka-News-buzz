
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

  const handleFilterChange = (type: 'category' | 'district', value: string) => {
    let newQueryString;
    if (type === 'category') {
      newQueryString = createQueryString({ category: value, district: searchParams.get('district') });
    } else { // district
      newQueryString = createQueryString({ category: searchParams.get('category'), district: value });
    }
    
    router.push(`/home?${newQueryString}`);
  };


  const allCategories = [{ id: 'general', name: 'All Categories', slug: 'general' }, ...categories];
  const allDistricts = [{ id: 'all', name: 'All Districts' }, ...districts];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">Filter News</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                 <label className="text-sm font-medium mb-2 block">Category</label>
                <Select onValueChange={(value) => handleFilterChange('category', value)} value={selectedCategorySlug}>
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
             <div>
                 <label className="text-sm font-medium mb-2 block">District</label>
                <Select onValueChange={(value) => handleFilterChange('district', value)} value={selectedDistrict}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {allDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
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
