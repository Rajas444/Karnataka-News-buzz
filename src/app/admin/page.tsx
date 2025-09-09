
import { Button } from '@/components/ui/button';
import DashboardStats from '@/components/admin/DashboardStats';
import TrafficChart from '@/components/admin/TrafficChart';
import ActivityLog from '@/components/admin/ActivityLog';
import { FilePlus2, Tags } from 'lucide-react';
import Link from 'next/link';
import AiAssistant from '@/components/admin/AIAssistant';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your news portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/articles/new">
              <FilePlus2 className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
          <Button variant="secondary" asChild>
             <Link href="/admin/categories">
              <Tags className="mr-2 h-4 w-4" />
              Manage Categories
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStats />
      
      <div className="grid gap-8 lg:grid-cols-2">
        <AiAssistant />
        <ActivityLog />
      </div>

      <TrafficChart />
    </div>
  );
}
