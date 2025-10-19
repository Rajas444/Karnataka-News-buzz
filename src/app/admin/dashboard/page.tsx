"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Briefcase,
  Tags,
  Users,
  BarChart2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardStats from "@/components/admin/DashboardStats";
import ActivityLog from "@/components/admin/ActivityLog";
import AiAssistant from "@/components/admin/AIAssistant";
import ExternalNewsFeed from "@/components/admin/ExternalNewsFeed";
import SeedDatabase from "@/components/admin/SeedDatabase";

const features = [
  {
    icon: FileText,
    title: "Article Management",
    description: "Add, edit, and delete news articles with a rich text editor.",
    href: "/admin/articles",
  },
  {
    icon: Briefcase,
    title: "Job Management",
    description:
      "Create, update, and manage job postings for the jobs section.",
    href: "/admin/jobs",
  },
  {
    icon: Tags,
    title: "Category Management",
    description:
      "Organize your content by creating or modifying news categories.",
    href: "/admin/categories",
  },
  {
    icon: Users,
    title: "User Management",
    description:
      "View, block, or remove users to maintain a healthy community.",
    href: "/admin/users",
  },
  {
    icon: BarChart2,
    title: "Insightful Analytics",
    description: "Track total news, active users, and trending topics.",
    href: "/admin/analytics",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Protected",
    description:
      "Role-based access ensures only admins can manage the portal.",
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your news portal.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">Create New Article</Link>
        </Button>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Seed Database Card */}
      <SeedDatabase />

      {/* Admin Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel Features</CardTitle>
          <CardDescription>
            Manage all sections of the news portal from one unified dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.title} className="group">
              <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                <feature.icon className="h-8 w-8 mt-1 text-primary group-hover:text-accent-foreground" />
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* External News Feed + Activity Log */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExternalNewsFeed />
        </div>
        <div className="lg:col-span-1">
          <ActivityLog />
        </div>
      </div>

      {/* AI Assistant */}
      <div className="grid gap-8 lg:grid-cols-1">
        <AiAssistant />
      </div>
    </div>
  );
}
