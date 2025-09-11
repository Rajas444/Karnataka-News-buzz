
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
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

interface FilterControlsProps {
  categories: Category[];
  districts: District[];
}

export default function FilterControls({ categories, districts }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const selectedCategorySlug = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2]
    : 'general';
  
  const selectedDistrictId = searchParams.get('district') || 'all';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleCategoryChange = (slug: string) => {
      const currentDistrict = searchParams.get('district');
      const queryString = currentDistrict ? createQueryString('district', currentDistrict) : '';
      const targetPath = slug === 'general' ? '/home' : `/categories/${slug}`;
      router.push(`${targetPath}?${queryString}`);
  }

  const handleDistrictChange = (districtId: string) => {
      router.push(pathname + '?' + createQueryString('district', districtId))
  }

  const allCategories = [{ id: 'general', name: 'General', slug: 'general' }, ...categories];
  const allDistricts = [{ id: 'all', name: 'All Districts' }, ...districts];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
             {/* Category Filter */}
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
             {/* District Filter */}
            <div className="flex-1">
                 <label className="text-sm font-medium mb-2 block">District</label>
                 <Select onValueChange={handleDistrictChange} value={selectedDistrictId}>
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
