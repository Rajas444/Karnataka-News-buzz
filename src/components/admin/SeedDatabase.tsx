
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { seedDatabase } from '@/services/seed';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '../ui/button';

export default function SeedDatabase() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      toast({
        title: "Database Seeding Successful",
        description: `Added ${result.articles} articles, ${result.categories} categories, and ${result.districts} districts.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Database Seeding Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Database /> Seed Database
        </CardTitle>
        <CardDescription>
          Your database collections appear to be empty. Click the button below to populate your Firestore database with the placeholder articles, categories, and districts. This is a one-time action.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button disabled={isSeeding}>
                {isSeeding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Database className="mr-2 h-4 w-4" />
                )}
                {isSeeding ? 'Seeding...' : 'Seed Live Database'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to seed the database?</AlertDialogTitle>
              <AlertDialogDescription>
                This will write multiple documents to your Firestore 'articles', 'categories', and 'districts' collections. 
                This action is designed to be run once on an empty database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSeed}
                className={buttonVariants({ variant: "default" })}
              >
                Confirm & Seed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
