
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import type { Category, District } from '@/lib/types';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  
  const handleCategoryChange = (slug: string) => {
      const currentQuery = new URLSearchParams(searchParams.toString()).toString();
      if (slug === 'general') {
          router.push(`/home?${currentQuery}`);
      } else {
          router.push(`/categories/${slug}?${currentQuery}`);
      }
  }

  const allCategories = [{ id: 'general', name: 'General', slug: 'general' }, ...categories];

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
                <Select onValueChange={handleCategoryChange} defaultValue={selectedCategorySlug}>
                    <SelectTrigger className="w-full">
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
