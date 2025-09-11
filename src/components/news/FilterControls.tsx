
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
import { Check, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
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
  const pathCategorySlug = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2] 
    : null;

  const selectedCategorySlug = pathCategorySlug || searchParams.get('category') || 'general';
  const selectedDistrictId = searchParams.get('district') || 'all';

  const [currentCategory, setCurrentCategory] = useState(categories.find(c => c.slug === selectedCategorySlug));
  const [currentDistrict, setCurrentDistrict] = useState(districts.find(d => d.id === selectedDistrictId));
  
   useEffect(() => {
    setCurrentCategory(categories.find(c => c.slug === selectedCategorySlug));
    setCurrentDistrict(districts.find(d => d.id === selectedDistrictId));
  }, [selectedCategorySlug, selectedDistrictId, categories, districts]);


  const createQueryString = useCallback(
    (updates: { name: string; value: string }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      updates.forEach(({ name, value }) => {
        if (value === 'all' || (name === 'category' && value === 'general')) {
            params.delete(name);
        } else {
            params.set(name, value);
        }
      });

      return params.toString();
    },
    [searchParams]
  );
  
  const handleCategoryChange = (slug: string) => {
    const newPath = slug === 'general' ? '/home' : `/categories/${slug}`;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const queryString = params.toString();
    router.push(newPath + (queryString ? '?' + queryString : ''));
  };

  const handleDistrictChange = (districtId: string) => {
    const queryString = createQueryString([{ name: 'district', value: districtId }]);
    router.push(pathname + '?' + queryString);
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
              disabled={!!pathCategorySlug}
            >
              {currentCategory ? currentCategory.name : "Select category..."}
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
                      handleCategoryChange('general');
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
                        handleCategoryChange(category.slug);
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
              {currentDistrict ? currentDistrict.name : "Select district..."}
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
                        handleDistrictChange('all');
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
                        handleDistrictChange(district.id);
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
