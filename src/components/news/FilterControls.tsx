
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, District } from '@/lib/types';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterControlsProps {
  categories: Category[];
  districts: District[];
}

export default function FilterControls({ categories, districts }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const categorySlugFromPath = pathname.startsWith('/categories/') ? pathname.split('/')[2] : null;
  const selectedCategorySlug = categorySlugFromPath || searchParams.get('category') || 'general';
  const selectedDistrict = searchParams.get('district') || 'all';
  const selectedDate = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();

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

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const newQueryString = createQueryString({ date: format(date, 'yyyy-MM-dd') });
    router.push(`${pathname}?${newQueryString}`);
  };

  const handleCategoryChange = (slug: string) => {
    const isGeneral = slug === 'general';
    const targetPath = isGeneral ? '/home' : `/categories/${slug}`;
    const newQueryString = createQueryString({ category: isGeneral ? null : slug });
    router.push(`${targetPath}?${newQueryString}`);
  };

  const handleDistrictChange = (slug: string) => {
     const newQueryString = createQueryString({ district: slug });
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
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                 <label className="text-sm font-medium mb-2 block">Date</label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(day) => day > new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
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
             <div>
                 <label className="text-sm font-medium mb-2 block">District</label>
                <Select onValueChange={handleDistrictChange} value={selectedDistrict}>
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
