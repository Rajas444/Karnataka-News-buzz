
import { redirect } from 'next/navigation';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

// This page is now a redirector to centralize filtering on the homepage.
export default function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = params;
    if (slug) {
        redirect(`/home?category=${slug}`);
    } else {
        redirect('/home');
    }
}
