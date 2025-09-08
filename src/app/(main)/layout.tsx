import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AIChatWidget from '@/components/shared/AIChatWidget';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
