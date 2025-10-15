
import type { Article, Category, District } from '@/lib/types';

export const placeholderDistricts: District[] = [
  { id: 'bagalkote', name: 'Bagalkote' },
  { id: 'ballari', name: 'Ballari' },
  { id: 'belagavi', name: 'Belagavi' },
  { id: 'bengaluru-rural', name: 'Bengaluru Rural' },
  { id: 'bengaluru-urban', name: 'Bengaluru Urban' },
  { id: 'bidar', name: 'Bidar' },
  { id: 'chamarajanagara', name: 'Chamarajanagara' },
  { id: 'chikkaballapura', name: 'Chikkaballapura' },
  { id: 'chikkamagaluru', name: 'Chikkamagaluru' },
  { id: 'chitradurga', name: 'Chitradurga' },
  { id: 'dakshina-kannada', name: 'Dakshina Kannada' },
  { id: 'davanagere', name: 'Davanagere' },
  { id: 'dharwad', name: 'Dharwad' },
  { id: 'gadag', name: 'Gadag' },
  { id: 'hassan', name: 'Hassan' },
  { id: 'haveri', name: 'Haveri' },
  { id: 'kalaburagi', name: 'Kalaburagi' },
  { id: 'kodagu', name: 'Kodagu' },
  { id: 'kolar', name: 'Kolar' },
  { id: 'koppala', name: 'Koppala' },
  { id: 'mandya', name: 'Mandya' },
  { id: 'mysuru', name: 'Mysuru' },
  { id: 'raichuru', name: 'Raichuru' },
  { id: 'ramanagara', name: 'Ramanagara' },
  { id: 'shivamogga', name: 'Shivamogga' },
  { id: 'tumakuru', name: 'Tumakuru' },
  { id: 'udupi', name: 'Udupi' },
  { id: 'uttara-kannada', name: 'Uttara Kannada' },
  { id: 'vijayanagara', name: 'Vijayanagara' },
  { id: 'yadgiri', name: 'Yadgiri' },
];

export const placeholderCategories: Category[] = [
    { id: 'general', name: 'General', slug: 'general' },
    { id: 'sports', name: 'Sports', slug: 'sports' },
    { id: 'technology', name: 'Technology', slug: 'technology' },
    { id: 'health-lifestyle', name: 'Health & Lifestyle', slug: 'health-lifestyle' },
    { id: 'gaming-esports', name: 'Gaming & Esports', slug: 'gaming-esports' },
    { id: 'politics', name: 'Politics', slug: 'politics' },
    { id: 'business-startups', name: 'Business & Startups', slug: 'business-startups' },
    { id: 'weather-environment', name: 'Weather & Environment', slug: 'weather-environment' },
    { id: 'society-community', name: 'Society & Community', slug: 'society-community' },
    { id: 'jobs-career', name: 'Jobs & Career', slug: 'jobs-career' },
    { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
    { id: 'ganesh-chaturthi', name: 'ಗಣೇಶ ಚತುರ್ಥಿ', slug: 'ganesh-chaturthi' },
];

function getYesterday(): Date {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0); // Set to midday yesterday
    return yesterday;
}


