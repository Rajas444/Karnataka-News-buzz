
import type { Article, Category, District } from '@/lib/types';
import imageData from '@/app/lib/placeholder-images.json';

type ImageData = {
    [key: string]: {
        seed: string;
        hint: string;
    }
}

const typedImageData = imageData as ImageData;

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

function getTwoDaysAgo(): Date {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    twoDaysAgo.setHours(10, 0, 0, 0);
    return twoDaysAgo;
}

function getThreeDaysAgo(): Date {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    threeDaysAgo.setHours(18, 0, 0, 0);
    return threeDaysAgo;
}

function getFourDaysAgo(): Date {
    const today = new Date();
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(today.getDate() - 4);
    fourDaysAgo.setHours(11, 0, 0, 0);
    return fourDaysAgo;
}

export const placeholderArticles: Article[] = [
    {
        id: 'new-tech-park-hubballi-1',
        title: 'ಹೊಸ ಟೆಕ್ ಪಾರ್ಕ್‌ನಿಂದಾಗಿ ಹುಬ್ಬಳ್ಳಿ ಟೆಕ್ ಹಬ್ ಆಗಿ ಹೊರಹೊಮ್ಮಲಿದೆ',
        content: 'ಹುಬ್ಬಳ್ಳಿಯಲ್ಲಿ ಹೊಸದಾಗಿ ಸ್ಥಾಪನೆಯಾಗುತ್ತಿರುವ ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಪಾರ್ಕ್, ಉತ್ತರ ಕರ್ನಾಟಕದಲ್ಲಿ ಸಾವಿರಾರು ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಸೃಷ್ಟಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ. ಈ ಯೋಜನೆಯು ಪ್ರದೇಶದ ಆರ್ಥಿಕತೆಗೆ ದೊಡ್ಡ ಉತ್ತೇಜನ ನೀಡಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['new-tech-park-hubballi-1'].seed}/800/600`,
        "data-ai-hint": typedImageData['new-tech-park-hubballi-1'].hint,
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
        title: 'ಮೈಸೂರು ದಸರಾ 2024: ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗಿವೆ',
        content: 'ಪ್ರಸಿದ್ಧ ಮೈಸೂರು ದಸರಾ ಮಹೋತ್ಸವದ ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗುತ್ತಿವೆ. ಅರಮನೆ ನಗರಿಯು ಪ್ರವಾಸಿಗರನ್ನು ಸ್ವಾಗತಿಸಲು ಸಜ್ಜಾಗುತ್ತಿದೆ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು ಯೋಜನೆಯಲ್ಲಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['mysuru-dasara-preparations-2'].seed}/800/600`,
        "data-ai-hint": typedImageData['mysuru-dasara-preparations-2'].hint,
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
        title: 'ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ಹೊಸ ವಿದೇಶಿ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು ತನ್ನ ತಂಡಕ್ಕೆ ಸೇರಿಸಿಕೊಂಡಿದೆ',
        content: 'ಇಂಡಿಯನ್ ಸೂಪರ್ ಲీగ్ (ISL) ಋತುವಿಗಾಗಿ ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ತಂಡವು ಸ್ಪಾನಿಷ್ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು ਆਪਣੇ ತಂಡಕ್ಕೆ ಸೇರಿಸಿಕೊಂಡಿದೆ. ಈ ಹೊಸ ಒಪ್ಪಂದವು ತಂಡದ ಆಕ್ರಮಣಕಾರಿ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-fc-new-signing-3'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-fc-new-signing-3'].hint,
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
        content: 'ಕೊಡಗು ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರಿ ಮಳೆಯಿಂದಾಗಿ ಉಂಟಾದ ಪ್ರವಾಹ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿಭಾಯಿಸಲು ಸರ್ಕಾರವು ಪರಿಹಾರ ಕಾರ್ಯಗಳನ್ನು ಚುರುಕುಗೊಳಿಸಿದೆ. ಸಂತ್ರಸ್ತರಿಗೆ ಸಹಾಯ ಮಾಡಲು ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪಡೆ (NDRF) ತಂಡಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['monsoon-relief-kodagu-4'].seed}/800/600`,
        "data-ai-hint": typedImageData['monsoon-relief-kodagu-4'].hint,
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
    },
    {
        id: 'ganesh-chaturthi-celebrations-5',
        title: 'ರಾಜ್ಯಾದ್ಯಂತ ಗಣೇಶ ಚತುರ್ಥಿ ಸಂಭ್ರಮ',
        content: 'ನಾಡಿನಾದ್ಯಂತ ಗಣೇಶ ಚತುರ್ಥಿ ಹಬ್ಬವನ್ನು ಶ್ರದ್ಧಾಭಕ್ತಿಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತಿದೆ. ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ ಸೇರಿದಂತೆ ಹಲವು ನಗರಗಳಲ್ಲಿ ಬೃಹತ್ ಗಣೇಶ ಪೆಂಡಾಲ್‌ಗಳು ಎಲ್ಲರ ಗಮನ ಸೆಳೆಯುತ್ತಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['ganesh-chaturthi-celebrations-5'].seed}/800/600`,
        "data-ai-hint": typedImageData['ganesh-chaturthi-celebrations-5'].hint,
        author: 'KNP Staff',
        authorId: 'admin',
        categoryIds: ['society-community', 'ganesh-chaturthi'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'KNP Internal',
        views: 3200,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'Ganesh Chaturthi is being celebrated with great fervor across Karnataka, with large pandals attracting devotees in major cities.',
            keywords: ['Ganesh Chaturthi', 'Karnataka Festivals', 'Bangalore']
        }
    },
    {
        id: 'new-kannada-film-release-6',
        title: 'ಹೊಸ ಕನ್ನಡ ಚಲನಚಿತ್ರ "ಬಯಲುಸೀಮೆ" ಚಿತ್ರಮಂದಿರಗಳಲ್ಲಿ ಬಿಡುಗಡೆ',
        content: 'ನಟ ರಮೇಶ್ ಅರವಿಂದ್ ಅಭಿನಯದ, ಬಹುನಿರೀಕ್ಷಿತ ಕನ್ನಡ ಚಲನಚಿತ್ರ "ಬಯಲುಸೀಮೆ" ಇಂದು ರಾಜ್ಯಾದ್ಯಂತ ಬಿಡುಗಡೆಯಾಗಿದೆ. ಚಿತ್ರವು ವಿಮರ್ಶಕರಿಂದ ಉತ್ತಮ ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆದಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['new-kannada-film-release-6'].seed}/800/600`,
        "data-ai-hint": typedImageData['new-kannada-film-release-6'].hint,
        author: 'Times of India',
        authorId: 'toi-reporter',
        categoryIds: ['entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'Times of India',
        views: 950,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'The highly anticipated Kannada movie "Bayaluseeme", starring Ramesh Aravind, has been released in theatres today.',
            keywords: ['Kannada Cinema', 'Sandalwood', 'Ramesh Aravind']
        }
    },
    {
        id: 'belagavi-politics-update-7',
        title: 'ಬೆಳಗಾವಿ ರಾಜಕೀಯ: ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆ ಕಾವು',
        content: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ಮುಂಬರುವ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆಯ ಕಾವು ಹೆಚ್ಚಾಗುತ್ತಿದೆ. ಪ್ರಮುಖ ರಾಜಕೀಯ ಪಕ್ಷಗಳು ತಮ್ಮ ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಅಂತಿಮಗೊಳಿಸುವಲ್ಲಿ ನಿರತವಾಗಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['belagavi-politics-update-7'].seed}/800/600`,
        "data-ai-hint": typedImageData['belagavi-politics-update-7'].hint,
        author: 'Vijaya Karnataka',
        authorId: 'vk-reporter',
        categoryIds: ['politics'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'Vijaya Karnataka',
        views: 700,
        districtId: 'belagavi',
        seo: {
            metaDescription: 'Political activity heats up in Belagavi ahead of the upcoming local body elections, with major parties finalizing candidates.',
            keywords: ['Belagavi', 'Karnataka Politics', 'Elections']
        }
    },
    {
        id: 'startup-funding-bangalore-8',
        title: 'ಬೆಂಗಳೂರಿನ ಆರೋಗ್ಯ ತಂತ್ರಜ್ಞಾನ ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗೆ $5 ಮಿಲಿಯನ್ ಹೂಡಿಕೆ',
        content: 'ಬೆಂಗಳೂರು ಮೂಲದ ಆರೋಗ್ಯ ತಂತ್ರಜ್ಞಾನ ಸ್ಟಾರ್ಟ್‌ಅಪ್ "ಆರೋಗ್ಯಸೇತು" ಸೀರೀస్ ಎ ಫಂಡಿಂಗ್‌ನಲ್ಲಿ $5 ಮಿಲಿಯನ್ ಹೂಡಿಕೆ ಪಡೆದಿದೆ. ಈ ಹಣವನ್ನು ತಮ್ಮ ತಂತ್ರಜ್ಞานವನ್ನು ವಿಸ್ತರಿಸಲು ಬಳಸುವುದಾಗಿ ಕಂಪನಿ ಹೇಳಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['startup-funding-bangalore-8'].seed}/800/600`,
        "data-ai-hint": typedImageData['startup-funding-bangalore-8'].hint,
        author: 'YourStory',
        authorId: 'ys-reporter',
        categoryIds: ['business-startups', 'technology', 'health-lifestyle'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'YourStory',
        views: 1800,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'Bangalore-based health-tech startup AarogyaSetu has raised $5 million in Series A funding to expand its technology platform.',
            keywords: ['Startup', 'Funding', 'Bangalore', 'Health Tech']
        }
    },
    {
        id: 'hampi-utsav-announcement-9',
        title: 'ಹಂಪಿ ಉತ್ಸವ ದಿನಾಂಕ ಪ್ರಕಟ: ಪ್ರವಾಸೋದ್ಯಮಕ್ಕೆ ಉತ್ತೇಜನ',
        content: 'ವಿಶ್ವಪ್ರಸಿದ್ಧ ಹಂಪಿ ಉತ್ಸavದ ದಿನಾಂಕಗಳನ್ನು ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಪ್ರಕಟಿಸಿದೆ. ಈ ವರ್ಷದ ಉತ್ಸವವು ವಿಜಯನಗರ ಜಿಲ್ಲೆಯ ಪ್ರವಾಸೋದ್ಯಮಕ್ಕೆ ದೊಡ್ಡ ಉತ್ತೇಜನ ನೀಡುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['hampi-utsav-announcement-9'].seed}/800/600`,
        "data-ai-hint": typedImageData['hampi-utsav-announcement-9'].hint,
        author: 'KNP Staff',
        authorId: 'admin',
        categoryIds: ['society-community', 'entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'KNP Internal',
        views: 2100,
        districtId: 'vijayanagara',
        seo: {
            metaDescription: 'The dates for the world-famous Hampi Utsav have been announced by the Karnataka government, expected to boost tourism.',
            keywords: ['Hampi Utsav', 'Vijayanagara', 'Karnataka Tourism']
        }
    },
    {
        id: 'udupi-beach-cleanup-10',
        title: 'ಉಡುಪಿಯ ಮಲ್ಪೆ ಕಡಲತೀರದಲ್ಲಿ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ',
        content: 'ಸ್ಥಳೀಯ ಎನ್‌ಜಿಒ ಮತ್ತು ಸ್ವಯಂಸೇವಕರು ಉಡುಪಿಯ ಮಲ್ಪೆ ಕಡಲತೀರದಲ್ಲಿ ಬೃಹತ್ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನವನ್ನು ನಡೆಸಿದರು. ಈ ಕಾರ್ಯಕ್ರಮವು ಕಡಲತೀರದ ಪರಿಸರ ಸಂರಕ್ಷಣೆಯ ಬಗ್ಗೆ ಜಾಗೃತಿ ಮೂಡಿಸಿತು.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['udupi-beach-cleanup-10'].seed}/800/600`,
        "data-ai-hint": typedImageData['udupi-beach-cleanup-10'].hint,
        author: 'Udayavani',
        authorId: 'udayavani-reporter',
        categoryIds: ['weather-environment', 'society-community'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'Udayavani',
        views: 1100,
        districtId: 'udupi',
        seo: {
            metaDescription: 'A massive cleanliness drive was conducted at Malpe beach in Udupi by a local NGO and volunteers to promote coastal conservation.',
            keywords: ['Udupi', 'Malpe Beach', 'Environment', 'Cleanliness Drive']
        }
    },
    {
        id: 'bengaluru-suburban-rail-update-11',
        title: 'ಬೆಂಗಳೂರು ಉಪನಗರ ರೈಲು ಯೋಜನೆ: ಮೊದಲ ಹಂತದ ಕಾಮಗಾರಿ ಚುರುಕು',
        content: 'ಬೆಂಗಳೂರಿನ ಸಂಚಾರ ದಟ್ಟಣೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಗುರಿ ಹೊಂದಿರುವ ಉಪನಗರ ರೈಲು ಯೋಜನೆಯ ಮೊದಲ ಹಂತದ ಕಾಮಗಾರಿಗಳು ವೇಗ ಪಡೆದುಕೊಂಡಿವೆ. ಈ ಯೋಜನೆಯು ನಗರದ ವಿವಿಧ ಭಾಗಗಳಿಗೆ ತ್ವರಿತ ಸಂಪರ್ಕವನ್ನು ಒದಗಿಸಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-suburban-rail-update-11'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-suburban-rail-update-11'].hint,
        author: 'Deccan Herald',
        authorId: 'dh-reporter',
        categoryIds: ['society-community', 'business-startups'],
        status: 'published',
        publishedAt: getTwoDaysAgo().toISOString(),
        createdAt: getTwoDaysAgo().toISOString(),
        updatedAt: getTwoDaysAgo().toISOString(),
        source: 'Deccan Herald',
        views: 1950,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'Work on the first phase of the Bengaluru suburban rail project, aimed at easing traffic congestion, has gained momentum.',
            keywords: ['Bengaluru', 'Suburban Rail', 'Infrastructure', 'Traffic']
        }
    },
    {
        id: 'kannada-unicode-font-release-12',
        title: 'ಹೊಸ ಕನ್ನಡ ಯೂನیکೋಡ್ ಫಾಂಟ್ ಬಿಡುಗಡೆ',
        content: 'ಕನ್ನಡ ಭಾಷೆಯ ಡಿಜಿಟల్ ಬಳಕೆಯನ್ನು ಉತ್ತೇಜಿಸಲು, ಕರ್ನಾಟಕ ಸರ್ಕಾರವು ಹೊಸ ಯೂನಿಕೋಡ್ ಫಾಂಟ್ ಅನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿದೆ. ಇದು ಸುಲಭವಾಗಿ ಲಭ್ಯವಿದ್ದು, ವಿವಿಧ ಡಿಜಿಟಲ್ ವೇದಿಕೆಗಳಲ್ಲಿ ಬಳಸಬಹುದಾಗಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['kannada-unicode-font-release-12'].seed}/800/600`,
        "data-ai-hint": typedImageData['kannada-unicode-font-release-12'].hint,
        author: 'KNP Staff',
        authorId: 'admin',
        categoryIds: ['technology', 'society-community'],
        status: 'published',
        publishedAt: getTwoDaysAgo().toISOString(),
        createdAt: getTwoDaysAgo().toISOString(),
        updatedAt: getTwoDaysAgo().toISOString(),
        source: 'KNP Internal',
        views: 650,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'The Karnataka government has released a new Kannada Unicode font to promote the digital usage of the Kannada language.',
            keywords: ['Kannada', 'Unicode', 'Font', 'Technology', 'Language']
        }
    },
    {
        id: 'bengaluru-mysuru-expressway-tolls-13',
        title: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ: ಟೋಲ್ ದರ ಪರಿಷ್ಕರಣೆ',
        content: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಯಲ್ಲಿನ ಟೋಲ್ ದರಗಳನ್ನು ಪರಿಷ್ಕರಿಸಲಾಗಿದೆ. ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ಪ್ರಾಧಿಕಾರವು ಹೊಸ ದರಗಳನ್ನು ಪ್ರಕಟಿಸಿದ್ದು, ಇದು ಪ್ರಯಾಣಿಕರ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-mysuru-expressway-tolls-13'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-mysuru-expressway-tolls-13'].hint,
        author: 'Prajavani',
        authorId: 'prajavani-reporter',
        categoryIds: ['society-community', 'politics'],
        status: 'published',
        publishedAt: getThreeDaysAgo().toISOString(),
        createdAt: getThreeDaysAgo().toISOString(),
        updatedAt: getThreeDaysAgo().toISOString(),
        source: 'Prajavani',
        views: 2800,
        districtId: 'ramanagara',
        seo: {
            metaDescription: 'Toll rates on the Bengaluru-Mysuru expressway have been revised by the National Highways Authority of India (NHAI).',
            keywords: ['Bengaluru-Mysuru Expressway', 'Toll', 'NHAI', 'Travel']
        }
    },
    {
        id: 'mandya-sugarcane-farmers-protest-14',
        title: 'ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಗಾರರ ಪ್ರತಿಭಟನೆ, ಸರ್ಕಾರಕ್ಕೆ ಎಚ್ಚರಿಕೆ',
        content: 'ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಗಾರರು ತಮ್ಮ ಬೇಡಿಕೆಗಳ ಈಡೇರಿಕೆಗೆ ಆಗ್ರಹಿಸಿ ಬೃಹತ್ ಪ್ರತಿಭಟನೆ ನಡೆಸಿದರು. ನ್ಯಾಯಯುತ ಬೆಲೆ ನಿಗದಿ ಮಾಡುವಂತೆ ಸರ್ಕಾರಕ್ಕೆ ಮನವಿ ಸಲ್ಲಿಸಿದರು.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['mandya-sugarcane-farmers-protest-14'].seed}/800/600`,
        "data-ai-hint": typedImageData['mandya-sugarcane-farmers-protest-14'].hint,
        author: 'Suvarna News',
        authorId: 'suvarna-reporter',
        categoryIds: ['politics', 'society-community'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'Suvarna News',
        views: 1300,
        districtId: 'mandya',
        seo: {
            metaDescription: 'Sugarcane farmers in Mandya held a major protest demanding fair prices and submitted a memorandum to the government.',
            keywords: ['Mandya', 'Farmers Protest', 'Sugarcane', 'Agriculture']
        }
    },
    {
        id: 'uttara-kannada-new-bridge-15',
        title: 'ಉತ್ತರ ಕನ್ನಡ: ಕಾಳಿ ನದಿಗೆ ಹೊಸ ಸೇತುವೆ ನಿರ್ಮಾಣಕ್ಕೆ ಚಾಲನೆ',
        content: 'ಉತ್ತರ ಕನ್ನಡ ಜಿಲ್ಲೆಯ ಪ್ರಮುಖ ಸಂಪರ್ಕ ಕೊಂಡಿಯಾಗಿರುವ ಕಾಳಿ ನದಿಗೆ ಹೊಸ ಸೇತುವೆ ನಿರ್ಮಾಣಕ್ಕೆ ಕೇಂದ್ರ ಸರ್ಕಾರ ಚಾಲನೆ ನೀಡಿದೆ. ಇದರಿಂದಾಗಿ ಸಂಚಾರ ದಟ್ಟಣೆ ಕಡಿಮೆಯಾಗಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['uttara-kannada-new-bridge-15'].seed}/800/600`,
        "data-ai-hint": typedImageData['uttara-kannada-new-bridge-15'].hint,
        author: 'Public TV',
        authorId: 'public-tv-reporter',
        categoryIds: ['society-community', 'business-startups'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'Public TV',
        views: 980,
        districtId: 'uttara-kannada',
        seo: {
            metaDescription: 'The central government has initiated the construction of a new bridge over the Kali river in Uttara Kannada to ease traffic congestion.',
            keywords: ['Uttara Kannada', 'Bridge', 'Infrastructure', 'Kali River']
        }
    },
    {
        id: 'chikkamagaluru-folk-art-festival-16',
        title: 'ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಜನಪದ ಕಲಾ ಉತ್ಸವಕ್ಕೆ ಅದ್ದೂರಿ ಚಾಲನೆ',
        content: 'ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಮೂರು ದಿನಗಳ ಕಾಲ ನಡೆಯುವ ಜನಪದ ಕಲಾ ಉತ್ಸವಕ್ಕೆ ಇಂದು ಅದ್ದೂರಿಯಾಗಿ ಚಾಲನೆ ದೊರೆಯಿತು. ರಾಜ್ಯದ ವಿವಿಧ ಭಾಗಗಳಿಂದ ಕಲಾವಿದರು ಇದರಲ್ಲಿ ಭಾಗವಹಿಸಿದ್ದಾರೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['chikkamagaluru-folk-art-festival-16'].seed}/800/600`,
        "data-ai-hint": typedImageData['chikkamagaluru-folk-art-festival-16'].hint,
        author: 'TV9 Kannada',
        authorId: 'tv9-reporter',
        categoryIds: ['entertainment', 'society-community'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'TV9 Kannada',
        views: 1550,
        districtId: 'chikkamagaluru',
        seo: {
            metaDescription: 'A three-day folk art festival has grandly commenced in Chikkamagaluru, with artists from various parts of the state participating.',
            keywords: ['Chikkamagaluru', 'Folk Art', 'Festival', 'Culture']
        }
    },
    {
        id: 'tumakuru-industrial-area-17',
        title: 'ತುಮಕೂರಿನಲ್ಲಿ ಹೊಸ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ: 10,000 ಉದ್ಯೋಗ ಸೃಷ್ಟಿ ನಿರೀಕ್ಷೆ',
        content: 'ತುಮಕೂರು ಬಳಿ ಹೊಸ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶವನ್ನು ಸ್ಥಾಪಿಸಲು ಸರ್ಕಾರ ಅನುಮೋದನೆ ನೀಡಿದೆ. ಇದರಿಂದ ಸುಮಾರು 10,000 ನೇರ ಹಾಗೂ ಪರೋಕ್ಷ ಉದ್ಯೋಗಗಳು ಸೃಷ್ಟಿಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['tumakuru-industrial-area-17'].seed}/800/600`,
        "data-ai-hint": typedImageData['tumakuru-industrial-area-17'].hint,
        author: 'ETV Bharat Kannada',
        authorId: 'etv-reporter',
        categoryIds: ['business-startups', 'jobs-career'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'ETV Bharat Kannada',
        views: 2200,
        districtId: 'tumakuru',
        seo: {
            metaDescription: 'The government has approved a new industrial area near Tumakuru, which is expected to create around 10,000 direct and indirect jobs.',
            keywords: ['Tumakuru', 'Industrial Area', 'Jobs', 'Investment']
        }
    }
];
