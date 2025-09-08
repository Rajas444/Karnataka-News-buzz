import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground font-headline text-lg">Karnataka News Buzz</span>
            </Link>
            <p className="text-sm">Your daily source for news and updates from across Karnataka.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/categories/politics" className="hover:text-primary transition-colors">Politics</Link></li>
              <li><Link href="/categories/technology" className="hover:text-primary transition-colors">Technology</Link></li>
              <li><Link href="/categories/sports" className="hover:text-primary transition-colors">Sports</Link></li>
              <li><Link href="/categories/entertainment" className="hover:text-primary transition-colors">Entertainment</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
            <p>Social media links here.</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Karnataka News Buzz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
