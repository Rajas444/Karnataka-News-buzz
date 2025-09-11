
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { District } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

// This is a simplified SVG map of Karnataka. 
// The paths are illustrative and not perfectly to scale.
const districtPaths: { [key: string]: { id: string; path: string; } } = {
    'Bagalkote': { id: '1', path: 'M110 50 L140 50 L140 80 L110 80 Z' },
    'Ballari': { id: '2', path: 'M150 110 L180 110 L180 140 L150 140 Z' },
    'Belagavi': { id: '3', path: 'M70 20 L100 20 L100 50 L70 50 Z' },
    'Bengaluru Rural': { id: '4', path: 'M180 180 L210 180 L210 210 L180 210 Z' },
    'Bengaluru Urban': { id: '5', path: 'M190 220 L220 220 L220 250 L190 250 Z' },
    'Bidar': { id: '6', path: 'M230 20 L260 20 L260 50 L230 50 Z' },
    'Chamarajanagar': { id: '7', path: 'M140 280 L170 280 L170 310 L140 310 Z' },
    'Chikkaballapura': { id: '8', path: 'M220 180 L250 180 L250 210 L220 210 Z' },
    'Chikkamagaluru': { id: '9', path: 'M90 150 L120 150 L120 180 L90 180 Z' },
    'Chitradurga': { id: '10', path: 'M140 150 L170 150 L170 180 L140 180 Z' },
    'Dakshina Kannada': { id: '11', path: 'M50 200 L80 200 L80 230 L50 230 Z' },
    'Davanagere': { id: '12', path: 'M120 120 L150 120 L150 150 L120 150 Z' },
    'Dharwad': { id: '13', path: 'M80 80 L110 80 L110 110 L80 110 Z' },
    'Gadag': { id: '14', path: 'M110 90 L140 90 L140 120 L110 120 Z' },
    'Hassan': { id: '15', path: 'M100 200 L130 200 L130 230 L100 230 Z' },
    'Haveri': { id: '16', path: 'M90 120 L120 120 L120 150 L90 150 Z' },
    'Kalaburagi': { id: '17', path: 'M200 60 L230 60 L230 90 L200 90 Z' },
    'Kodagu': { id: '18', path: 'M80 240 L110 240 L110 270 L80 270 Z' },
    'Kolar': { id: '19', path: 'M240 220 L270 220 L270 250 L240 250 Z' },
    'Koppal': { id: '20', path: 'M150 80 L180 80 L180 110 L150 110 Z' },
    'Mandya': { id: '21', path: 'M150 240 L180 240 L180 270 L150 270 Z' },
    'Mysuru': { id: '22', path: 'M120 260 L150 260 L150 290 L120 290 Z' },
    'Raichur': { id: '23', path: 'M180 90 L210 90 L210 120 L180 120 Z' },
    'Ramanagara': { id: '24', path: 'M170 230 L200 230 L200 260 L170 260 Z' },
    'Shivamogga': { id: '25', path: 'M80 160 L110 160 L110 190 L80 190 Z' },
    'Tumakuru': { id: '26', path: 'M160 190 L190 190 L190 220 L160 220 Z' },
    'Udupi': { id: '27', path: 'M50 160 L80 160 L80 190 L50 190 Z' },
    'Uttara Kannada': { id: '28', path: 'M40 90 L70 90 L70 120 L40 120 Z' },
    'Vijayanagara': { id: '29', path: 'M130 100 L160 100 L160 130 L130 130 Z' },
    'Yadgir': { id: '30', path: 'M210 90 L240 90 L240 120 L210 120 Z' },
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
  
  const handleDistrictClick = (districtId: string) => {
    const isCurrentlySelected = selectedDistrictId === districtId;
    const newDistrictId = isCurrentlySelected ? '' : districtId;
    const queryString = createQueryString('district', newDistrictId);
    router.push(pathname + '?' + queryString);
  };
  

  return (
     <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 320 320" className="w-full h-auto max-w-lg" aria-label="Map of Karnataka">
            <g>
                {Object.entries(districtPaths).map(([name, { id, path }]) => {
                    const isSelected = selectedDistrictId === id;
                    
                    return (
                        <g key={name} onClick={() => handleDistrictClick(id)} className="cursor-pointer group">
                             <path 
                                d={path} 
                                className={cn(
                                    "fill-muted stroke-border stroke-1 transition-all duration-200",
                                    "group-hover:fill-accent group-hover:stroke-accent-foreground/50",
                                    isSelected && "fill-primary stroke-primary-foreground/50"
                                )}
                            />
                            <title>{name}</title>
                        </g>
                    );
                })}
            </g>
        </svg>
    </div>
  );
}
