
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { District } from '@/lib/types';
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
  districts: District[];
}

export default function FilterControls({ districts }: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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

  const handleFilterChange = (type: 'district', value: string) => {
    router.push(`/home?${createQueryString(type, value)}`);
  };

  const allDistricts = [{ id: 'all', name: 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು' }, ...districts];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">ಸುದ್ದಿ ಫಿಲ್ಟರ್ ಮಾಡಿ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="md:col-start-2 lg:col-start-2">
                 <label className="text-sm font-medium mb-2 block font-kannada">ಜಿಲ್ಲೆ</label>
                <Select onValueChange={(value) => handleFilterChange('district', value)} value={selectedDistrictId}>
                    <SelectTrigger className="font-kannada">
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {allDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id} className="font-kannada">
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
