
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Building, Calendar, Globe, Loader2, MapPin, BookUser } from 'lucide-react';
import type { Job, JobType } from '@/lib/types';
import { getJobs } from '@/services/jobs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

const jobTypes: JobType[] = ['Government', 'Private', 'Fresher', 'Internship'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobType, setSelectedJobType] = useState<JobType | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const fetchedJobs = await getJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        toast({ title: 'Failed to load jobs', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [toast]);

  const filteredJobs = jobs.filter(job => {
    const isExpired = new Date(job.lastDateToApply) < new Date();
    if (isExpired) return false;
    if (selectedJobType === 'all') return true;
    return job.jobType === selectedJobType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">Find Your Next Opportunity</h1>
        <p className="text-muted-foreground text-lg">Browse the latest job openings in Karnataka.</p>
      </header>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle>Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="max-w-xs">
                <Select onValueChange={(value) => setSelectedJobType(value as JobType | 'all')} value={selectedJobType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {jobTypes.map(type => (
                            <SelectItem key={type} value={type}>{type} Jobs</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                    <Briefcase className="h-6 w-6 mt-1 text-primary"/>
                    <span>{job.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2">
                    <Building className="h-4 w-4" /> {job.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                 <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <BookUser className="h-4 w-4" />
                    <span>{job.qualification}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last Date: {format(new Date(job.lastDateToApply), 'PPP')}</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Job Type: {job.jobType}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                    <Link href={job.applyLink} target="_blank" rel="noopener noreferrer">Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-12 bg-card rounded-lg">
            <h2 className="text-2xl font-bold mb-4">No Jobs Found</h2>
            <p className="text-muted-foreground">
                There are no job openings for the selected filter. Please check back later.
            </p>
        </div>
      )}
    </div>
  );
}
