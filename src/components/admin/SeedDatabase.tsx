
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    toast({
      title: "Seeding Database...",
      description: "This may take a moment. The database is being cleared and repopulated.",
    });

    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      toast({
        title: "Database Seeded!",
        description: data.message,
      });

    } catch (err: any) {
       toast({
        title: "Seeding Failed",
        description: err.message,
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Database</CardTitle>
        <CardDescription>Populate Firestore with sample articles and districts. This will clear existing data.</CardDescription>
      </CardHeader>
      <CardContent>
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Seeding..." : "Seed Live Database"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all documents in the 'news_articles' and 'districts' collections and replace them with sample data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSeed}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-sm text-muted-foreground mt-2">
            Use this if your news feed is empty or to reset to the sample data.
        </p>
      </CardContent>
    </Card>
  );
}