export const placeholderArticles: Article[] = [
    {
        id: 'new-tech-park-hubballi-1',
        title: 'ಹೊಸ ಟೆಕ್ ಪಾರ್ಕ್‌ನಿಂದಾಗಿ ಹುಬ್ಬಳ್ಳಿ ಟೆಕ್ ಹಬ್ ಆಗಿ ಹೊರಹೊಮ್ಮಲಿದೆ',
        content: 'ಹುಬ್ಬಳ್ಳಿಯಲ್ಲಿ ಹೊಸದಾಗಿ ಸ್ಥಾಪನೆಯಾಗುತ್ತಿರುವ ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಪಾರ್ಕ್, ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಸಾವಿರಾರು ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಸೃಷ್ಟಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ. ಈ ಯೋಜನೆಯು ಪ್ರದೇಶದ ಆರ್ಥಿಕತೆಗೆ ದೊಡ್ಡ ಉತ್ತೇಜನ ನೀಡಲಿದೆ.',
        imageUrl: 'https://picsum.photos/seed/techpark/800/600',
        "data-ai-hint": "technology office",
        author: 'KNP Staff',
        authorId: 'admin',
        categoryIds: ['technology', 'business-startups'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'KNP Internal',
        views: 1200,
        districtId: 'dharwad',
        seo: {
            metaDescription: 'Hubballi is set to become a major tech hub with the inauguration of a new IT park, expected to create thousands of jobs.',
            keywords: ['Hubballi', 'Tech Park', 'IT', 'North Karnataka']
        }
    },
    {
        id: 'mysuru-dasara-preparations-2',
        title: 'ಮೈಸೂರು ದಸರಾ 2024: ዝግጅቱ ಭರದಿಂದ ಸಾಗಿದೆ',
        content: 'ಪ್ರಸಿದ್ಧ ಮೈಸೂರು ದಸರಾ ಮಹೋತ್ಸವದ ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗುತ್ತಿವೆ. ಅರಮನೆ ನಗರಿಯು ಪ್ರವಾಸಿಗರನ್ನು ಸ್ವಾಗತಿಸಲು ಸಜ್ಜಾಗುತ್ತಿದೆ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ዝግጅቱಗಳು ಯೋಜನೆಯಲ್ಲಿವೆ.',
        imageUrl: 'https://picsum.photos/seed/dasara/800/600',
        "data-ai-hint": "festival palace",
        author: 'Prajavani',
        authorId: 'prajavani-reporter',
        categoryIds: ['society-community', 'entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'Prajavani',
        sourceUrl: 'https://www.prajavani.net/',
        views: 2500,
        districtId: 'mysuru',
        seo: {
            metaDescription: 'Preparations for the grand Mysuru Dasara 2024 are in full swing, with the city gearing up for cultural events.',
            keywords: ['Mysuru Dasara', 'Festival', 'Karnataka Tourism']
        }
    },
    {
        id: 'bengaluru-fc-new-signing-3',
        title: 'ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ಹೊಸ ವಿದೇಶಿ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು ಮಾಡಿಕೊಂಡಿದೆ',
        content: 'ಇಂಡಿಯನ್ சூப்பர் ಲೀಗ್ (ISL) ಋತುವಿಗಾಗಿ ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ತಂಡವು ಸ್ಪಾನಿಷ್ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು अपने ತಂಡಕ್ಕೆ ಸೇರಿಸಿಕೊಂಡಿದೆ. ಈ ಹೊಸ ஒப்பந்தವು ತಂಡದ ಆಕ್ರಮಣಕಾರಿ ಸಾಮर्थ್ಯವನ್ನು ಹೆಚ್ಚಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: 'https://picsum.photos/seed/football/800/600',
        "data-ai-hint": "soccer player",
        author: 'ESPN',
        authorId: 'espn-reporter',
        categoryIds: ['sports'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ESPN',
        views: 850,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'Bengaluru FC has signed a new foreign striker from Spain ahead of the upcoming Indian Super League season.',
            keywords: ['Bengaluru FC', 'ISL', 'Football', 'Sports']
        }
    },
    {
        id: 'monsoon-relief-kodagu-4',
        title: 'ಕೊಡಗಿನಲ್ಲಿ ಮುಂಗಾರು ಮಳೆ: ಪರಿಹಾರ ಕಾರ್ಯಗಳು ಚುರುಕು',
        content: 'ಕೊಡಗು ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರಿ ಮಳೆಯಿಂದಾಗಿ ಉಂಟಾದ ಪ್ರವಾಹ ಪರಿಸ್ಥಿತியை ನಿಭಾಯಿಸಲು ಸರ್ಕಾರವು ಪರಿಹಾರ ಕಾರ್ಯಗಳನ್ನು ಚುರುಕುಗೊಳಿಸಿದೆ. ಸಂತ್ರಸ್ತರಿಗೆ ಸಹಾಯ ಮಾಡಲು ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪಡೆ (NDRF) ತಂಡಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
        imageUrl: 'https://picsum.photos/seed/monsoon/800/600',
        "data-ai-hint": "heavy rain",
        author: 'The Hindu',
        authorId: 'the-hindu-reporter',
        categoryIds: ['weather-environment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'The Hindu',
        views: 1500,
        districtId: 'kodagu',
        seo: {
            metaDescription: 'Relief operations are underway in Kodagu district following heavy monsoon rains and flooding. NDRF teams have been deployed.',
            keywords: ['Kodagu', 'Monsoon', 'Rain', 'Flood Relief']
        }
    }
];
