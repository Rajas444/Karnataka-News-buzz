
import { redirect } from 'next/navigation';

// This page exists to capture the dynamic article ID from the URL
// and then immediately redirect to the homepage, where the modal logic
// is handled. The modal will open based on the presence of the ID.
// For now, we will just redirect to home. A more sophisticated implementation
// could open the modal directly.
export default function ArticlePageRedirect({ params }: { params: { id: string } }) {
  redirect('/home');
}
