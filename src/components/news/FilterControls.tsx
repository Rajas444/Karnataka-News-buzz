
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, District } from '@/lib/types';
import { Filter, MapPin } from 'lucide-react';
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
  
  // Use category from URL slug if available, otherwise from search params
  const categorySlugFromPath = pathname.startsWith('/categories/') ? pathname.split('/')[2] : null;
  const selectedCategorySlug = categorySlugFromPath || searchParams.get('category') || 'general';
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

  const handleCategoryChange = (slug: string) => {
    // When changing category, we decide the base path and the query string.
    const isGeneral = slug === 'general';
    const targetPath = isGeneral ? '/home' : `/categories/${slug}`;
    // We preserve the district filter when changing category.
    const newQueryString = createQueryString({ category: isGeneral ? null : slug, district: selectedDistrict });
    router.push(`${targetPath}?${newQueryString}`);
  };

  const handleDistrictChange = (districtName: string) => {
    // When changing district, we stay on the current path (either /home or /categories/slug)
    // and just update the search params.
    const isAllDistricts = districtName === 'all';
    const newQueryString = createQueryString({ district: isAllDistricts ? null : districtName });
    router.push(`${pathname}?${newQueryString}`);
  };

  const allCategories = [{ id: 'general', name: 'All Categories', slug: 'general' }, ...categories];
  const allDistricts = [{ id: 'all', name: 'All Districts' }, ...districts];

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
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select District" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {allDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.name === 'All Districts' ? 'all' : district.name}>
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
