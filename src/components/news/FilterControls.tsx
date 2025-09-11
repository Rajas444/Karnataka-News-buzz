
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
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

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
        <CardContent className="flex flex-col gap-4">
             {/* Category Filter */}
            <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select onValueChange={handleCategoryChange} value={selectedCategorySlug}>
                    <SelectTrigger className="w-full md:w-1/2">
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
            <div className="flex-1 space-y-2">
                 <label className="text-sm font-medium mb-2 block">District</label>
                 <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <div className="flex w-max space-x-2 pb-2">
                        {allDistricts.map((district) => (
                            <Button 
                                key={district.id}
                                variant={district.id === selectedDistrictId ? 'default' : 'outline'}
                                onClick={() => handleDistrictChange(district.id)}
                            >
                                {district.name}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                 </ScrollArea>
            </div>
        </CardContent>
    </Card>
  );
}
