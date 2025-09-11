
import JobForm from '@/components/admin/JobForm';

export default function NewJobPage() {
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Job Posting</h1>
            <p className="text-muted-foreground">Fill out the details below to add a new job to the portal.</p>
        </div>
        <JobForm />
    </div>
  );
}
