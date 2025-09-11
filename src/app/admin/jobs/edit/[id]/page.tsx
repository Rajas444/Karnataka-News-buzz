
'use client';

import { useParams } from 'next/navigation';
import JobForm from '@/components/admin/JobForm';
import { Briefcase, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getJob } from '@/services/jobs';
import { useEffect, useState } from 'react';
import type { Job } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EditJobPage() {
  const params = useParams();
  const { id } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
      if (typeof id !== 'string') return;
      
      async function fetchJob() {
          try {
              const fetchedJob = await getJob(id);
              if (fetchedJob) {
                  setJob(fetchedJob);
              } else {
                  toast({ title: 'Job not found', variant: 'destructive' });
              }
          } catch (error) {
               toast({ title: 'Error fetching job', variant: 'destructive' });
          } finally {
              setLoading(false);
          }
      }
      fetchJob();
  }, [id, toast]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Loading Job...</h2>
        </div>
      );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <Briefcase className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Job not found</h2>
        <p className="mt-2 text-muted-foreground">
          The job posting you are looking for does not exist.
        </p>
        <Link href="/admin/jobs">
          <span className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
            Back to Jobs
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Edit Job Posting</h1>
        <p className="text-muted-foreground">Make changes to the job details below.</p>
      </div>
      <JobForm initialData={job} />
    </div>
  );
}
