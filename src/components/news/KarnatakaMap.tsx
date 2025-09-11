
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { District } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

// A simple map of district names from the SVG to the IDs from Firestore.
// In a real application, these might be slugs or more robust identifiers.
const districtNameMap: { [key: string]: string } = {
    'Bagalkot': '1',
    'Ballari': '2',
    'Belagavi': '3',
    'Bengaluru Rural': '4',
    'Bengaluru Urban': '5',
    'Bidar': '6',
    'Chamarajanagar': '7',
    'Chikkaballapura': '8',
    'Chikkamagaluru': '9',
    'Chitradurga': '10',
    'Dakshina Kannada': '11',
    'Davanagere': '12',
    'Dharwad': '13',
    'Gadag': '14',
    'Hassan': '15',
    'Haveri': '16',
    'Kalaburagi': '17',
    'Kodagu': '18',
    'Kolar': '19',
    'Koppal': '20',
    'Mandya': '21',
    'Mysuru': '22',
    'Raichur': '23',
    'Ramanagara': '24',
    'Shivamogga': '25',
    'Tumakuru': '26',
    'Udupi': '27',
    'Uttara Kannada': '28',
    'Vijayanagara': '29',
    'Yadgir': '30',
};

interface KarnatakaMapProps {
  districts: District[];
}

export default function KarnatakaMap({ districts }: KarnatakaMapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDistrictId = searchParams.get('district');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const handleDistrictClick = (districtName: string) => {
    const districtId = districtNameMap[districtName] || '';
    const isCurrentlySelected = selectedDistrictId === districtId;
    const newDistrictId = isCurrentlySelected ? '' : districtId;
    const queryString = createQueryString('district', newDistrictId);
    router.push(pathname + '?' + queryString);
  };
  
  // This is a simplified SVG. A real one would be much more complex.
  // The paths here are placeholders and don't represent the actual districts.
  const districtPaths = Object.keys(districtNameMap);

  return (
     <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-lg" aria-label="Map of Karnataka">
            <g>
                {districtPaths.map((name, index) => {
                    const districtId = districtNameMap[name];
                    const isSelected = selectedDistrictId === districtId;
                    
                    // Simple grid layout for placeholder shapes
                    const x = (index % 5) * 80;
                    const y = Math.floor(index / 5) * 60;
                    
                    return (
                        <g key={name} onClick={() => handleDistrictClick(name)} className="cursor-pointer group">
                             <rect 
                                x={x + 5} 
                                y={y + 5}
                                width="70" 
                                height="50" 
                                className={cn(
                                    "fill-muted stroke-border stroke-2 transition-all duration-200",
                                    "group-hover:fill-accent group-hover:stroke-accent-foreground",
                                    isSelected && "fill-primary stroke-primary-foreground"
                                )}
                            />
                            <text 
                                x={x + 40} 
                                y={y + 35} 
                                textAnchor="middle" 
                                className={cn(
                                    "text-[10px] font-sans fill-muted-foreground pointer-events-none transition-all duration-200",
                                    "group-hover:fill-accent-foreground",
                                    isSelected && "fill-primary-foreground font-bold"
                                )}
                            >
                                {name.split(' ')[0]}
                            </text>
                        </g>
                    );
                })}
            </g>
        </svg>
    </div>
  );
}
