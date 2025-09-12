
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Job, JobFormValues, JobType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { createJob, updateJob } from '@/services/jobs';
import { jobFormSchema } from '@/lib/types';

const jobTypes: JobType[] = ['Government', 'Private', 'Fresher', 'Internship'];

interface JobFormProps {
  initialData?: Job;
}

export default function JobForm({ initialData }: JobFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      location: initialData?.location || '',
      qualification: initialData?.qualification || '',
      description: initialData?.description || '',
      applyLink: initialData?.applyLink || '',
      jobType: initialData?.jobType || 'Government',
      lastDateToApply: initialData?.lastDateToApply ? new Date(initialData.lastDateToApply) : undefined,
    },
  });


  async function onSubmit(values: JobFormValues) {
    setIsSubmitting(true);
    try {
        if (initialData) {
            await updateJob(initialData.id, values);
        } else {
            await createJob(values);
        }
        const action = initialData ? 'updated' : 'created';
        toast({
            title: `Job ${action}!`,
            description: `The job posting has been successfully ${action}.`,
        });
        router.push('/admin/jobs');
        router.refresh();
    } catch (error) {
        console.error(error);
        toast({ title: `Failed to ${initialData ? 'update' : 'create'} job`, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company / Organization</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Karnataka Government" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Bengaluru" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., B.E in Computer Science, PUC" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="applyLink"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Apply Link</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/apply" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a job type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {jobTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                control={form.control}
                name="lastDateToApply"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Last Date to Apply</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
              </div>
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the job, responsibilities, and qualifications."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
           <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
            </Button>
      </form>
    </Form>
  );
}
