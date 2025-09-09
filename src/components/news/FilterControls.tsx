
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
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
import { Check, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
import { placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';


interface FilterControlsProps {
  categories: Category[];
  districts: District[];
}

export default function FilterControls({ categories, districts }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [openCategory, setOpenCategory] = useState(false)
  const [openDistrict, setOpenDistrict] = useState(false)

  // On a category page like /categories/politics, the category comes from the path
  const pathCategory = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2] 
    : null;

  const selectedCategorySlug = pathCategory || searchParams.get('category') || 'general';
  const selectedDistrictId = searchParams.get('district') || 'all';

  const selectedCategory = placeholderCategories.find(c => c.slug === selectedCategorySlug);
  const selectedDistrict = placeholderDistricts.find(d => d.id === selectedDistrictId);


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
        {/* Category Filter */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-[200px] justify-between"
            >
              {selectedCategory ? selectedCategory.name : "Select category..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="general"
                    onSelect={() => {
                      handleFilterChange('category', 'general');
                      setOpenCategory(false);
                    }}
                  >
                     <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategorySlug === 'general' ? "opacity-100" : "opacity-0"
                        )}
                      />
                    All Categories
                  </CommandItem>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={(currentValue) => {
                        handleFilterChange('category', category.slug);
                        setOpenCategory(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategorySlug === category.slug ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* District Filter */}
        <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openDistrict}
              className="w-[200px] justify-between"
            >
              {selectedDistrict ? selectedDistrict.name : "Select district..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search district..." />
              <CommandList>
                <CommandEmpty>No district found.</CommandEmpty>
                <CommandGroup>
                   <CommandItem
                      value="all"
                      onSelect={() => {
                        handleFilterChange('district', 'all');
                        setOpenDistrict(false);
                      }}
                    >
                       <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDistrictId === 'all' ? "opacity-100" : "opacity-0"
                          )}
                        />
                      All Districts
                    </CommandItem>
                  {districts.map((district) => (
                    <CommandItem
                      key={district.id}
                      value={district.name}
                      onSelect={() => {
                        handleFilterChange('district', district.id);
                        setOpenDistrict(false);
                      }}
                    >
                       <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDistrictId === district.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      {district.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

