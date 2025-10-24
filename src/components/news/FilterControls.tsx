
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
import { useTranslation } from '@/hooks/use-translation';

interface FilterControlsProps {
  districts: District[];
}

export default function FilterControls({ districts }: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
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

  const allDistrictsLabel = t('filter_controls.all_districts');
  const allDistricts = [{ id: 'all', name: allDistrictsLabel }, ...districts];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="font-headline text-2xl">{t('filter_controls.title')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="md:col-start-2 lg:col-start-2">
                 <label className="text-sm font-medium mb-2 block">{t('filter_controls.district_label')}</label>
                <Select onValueChange={(value) => handleFilterChange('district', value)} value={selectedDistrictId}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('filter_controls.select_district')} />
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
