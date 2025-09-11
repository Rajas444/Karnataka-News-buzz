
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Settings, ShieldCheck, Users, BarChart2, Tags, MapPin, Briefcase } from "lucide-react";
import DashboardStats from "@/components/admin/DashboardStats";
import ActivityLog from "@/components/admin/ActivityLog";
import AiAssistant from "@/components/admin/AIAssistant";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Article Management",
    description: "Add, edit, and delete news articles with a rich text editor.",
    href: "/admin/articles"
  },
  {
    icon: Briefcase,
    title: "Job Management",
    description: "Create, update, and manage job postings for the jobs section.",
    href: "/admin/jobs"
  },
  {
    icon: Tags,
    title: "Category Management",
    description: "Organize your content by creating or modifying news categories.",
    href: "/admin/categories"
  },
  {
    icon: MapPin,
    title: "District Filtering",
    description: "Manage districts to allow for location-based news filtering.",
    href: "/admin/districts"
  },
  {
    icon: Users,
    title: "User Management",
    description: "View, block, or remove users to maintain a healthy community.",
    href: "/admin/users"
  },
  {
    icon: BarChart2,
    title: "Insightful Analytics",
    description: "Track total news, active users, and trending topics.",
    href: "/admin/analytics"
  },
  {
    icon: ShieldCheck,
    title: "Secure & Protected",
    description: "Role-based access ensures only admins can manage the portal.",
    href: "/admin/settings"
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your news portal.</p>
        </div>
        <Button asChild>
            <Link href="/admin/articles/new">Create New Article</Link>
        </Button>
      </div>

      <DashboardStats />

      <Card>
        <CardHeader>
          <CardTitle>Admin Panel Features</CardTitle>
          <CardDescription>
            This panel provides full control over the news portal's content and users.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} className="group">
              <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                  <feature.icon className="h-8 w-8 mt-1 text-primary group-hover:text-accent-foreground" />
                  <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">{feature.description}</p>
                  </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <AiAssistant />
        <ActivityLog />
      </div>

    </div>
  );
}
