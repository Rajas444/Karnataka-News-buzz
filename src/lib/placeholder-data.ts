
import type { Article, Category, District } from '@/lib/types';

export const placeholderDistricts: District[] = [
  { id: 'all', name: 'All Districts' },
  { id: '1', name: 'Bagalkote' },
  { id: '2', name: 'Ballari' },
  { id: '3', name: 'Belagavi' },
  { id: '4', name: 'Bengaluru Rural' },
  { id: '5', name: 'Bengaluru Urban' },
  { id: '6', name: 'Bidar' },
  { id: '7', name: 'Chamarajanagara' },
  { id: '8', name: 'Chikkaballapura' },
  { id: '9', name: 'Chikkamagaluru' },
  { id: '10', name: 'Chitradurga' },
  { id: '11', name: 'Dakshina Kannada' },
  { id: '12', name: 'Davanagere' },
  { id: '13', name: 'Dharwad' },
  { id: '14', name: 'Gadag' },
  { id: '15', 'name': 'Hassan' },
  { id: '16', name: 'Haveri' },
  { id: '17', name: 'Kalaburagi' },
  { id: '18', name: 'Kodagu' },
  { id: '19', name: 'Kolar' },
  { id: '20', name: 'Koppala' },
  { id: '21', name: 'Mandya' },
  { id: '22', name: 'Mysuru' },
  { id: '23', name: 'Raichuru' },
  { id: '24', name: 'Ramanagara' },
  { id: '25', name: 'Shivamogga' },
  { id: '26', name: 'Tumakuru' },
  { id: '27', name: 'Udupi' },
  { id: '28', name: 'Uttara Kannada' },
  { id: '29', name: 'Vijayanagara' },
  { id: '30', name: 'Yadgiri' },
  { id: '31', name: 'Bengaluru' },
  { id: '32', name: 'Mangaluru' },
  { id: '33', name: 'Hubballi' },
];

export const placeholderCategories: Category[] = [
  { id: 'general', name: 'All Categories', slug: 'general'},
  { id: '1', name: 'Politics', slug: 'politics' },
  { id: '2', name: 'Technology', slug: 'technology' },
  { id: '3', name: 'Sports', slug: 'sports' },
  { id: '4', name: 'Entertainment', slug: 'entertainment' },
  { id: '5', name: 'Business', slug: 'business' },
  { id: '6', name: 'Local News', slug: 'local-news' },
  { id: '8', name: 'Health', slug: 'health' },
  { id: '9', name: 'Science', slug: 'science' },
];

export const placeholderArticles: Article[] = [];
