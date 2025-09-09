
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Category, District } from '@/lib/types';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { placeholderCategories } from '@/lib/placeholder-data';


interface FilterControlsProps {
  categories: Category[];
  districts: District[];
}

export default function FilterControls({ categories, districts }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // On a category page like /categories/politics, the category comes from the path
  const pathCategory = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2] 
    : null;

  const selectedCategory = pathCategory || searchParams.get('category') || 'general';
  const selectedDistrict = searchParams.get('district') || 'all';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
       // If a category is selected via path, we don't want to add it to query params
      if (name === 'category' && pathCategory) {
          // just update the district param if it exists
           if (value === 'all' || (name === 'category' && value === 'general')) {
               params.delete(name)
           } else {
               params.set(name, value)
           }
      } else {
        if (value === 'all' || (name === 'category' && value === 'general')) {
            params.delete(name);
        } else {
            params.set(name, value);
        }
      }

      return params.toString();
    },
    [searchParams, pathCategory]
  );
  
  const handleFilterChange = (type: 'category' | 'district', value: string) => {
      if (type === 'category' && !pathCategory) {
          const newPath = value === 'general' ? '/home' : `/categories/${value}`;
          const params = new URLSearchParams(searchParams.toString());
          params.delete('category'); // remove from query if we're moving to path-based
          const queryString = params.toString();
          router.push(newPath + (queryString ? '?' + queryString : ''));
      } else {
         router.push(pathname + '?' + createQueryString(type, value));
      }
  };


  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-lg">Filters</h3>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Category: {placeholderCategories.find(c => c.slug === selectedCategory)?.name || 'General'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
             <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={selectedCategory} onValueChange={(value) => handleFilterChange('category', value)}>
              <DropdownMenuRadioItem value="general">All Categories</DropdownMenuRadioItem>
              {categories.map((category) => (
                <DropdownMenuRadioItem key={category.id} value={category.slug}>
                  {category.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              District: {districts.find(d => d.id === selectedDistrict)?.name || 'All'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by District</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={selectedDistrict} onValueChange={(value) => handleFilterChange('district', value)}>
              <DropdownMenuRadioItem value="all">All Districts</DropdownMenuRadioItem>
              {districts.map((district) => (
                <DropdownMenuRadioItem key={district.id} value={district.id}>
                  {district.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
