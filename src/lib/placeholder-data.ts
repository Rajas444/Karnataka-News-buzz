
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
  { id: 'bagalkote', name: 'ಬಾಗಲಕೋಟೆ' },
  { id: 'ballari', name: 'ಬಳ್ಳಾರಿ' },
  { id: 'belagavi', name: 'ಬೆಳಗಾವಿ' },
  { id: 'bengaluru-rural', name: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ' },
  { id: 'bengaluru-urban', name: 'ಬೆಂಗಳೂರು ನಗರ' },
  { id: 'bidar', name: 'ಬೀದರ್' },
  { id: 'chamarajanagara', name: 'ಚಾಮರಾಜನಗರ' },
  { id: 'chikkaballapura', name: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ' },
  { id: 'chikkamagaluru', name: 'ಚಿಕ್ಕಮಗಳೂರು' },
  { id: 'chitradurga', name: 'ಚಿತ್ರದುರ್ಗ' },
  { id: 'dakshina-kannada', name: 'ದಕ್ಷಿಣ ಕನ್ನಡ' },
  { id: 'davanagere', name: 'ದಾವಣಗೆರೆ' },
  { id: 'dharwad', name: 'ಧಾರವಾಡ' },
  { id: 'gadag', name: 'ಗದಗ' },
  { id: 'hassan', name: 'ಹಾಸನ' },
  { id: 'haveri', name: 'ಹಾವೇರಿ' },
  { id: 'kalaburagi', name: 'ಕಲಬುರಗಿ' },
  { id: 'kodagu', name: 'ಕೊಡಗು' },
  { id: 'kolar', name: 'ಕೋಲಾರ' },
  { id: 'koppala', name: 'ಕೊಪ್ಪಳ' },
  { id: 'mandya', name: 'ಮಂಡ್ಯ' },
  { id: 'mysuru', name: 'ಮೈಸೂರು' },
  { id: 'raichuru', name: 'ರಾಯಚೂರು' },
  { id: 'ramanagara', name: 'ರಾಮನಗರ' },
  { id: 'shivamogga', name: 'ಶಿವಮೊಗ್ಗ' },
  { id: 'tumakuru', name: 'ತುಮಕೂರು' },
  { id: 'udupi', name: 'ಉಡುಪಿ' },
  { id: 'uttara-kannada', name: 'ಉತ್ತರ ಕನ್ನಡ' },
  { id: 'vijayanagara', name: 'ವಿಜಯನಗರ' },
  { id: 'yadgiri', name: 'ಯಾದಗಿರಿ' },
];

export const placeholderCategories: Category[] = [
    { id: 'general', name: 'ಸಾಮಾನ್ಯ', slug: 'general' },
    { id: 'sports', name: 'ಕ್ರೀಡೆ', slug: 'sports' },
    { id: 'technology', name: 'ತಂತ್ರಜ್ಞಾನ', slug: 'technology' },
    { id: 'health-lifestyle', name: 'ಆರೋಗ್ಯ ಮತ್ತು ಜೀವನಶೈಲಿ', slug: 'health-lifestyle' },
    { id: 'politics', name: 'ರಾಜಕೀಯ', slug: 'politics' },
    { id: 'business-startups', name: 'ವ್ಯಾಪಾರ ಮತ್ತು ನವೋದ್ಯಮ', slug: 'business-startups' },
    { id: 'weather-environment', name: 'ಹವಾಮಾನ ಮತ್ತು ಪರಿಸರ', slug: 'weather-environment' },
    { id: 'society-community', name: 'ಸಮಾಜ ಮತ್ತು ಸಮುದಾಯ', slug: 'society-community' },
    { id: 'jobs-career', name: 'ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ', slug: 'jobs-career' },
    { id: 'entertainment', name: 'ಮನರಂಜನೆ', slug: 'entertainment' },
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
        author: 'ಕೆಎನ್‌ಪಿ ಸಿಬ್ಬಂದಿ',
        authorId: 'admin',
        categoryIds: ['technology', 'business-startups'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಕೆಎನ್‌ಪಿ ಆಂತರಿಕ',
        views: 1200,
        districtId: 'dharwad',
        seo: {
            metaDescription: 'ಹುಬ್ಬಳ್ಳಿಯಲ್ಲಿ ಹೊಸ ಐಟಿ ಪಾರ್ಕ್ ಉದ್ಘಾಟನೆಯಾಗಲಿದ್ದು, ಸಾವಿರಾರು ಉದ್ಯೋಗಗಳನ್ನು ಸೃಷ್ಟಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
            keywords: ['ಹುಬ್ಬಳ್ಳಿ', 'ಟೆಕ್ ಪಾರ್ಕ್', 'ಐಟಿ', 'ಉತ್ತರ ಕರ್ನಾಟಕ']
        }
    },
    {
        id: 'mysuru-dasara-preparations-2',
        title: 'ಮೈಸೂರು ದಸರಾ 2024: ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗಿವೆ',
        content: 'ಪ್ರಸಿದ್ಧ ಮೈಸೂರು ದಸರಾ ಮಹೋತ್ಸವದ ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗುತ್ತಿವೆ. ಅರಮನೆ ನಗರಿಯು ಪ್ರವಾಸಿಗರನ್ನು ಸ್ವಾಗತಿಸಲು ಸಜ್ಜಾಗುತ್ತಿದೆ, ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು ಯೋಜನೆಯಲ್ಲಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['mysuru-dasara-preparations-2'].seed}/800/600`,
        "data-ai-hint": typedImageData['mysuru-dasara-preparations-2'].hint,
        author: 'ಪ್ರಜಾವಾಣಿ',
        authorId: 'prajavani-reporter',
        categoryIds: ['society-community', 'entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಪ್ರಜಾವಾಣಿ',
        sourceUrl: 'https://www.prajavani.net/',
        views: 2500,
        districtId: 'mysuru',
        seo: {
            metaDescription: 'ಅದ್ದೂರಿ ಮೈಸೂರು ದಸರಾ 2024 ರ ಸಿದ್ಧತೆಗಳು ಭರದಿಂದ ಸಾಗುತ್ತಿದ್ದು, ನಗರವು ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಸಜ್ಜಾಗಿದೆ.',
            keywords: ['ಮೈಸೂರು ದಸರಾ', 'ಹಬ್ಬ', 'ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ']
        }
    },
    {
        id: 'bengaluru-fc-new-signing-3',
        title: 'ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ಹೊಸ ವಿದೇಶಿ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು ತನ್ನ ತಂಡಕ್ಕೆ ಸೇರಿಸಿಕೊಂಡಿದೆ',
        content: 'ಇಂಡಿಯನ್ ಸೂಪರ್ ಲೀಗ್ (ISL) ಋತುವಿಗಾಗಿ ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ತಂಡವು ಸ್ಪಾನಿಷ್ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು ਆਪਣੇ ತಂಡಕ್ಕೆ ಸೇರಿಸಿಕೊಂಡಿದೆ. ಈ ಹೊಸ ಒಪ್ಪಂದವು ತಂಡದ ಆಕ್ರಮಣಕಾರಿ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೆಚ್ಚಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-fc-new-signing-3'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-fc-new-signing-3'].hint,
        author: 'ಇಎಸ್‌ಪಿಎನ್',
        authorId: 'espn-reporter',
        categoryIds: ['sports'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಇಎಸ್‌ಪಿಎನ್',
        views: 850,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ಮುಂಬರುವ ಇಂಡಿಯನ್ ಸೂಪರ್ ಲೀಗ್ ಋತುವಿನ മുന്നോടിയಾಗಿ ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ ಸ್ಪೇನ್‌ನಿಂದ ಹೊಸ ವಿದೇಶಿ ಸ್ಟ್ರೈಕರ್‌ನನ್ನು চুক্তিবদ্ধಗೊಳಿಸಿದೆ.',
            keywords: ['ಬೆಂಗಳೂರು ಎಫ್‌ಸಿ', 'ಐಎಸ್‌ಎಲ್', 'ಫುಟ್ಬಾಲ್', 'ಕ್ರೀಡೆ']
        }
    },
    {
        id: 'monsoon-relief-kodagu-4',
        title: 'ಕೊಡಗಿನಲ್ಲಿ ಮುಂಗಾರು ಮಳೆ: ಪರಿಹಾರ ಕಾರ್ಯಗಳು ಚುರುಕು',
        content: 'ಕೊಡಗು ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರಿ ಮಳೆಯಿಂದಾಗಿ ಉಂಟಾದ ಪ್ರವಾಹ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿಭಾಯಿಸಲು ಸರ್ಕಾರವು ಪರಿಹಾರ ಕಾರ್ಯಗಳನ್ನು ಚುರುಕುಗೊಳಿಸಿದೆ. ಸಂತ್ರಸ್ತರಿಗೆ ಸಹಾಯ ಮಾಡಲು ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪಡೆ (NDRF) ತಂಡಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['monsoon-relief-kodagu-4'].seed}/800/600`,
        "data-ai-hint": typedImageData['monsoon-relief-kodagu-4'].hint,
        author: 'ದಿ ಹಿಂದೂ',
        authorId: 'the-hindu-reporter',
        categoryIds: ['weather-environment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ದಿ ಹಿಂದೂ',
        views: 1500,
        districtId: 'kodagu',
        seo: {
            metaDescription: 'ಭಾರೀ ಮುಂಗಾರು ಮಳೆ ಮತ್ತು ಪ್ರವಾಹದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕೊಡಗು ಜಿಲ್ಲೆಯಲ್ಲಿ ಪರಿಹಾರ ಕಾರ್ಯಾಚರಣೆಗಳು ನಡೆಯುತ್ತಿವೆ. ಎನ್‌ಡಿಆರ್‌ಎಫ್ ತಂಡಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
            keywords: ['ಕೊಡಗು', 'ಮುಂಗಾರು', 'ಮಳೆ', 'ಪ್ರವಾಹ ಪರಿಹಾರ']
        }
    },
    {
        id: 'ganesh-chaturthi-celebrations-5',
        title: 'ರಾಜ್ಯಾದ್ಯಂತ ಗಣೇಶ ಚತುರ್ಥಿ ಸಂಭ್ರಮ',
        content: 'ನಾಡಿನಾದ್ಯಂತ ಗಣೇಶ ಚತುರ್ಥಿ ಹಬ್ಬವನ್ನು ಶ್ರದ್ಧಾಭಕ್ತಿಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತಿದೆ. ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ ಸೇರಿದಂತೆ ಹಲವು ನಗರಗಳಲ್ಲಿ ಬೃಹತ್ ಗಣೇಶ ಪೆಂಡಾಲ್‌ಗಳು ಎಲ್ಲರ ಗಮನ ಸೆಳೆಯುತ್ತಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['ganesh-chaturthi-celebrations-5'].seed}/800/600`,
        "data-ai-hint": typedImageData['ganesh-chaturthi-celebrations-5'].hint,
        author: 'ಕೆಎನ್‌ಪಿ ಸಿಬ್ಬಂದಿ',
        authorId: 'admin',
        categoryIds: ['society-community', 'ganesh-chaturthi'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಕೆಎನ್‌ಪಿ ಆಂತರಿಕ',
        views: 3200,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಗಣೇಶ ಚತುರ್ಥಿಯನ್ನು ಅತ್ಯಂತ ವಿಜೃಂಭಣೆಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತಿದ್ದು, ಪ್ರಮುಖ ನಗರಗಳಲ್ಲಿ ಬೃಹತ್ ಪೆಂಡಾಲ್‌ಗಳು ಭಕ್ತರನ್ನು ಆಕರ್ಷಿಸುತ್ತಿವೆ.',
            keywords: ['ಗಣೇಶ ಚತುರ್ಥಿ', 'ಕರ್ನಾಟಕ ಹಬ್ಬಗಳು', 'ಬೆಂಗಳೂರು']
        }
    },
    {
        id: 'new-kannada-film-release-6',
        title: 'ಹೊಸ ಕನ್ನಡ ಚಲನಚಿತ್ರ "ಬಯಲುಸೀಮೆ" ಚಿತ್ರಮಂದಿರಗಳಲ್ಲಿ ಬಿಡುಗಡೆ',
        content: 'ನಟ ರಮೇಶ್ ಅರವಿಂದ್ ಅಭಿನಯದ, ಬಹುನಿರೀಕ್ಷಿತ ಕನ್ನಡ ಚಲನಚಿತ್ರ "ಬಯಲುಸೀಮೆ" ಇಂದು ರಾಜ್ಯಾದ್ಯಂತ ಬಿಡುಗಡೆಯಾಗಿದೆ. ಚಿತ್ರವು ವಿಮರ್ಶಕರಿಂದ ಉತ್ತಮ ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆದಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['new-kannada-film-release-6'].seed}/800/600`,
        "data-ai-hint": typedImageData['new-kannada-film-release-6'].hint,
        author: 'ಟೈಮ್ಸ್ ಆಫ್ ಇಂಡಿಯಾ',
        authorId: 'toi-reporter',
        categoryIds: ['entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಟೈಮ್ಸ್ ಆಫ್ ಇಂಡಿಯಾ',
        views: 950,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ರಮೇಶ್ ಅರವಿಂದ್ ನಟನೆಯ ಬಹು ನಿರೀಕ್ಷಿತ ಕನ್ನಡ ಚಲನಚಿತ್ರ "ಬಯಲುಸೀಮೆ" ಇಂದು ಚಿತ್ರಮಂದಿರಗಳಲ್ಲಿ ಬಿಡುಗಡೆಯಾಗಿದೆ.',
            keywords: ['ಕನ್ನಡ ಸಿನಿಮಾ', 'ಸ್ಯಾಂಡಲ್‌ವುಡ್', 'ರಮೇಶ್ ಅರವಿಂದ್']
        }
    },
    {
        id: 'belagavi-politics-update-7',
        title: 'ಬೆಳಗಾವಿ ರಾಜಕೀಯ: ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆ ಕಾವು',
        content: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ಮುಂಬರುವ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆಯ ಕಾವು ಹೆಚ್ಚಾಗುತ್ತಿದೆ. ಪ್ರಮುಖ ರಾಜಕೀಯ ಪಕ್ಷಗಳು ತಮ್ಮ ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಅಂತಿಮಗೊಳಿಸುವಲ್ಲಿ ನಿರತವಾಗಿವೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['belagavi-politics-update-7'].seed}/800/600`,
        "data-ai-hint": typedImageData['belagavi-politics-update-7'].hint,
        author: 'ವಿಜಯ ಕರ್ನಾಟಕ',
        authorId: 'vk-reporter',
        categoryIds: ['politics'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ವಿಜಯ ಕರ್ನಾಟಕ',
        views: 700,
        districtId: 'belagavi',
        seo: {
            metaDescription: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ಮುಂಬರುವ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆಗೆ ರಾಜಕೀಯ ಚಟುವಟಿಕೆಗಳು ಗರಿಗೆದರಿದ್ದು, ಪ್ರಮುಖ ಪಕ್ಷಗಳು ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಅಂತಿಮಗೊಳಿಸುತ್ತಿವೆ.',
            keywords: ['ಬೆಳಗಾವಿ', 'ಕರ್ನಾಟಕ ರಾಜಕೀಯ', 'ಚುನಾವಣೆಗಳು']
        }
    },
    {
        id: 'startup-funding-bangalore-8',
        title: 'ಬೆಂಗಳೂರಿನ ಆರೋಗ್ಯ ತಂತ್ರಜ್ಞಾನ ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗೆ $5 ಮಿಲಿಯನ್ ಹೂಡಿಕೆ',
        content: 'ಬೆಂಗಳೂರು ಮೂಲದ ಆರೋಗ್ಯ ತಂತ್ರಜ್ಞಾನ ಸ್ಟಾರ್ಟ್‌ಅಪ್ "ಆರೋಗ್ಯಸೇತು" ಸೀರಿಸ್ ಎ ಫಂಡಿಂಗ್‌ನಲ್ಲಿ $5 ಮಿಲಿಯನ್ ಹೂಡಿಕೆ ಪಡೆದಿದೆ. ಈ ಹಣವನ್ನು ತಮ್ಮ ತಂತ್ರಜ್ಞಾನವನ್ನು ವಿಸ್ತರಿಸಲು ಬಳಸುವುದಾಗಿ ಕಂಪನಿ ಹೇಳಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['startup-funding-bangalore-8'].seed}/800/600`,
        "data-ai-hint": typedImageData['startup-funding-bangalore-8'].hint,
        author: 'ಯುವರ್‌ಸ್ಟೋರಿ',
        authorId: 'ys-reporter',
        categoryIds: ['business-startups', 'technology', 'health-lifestyle'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಯುವರ್‌ಸ್ಟೋರಿ',
        views: 1800,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ಬೆಂಗಳೂರು ಮೂಲದ ಆರೋಗ್ಯ-ತಂತ್ರಜ್ಞಾನ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ಆರೋಗ್ಯಸೇತು, ತನ್ನ ತಂತ್ರಜ್ಞಾನ ವೇದಿಕೆಯನ್ನು ವಿಸ್ತರಿಸಲು ಸೀರಿಸ್ ಎ ಫಂಡಿಂಗ್‌ನಲ್ಲಿ $5 ಮಿಲಿಯನ್ ಸಂಗ್ರಹಿಸಿದೆ.',
            keywords: ['ಸ್ಟಾರ್ಟ್‌ಅಪ್', 'ಹೂಡಿಕೆ', 'ಬೆಂಗಳೂರು', 'ಆರೋಗ್ಯ ತಂತ್ರಜ್ಞಾನ']
        }
    },
    {
        id: 'hampi-utsav-announcement-9',
        title: 'ಹಂಪಿ ಉತ್ಸವ ದಿನಾಂಕ ಪ್ರಕಟ: ಪ್ರವಾಸೋದ್ಯಮಕ್ಕೆ ಉತ್ತೇಜನ',
        content: 'ವಿಶ್ವಪ್ರಸಿದ್ಧ ಹಂಪಿ ಉತ್ಸವದ ದಿನಾಂಕಗಳನ್ನು ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಪ್ರಕಟಿಸಿದೆ. ಈ ವರ್ಷದ ಉತ್ಸವವು ವಿಜಯನಗರ ಜಿಲ್ಲೆಯ ಪ್ರವಾಸೋದ್ಯಮಕ್ಕೆ ದೊಡ್ಡ ಉತ್ತೇಜನ ನೀಡುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['hampi-utsav-announcement-9'].seed}/800/600`,
        "data-ai-hint": typedImageData['hampi-utsav-announcement-9'].hint,
        author: 'ಕೆಎನ್‌ಪಿ ಸಿಬ್ಬಂದಿ',
        authorId: 'admin',
        categoryIds: ['society-community', 'entertainment'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಕೆಎನ್‌ಪಿ ಆಂತರಿಕ',
        views: 2100,
        districtId: 'vijayanagara',
        seo: {
            metaDescription: 'ವಿಶ್ವವಿಖ್ಯಾತ ಹಂಪಿ ಉತ್ಸವದ ದಿನಾಂಕಗಳನ್ನು ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಪ್ರಕಟಿಸಿದ್ದು, ಇದು ಪ್ರವಾಸೋದ್ಯಮವನ್ನು ಉತ್ತೇಜಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
            keywords: ['ಹಂಪಿ ಉತ್ಸವ', 'ವಿಜಯನಗರ', 'ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ']
        }
    },
    {
        id: 'udupi-beach-cleanup-10',
        title: 'ಉಡುಪಿಯ ಮಲ್ಪೆ ಕಡಲತೀರದಲ್ಲಿ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ',
        content: 'ಸ್ಥಳೀಯ ಎನ್‌ಜಿಒ ಮತ್ತು ಸ್ವಯಂಸೇವಕರು ಉಡುಪಿಯ ಮಲ್ಪೆ ಕಡಲತೀರದಲ್ಲಿ ಬೃಹತ್ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನವನ್ನು ನಡೆಸಿದರು. ಈ ಕಾರ್ಯಕ್ರಮವು ಕಡಲತೀರದ ಪರಿಸರ ಸಂರಕ್ಷಣೆಯ ಬಗ್ಗೆ ಜಾಗೃತಿ ಮೂಡಿಸಿತು.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['udupi-beach-cleanup-10'].seed}/800/600`,
        "data-ai-hint": typedImageData['udupi-beach-cleanup-10'].hint,
        author: 'ಉದಯವಾಣಿ',
        authorId: 'udayavani-reporter',
        categoryIds: ['weather-environment', 'society-community'],
        status: 'published',
        publishedAt: getYesterday().toISOString(),
        createdAt: getYesterday().toISOString(),
        updatedAt: getYesterday().toISOString(),
        source: 'ಉದಯವಾಣಿ',
        views: 1100,
        districtId: 'udupi',
        seo: {
            metaDescription: 'ಕರಾವಳಿ ಸಂರಕ್ಷಣೆಯನ್ನು ಉತ್ತೇಜಿಸಲು ಸ್ಥಳೀಯ ಎನ್‌ಜಿಒ ಮತ್ತು ಸ್ವಯಂಸೇವಕರು ಉಡುಪಿಯ ಮಲ್ಪೆ ಕಡಲತೀರದಲ್ಲಿ ಬೃಹತ್ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನವನ್ನು ನಡೆಸಿದರು.',
            keywords: ['ಉಡುಪಿ', 'ಮಲ್ಪೆ ಬೀಚ್', 'ಪರಿಸರ', 'ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ']
        }
    },
    {
        id: 'bengaluru-suburban-rail-update-11',
        title: 'ಬೆಂಗಳೂರು ಉಪನಗರ ರೈಲು ಯೋಜನೆ: ಮೊದಲ ಹಂತದ ಕಾಮಗಾರಿ ಚುರುಕು',
        content: 'ಬೆಂಗಳೂರಿನ ಸಂಚಾರ ದಟ್ಟಣೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಗುರಿ ಹೊಂದಿರುವ ಉಪನಗರ ರೈಲು ಯೋಜನೆಯ ಮೊದಲ ಹಂತದ ಕಾಮಗಾರಿಗಳು ವೇಗ ಪಡೆದುಕೊಂಡಿವೆ. ಈ ಯೋಜನೆಯು ನಗರದ ವಿವಿಧ ಭಾಗಗಳಿಗೆ ತ್ವರಿತ ಸಂಪರ್ಕವನ್ನು ಒದಗಿಸಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-suburban-rail-update-11'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-suburban-rail-update-11'].hint,
        author: 'ಡೆಕ್ಕನ್ ಹೆರಾಲ್ಡ್',
        authorId: 'dh-reporter',
        categoryIds: ['society-community', 'business-startups'],
        status: 'published',
        publishedAt: getTwoDaysAgo().toISOString(),
        createdAt: getTwoDaysAgo().toISOString(),
        updatedAt: getTwoDaysAgo().toISOString(),
        source: 'ಡೆಕ್ಕನ್ ಹೆರಾಲ್ಡ್',
        views: 1950,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ಸಂಚಾರ ದಟ್ಟಣೆಯನ್ನು ಸರಾಗಗೊಳಿಸುವ ಗುರಿಯನ್ನು ಹೊಂದಿರುವ ಬೆಂಗಳೂರು ಉಪನಗರ ರೈಲು ಯೋಜನೆಯ ಮೊದಲ ಹಂತದ ಕಾಮಗಾರಿಗಳು ವೇಗ ಪಡೆದುಕೊಂಡಿವೆ.',
            keywords: ['ಬೆಂಗಳೂರು', 'ಉಪನಗರ ರೈಲು', 'ಮೂಲಸೌಕರ್ಯ', 'ಸಂಚಾರ']
        }
    },
    {
        id: 'kannada-unicode-font-release-12',
        title: 'ಹೊಸ ಕನ್ನಡ ಯೂನಿಕೋಡ್ ಫಾಂಟ್ ಬಿಡುಗಡೆ',
        content: 'ಕನ್ನಡ ಭಾಷೆಯ ಡಿಜಿಟಲ್ ಬಳಕೆಯನ್ನು ಉತ್ತೇಜಿಸಲು, ಕರ್ನಾಟಕ ಸರ್ಕಾರವು ಹೊಸ ಯೂನಿಕೋಡ್ ಫಾಂಟ್ ಅನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿದೆ. ಇದು ಸುಲಭವಾಗಿ ಲಭ್ಯವಿದ್ದು, ವಿವಿಧ ಡಿಜಿಟಲ್ ವೇದಿಕೆಗಳಲ್ಲಿ ಬಳಸಬಹುದಾಗಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['kannada-unicode-font-release-12'].seed}/800/600`,
        "data-ai-hint": typedImageData['kannada-unicode-font-release-12'].hint,
        author: 'ಕೆಎನ್‌ಪಿ ಸಿಬ್ಬಂದಿ',
        authorId: 'admin',
        categoryIds: ['technology', 'society-community'],
        status: 'published',
        publishedAt: getTwoDaysAgo().toISOString(),
        createdAt: getTwoDaysAgo().toISOString(),
        updatedAt: getTwoDaysAgo().toISOString(),
        source: 'ಕೆಎನ್‌ಪಿ ಆಂತರಿಕ',
        views: 650,
        districtId: 'bengaluru-urban',
        seo: {
            metaDescription: 'ಕನ್ನಡ ಭಾಷೆಯ ಡಿಜಿಟಲ್ ಬಳಕೆಯನ್ನು ಉತ್ತೇಜಿಸಲು ಕರ್ನಾಟಕ ಸರ್ಕಾರವು ಹೊಸ ಕನ್ನಡ ಯೂನಿಕೋಡ್ ಫಾಂಟ್ ಅನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿದೆ.',
            keywords: ['ಕನ್ನಡ', 'ಯೂನಿಕೋಡ್', 'ಫಾಂಟ್', 'ತಂತ್ರಜ್ಞಾನ', 'ಭಾಷೆ']
        }
    },
    {
        id: 'bengaluru-mysuru-expressway-tolls-13',
        title: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ: ಟೋಲ್ ದರ ಪರಿಷ್ಕರಣೆ',
        content: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಯಲ್ಲಿನ ಟೋಲ್ ದರಗಳನ್ನು ಪರಿಷ್ಕರಿಸಲಾಗಿದೆ. ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ಪ್ರಾಧಿಕಾರವು ಹೊಸ ದರಗಳನ್ನು ಪ್ರಕಟಿಸಿದ್ದು, ಇದು ಪ್ರಯಾಣಿಕರ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['bengaluru-mysuru-expressway-tolls-13'].seed}/800/600`,
        "data-ai-hint": typedImageData['bengaluru-mysuru-expressway-tolls-13'].hint,
        author: 'ಪ್ರಜಾವಾಣಿ',
        authorId: 'prajavani-reporter',
        categoryIds: ['society-community', 'politics'],
        status: 'published',
        publishedAt: getThreeDaysAgo().toISOString(),
        createdAt: getThreeDaysAgo().toISOString(),
        updatedAt: getThreeDaysAgo().toISOString(),
        source: 'ಪ್ರಜಾವಾಣಿ',
        views: 2800,
        districtId: 'ramanagara',
        seo: {
            metaDescription: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇಯಲ್ಲಿನ ಟೋಲ್ ದರಗಳನ್ನು ಭಾರತೀಯ ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ಪ್ರಾಧಿಕಾರ (NHAI) ಪರಿಷ್ಕರಿಸಿದೆ.',
            keywords: ['ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ', 'ಟೋಲ್', 'ಎನ್‌ಎಚ್‌ಎಐ', 'ಪ್ರಯಾಣ']
        }
    },
    {
        id: 'mandya-sugarcane-farmers-protest-14',
        title: 'ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಗಾರರ ಪ್ರತಿಭಟನೆ, ಸರ್ಕಾರಕ್ಕೆ ಎಚ್ಚರಿಕೆ',
        content: 'ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಗಾರರು ತಮ್ಮ ಬೇಡಿಕೆಗಳ ಈಡೇರಿಕೆಗೆ ಆಗ್ರಹಿಸಿ ಬೃಹತ್ ಪ್ರತಿಭಟನೆ ನಡೆಸಿದರು. ನ್ಯಾಯಯುತ ಬೆಲೆ ನಿಗದಿ ಮಾಡುವಂತೆ ಸರ್ಕಾರಕ್ಕೆ ಮನವಿ ಸಲ್ಲಿಸಿದರು.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['mandya-sugarcane-farmers-protest-14'].seed}/800/600`,
        "data-ai-hint": typedImageData['mandya-sugarcane-farmers-protest-14'].hint,
        author: 'ಸುವರ್ಣ ನ್ಯೂಸ್',
        authorId: 'suvarna-reporter',
        categoryIds: ['politics', 'society-community'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'ಸುವರ್ಣ ನ್ಯೂಸ್',
        views: 1300,
        districtId: 'mandya',
        seo: {
            metaDescription: 'ಮಂಡ್ಯದಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಗಾರರು ನ್ಯಾಯಯುತ ಬೆಲೆಗೆ ಆಗ್ರಹಿಸಿ ಬೃಹತ್ ಪ್ರತಿಭಟನೆ ನಡೆಸಿ ಸರ್ಕಾರಕ್ಕೆ ಜ್ಞಾಪಕ ಪತ್ರ ಸಲ್ಲಿಸಿದರು.',
            keywords: ['ಮಂಡ್ಯ', 'ರೈತರ ಪ್ರತಿಭಟನೆ', 'ಕಬ್ಬು', 'ಕೃಷಿ']
        }
    },
    {
        id: 'uttara-kannada-new-bridge-15',
        title: 'ಉತ್ತರ ಕನ್ನಡ: ಕಾಳಿ ನದಿಗೆ ಹೊಸ ಸೇತುವೆ ನಿರ್ಮಾಣಕ್ಕೆ ಚಾಲನೆ',
        content: 'ಉತ್ತರ ಕನ್ನಡ ಜಿಲ್ಲೆಯ ಪ್ರಮುಖ ಸಂಪರ್ಕ ಕೊಂಡಿಯಾಗಿರುವ ಕಾಳಿ ನದಿಗೆ ಹೊಸ ಸೇತುವೆ ನಿರ್ಮಾಣಕ್ಕೆ ಕೇಂದ್ರ ಸರ್ಕಾರ ಚಾಲನೆ ನೀಡಿದೆ. ಇದರಿಂದಾಗಿ ಸಂಚಾರ ದಟ್ಟಣೆ ಕಡಿಮೆಯಾಗಲಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['uttara-kannada-new-bridge-15'].seed}/800/600`,
        "data-ai-hint": typedImageData['uttara-kannada-new-bridge-15'].hint,
        author: 'ಪಬ್ಲಿಕ್ ಟಿವಿ',
        authorId: 'public-tv-reporter',
        categoryIds: ['society-community', 'business-startups'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'ಪಬ್ಲಿಕ್ ಟಿವಿ',
        views: 980,
        districtId: 'uttara-kannada',
        seo: {
            metaDescription: 'ಸಂಚಾರ ದಟ್ಟಣೆಯನ್ನು ಸರಾಗಗೊಳಿಸಲು ಉತ್ತರ ಕನ್ನಡದ ಕಾಳಿ ನದಿಗೆ ಹೊಸ ಸೇತುವೆ ನಿರ್ಮಾಣವನ್ನು ಕೇಂದ್ರ ಸರ್ಕಾರವು ಪ್ರಾರಂಭಿಸಿದೆ.',
            keywords: ['ಉತ್ತರ ಕನ್ನಡ', 'ಸೇತುವೆ', 'ಮೂಲಸೌಕರ್ಯ', 'ಕಾಳಿ ನದಿ']
        }
    },
    {
        id: 'chikkamagaluru-folk-art-festival-16',
        title: 'ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಜನಪದ ಕಲಾ ಉತ್ಸವಕ್ಕೆ ಅದ್ದೂರಿ ಚಾಲನೆ',
        content: 'ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಮೂರು ದಿನಗಳ ಕಾಲ ನಡೆಯುವ ಜನಪದ ಕಲಾ ಉತ್ಸವಕ್ಕೆ ಇಂದು ಅದ್ದೂರಿಯಾಗಿ ಚಾಲನೆ ದೊರೆಯಿತು. ರಾಜ್ಯದ ವಿವಿಧ ಭಾಗಗಳಿಂದ ಕಲಾವಿದರು ಇದರಲ್ಲಿ ಭಾಗವಹಿಸಿದ್ದಾರೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['chikkamagaluru-folk-art-festival-16'].seed}/800/600`,
        "data-ai-hint": typedImageData['chikkamagaluru-folk-art-festival-16'].hint,
        author: 'ಟಿವಿ9 ಕನ್ನಡ',
        authorId: 'tv9-reporter',
        categoryIds: ['entertainment', 'society-community'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'ಟಿವಿ9 ಕನ್ನಡ',
        views: 1550,
        districtId: 'chikkamagaluru',
        seo: {
            metaDescription: 'ಚಿಕ್ಕಮಗಳೂರಿನಲ್ಲಿ ಮೂರು ದಿನಗಳ ಜಾನಪದ ಕಲಾ ಉತ್ಸವವು ಅದ್ದೂರಿಯಾಗಿ ಪ್ರಾರಂಭವಾಗಿದ್ದು, ರಾಜ್ಯದ ವಿವಿಧ ಭಾಗಗಳ ಕಲಾವಿದರು ಭಾಗವಹಿಸುತ್ತಿದ್ದಾರೆ.',
            keywords: ['ಚಿಕ್ಕಮಗಳೂರು', 'ಜಾನಪದ ಕಲೆ', 'ಹಬ್ಬ', 'ಸಂಸ್ಕೃತಿ']
        }
    },
    {
        id: 'tumakuru-industrial-area-17',
        title: 'ತುಮಕೂರಿನಲ್ಲಿ ಹೊಸ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ: 10,000 ಉದ್ಯೋಗ ಸೃಷ್ಟಿ ನಿರೀಕ್ಷೆ',
        content: 'ತುಮಕೂರು ಬಳಿ ಹೊಸ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶವನ್ನು ಸ್ಥಾಪಿಸಲು ಸರ್ಕಾರ ಅನುಮೋದನೆ ನೀಡಿದೆ. ಇದರಿಂದ ಸುಮಾರು 10,000 ನೇರ ಹಾಗೂ ಪರೋಕ್ಷ ಉದ್ಯೋಗಗಳು ಸೃಷ್ಟಿಯಾಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
        imageUrl: `https://picsum.photos/seed/${typedImageData['tumakuru-industrial-area-17'].seed}/800/600`,
        "data-ai-hint": typedImageData['tumakuru-industrial-area-17'].hint,
        author: 'ಇಟಿವಿ ಭಾರತ್ ಕನ್ನಡ',
        authorId: 'etv-reporter',
        categoryIds: ['business-startups', 'jobs-career'],
        status: 'published',
        publishedAt: getFourDaysAgo().toISOString(),
        createdAt: getFourDaysAgo().toISOString(),
        updatedAt: getFourDaysAgo().toISOString(),
        source: 'ಇಟಿವಿ ಭಾರತ್ ಕನ್ನಡ',
        views: 2200,
        districtId: 'tumakuru',
        seo: {
            metaDescription: 'ತುಮಕೂರು ಬಳಿ ಹೊಸ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶಕ್ಕೆ ಸರ್ಕಾರ ಅನುಮೋದನೆ ನೀಡಿದ್ದು, ಇದು ಸುಮಾರು 10,000 ನೇರ ಮತ್ತು ಪರೋಕ್ಷ ಉದ್ಯೋಗಗಳನ್ನು ಸೃಷ್ಟಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.',
            keywords: ['ತುಮಕೂರು', 'ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ', 'ಉದ್ಯೋಗಗಳು', 'ಹೂಡಿಕೆ']
        }
    }
];

    