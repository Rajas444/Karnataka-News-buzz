
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
  
  const [openDistrict, setOpenDistrict] = useState(false)

  const selectedCategorySlug = pathname.startsWith('/categories/') 
    ? pathname.split('/')[2]
    : 'general';
  
  const selectedDistrictId = searchParams.get('district') || '';

  const [currentDistrict, setCurrentDistrict] = useState(districts.find(d => d.id === selectedDistrictId));
  
   useEffect(() => {
    setCurrentDistrict(districts.find(d => d.id === selectedDistrictId));
  }, [selectedDistrictId, districts]);


  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'all') {
          params.delete(name);
      } else {
          params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const handleCategoryChange = (slug: string) => {
      const currentQuery = new URLSearchParams(searchParams.toString()).toString();
      if (slug === 'general') {
          router.push(`/home?${currentQuery}`);
      } else {
          router.push(`/categories/${slug}?${currentQuery}`);
      }
  }

  const handleDistrictChange = (districtId: string) => {
    const queryString = createQueryString('district', districtId);
    // We want to stay on the current page (home or a category page) and just update the query string
    router.push(pathname + '?' + queryString);
  };


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
                        {categories.map((category) => (
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
                <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDistrict}
                    className="w-full justify-between"
                    >
                    {currentDistrict ? currentDistrict.name : "All Districts"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                    <CommandInput placeholder="Search district..." />
                    <CommandList>
                        <CommandEmpty>No district found.</CommandEmpty>
                        <CommandGroup>
                        <CommandItem
                            value="all-districts"
                            onSelect={() => {
                                handleDistrictChange('');
                                setOpenDistrict(false);
                            }}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                !selectedDistrictId ? "opacity-100" : "opacity-0"
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
        </CardContent>
    </Card>
  );
}
