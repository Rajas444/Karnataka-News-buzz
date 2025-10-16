
import { redirect } from 'next/navigation';

// This page exists to capture the dynamic article ID from the URL
// and then immediately redirect to the homepage, where the modal logic
// is handled.
export default function ArticlePageRedirect({ params }: { params: { id: string } }) {
  redirect('/home');
}
