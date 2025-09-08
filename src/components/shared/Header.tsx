'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Newspaper, Search, Moon, Sun } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/categories/politics', label: 'Politics' },
  { href: '/categories/technology', label: 'Technology' },
  { href: '/categories/sports', label: 'Sports' },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      auth.signOut();
      router.push('/');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-xl">Karnataka News Buzz</span>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-4 p-4">
              <Link href="/" className="flex items-center space-x-2">
                <Newspaper className="h-6 w-6 text-primary" />
                <span className="font-bold">Karnataka News Buzz</span>
              </Link>
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
          </div>
          <nav className="hidden items-center space-x-2 md:flex">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {userRole === 'admin' && (
              <Button onClick={() => router.push('/admin')}>Dashboard</Button>
            )}
            <Button variant="outline" onClick={handleAuthAction}>
              {user ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
