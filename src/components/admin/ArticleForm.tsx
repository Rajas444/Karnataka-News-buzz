
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { CalendarIcon, Sparkles, Upload } from 'lucide-react';
import { placeholderCategories, placeholderDistricts } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { generateHeadline } from '@/ai/flows/ai-headline-generator';
import { useToast } from '@/hooks/use-toast';
import type { Article } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';


const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  content: z.string().min(50, 'Content must be at least 50 characters long.'),
  status: z.enum(['draft', 'published', 'scheduled']),
  categoryId: z.string().nonempty('Please select a category.'),
  districtId: z.string().nonempty('Please select a district.'),
  publishedAt: z.date().optional(),
  imageUrl: z.string().nullable().optional(),
  seoMetaDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
});

type ArticleFormProps = {
  initialData?: Article;
};

export default function ArticleForm({ initialData }: ArticleFormProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
    const { toast } = useToast();
    const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      status: initialData?.status || 'draft',
      categoryId: initialData?.categoryIds[0] || '',
      districtId: initialData?.districtId || '',
      publishedAt: initialData?.publishedAt,
      imageUrl: initialData?.imageUrl,
      seoMetaDescription: initialData?.seo.metaDescription || '',
      seoKeywords: initialData?.seo.keywords.join(', ') || '',
    },
  });

  useEffect(() => {
    if (initialData) {
        form.reset({
            title: initialData.title,
            content: initialData.content,
            status: initialData.status,
            categoryId: initialData.categoryIds[0],
            districtId: initialData.districtId,
            publishedAt: initialData.publishedAt,
            imageUrl: initialData.imageUrl,
            seoMetaDescription: initialData.seo.metaDescription,
            seoKeywords: initialData.seo.keywords.join(', '),
        });
        setImagePreview(initialData.imageUrl);
    }
  }, [initialData, form]);

  async function handleGenerateHeadline() {
    const content = form.getValues("content");
    if (!content || content.length < 50) {
        toast({
            title: "Content too short",
            description: "Please write at least 50 characters of content to generate a headline.",
            variant: "destructive"
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateHeadline({ articleContent: content });
        form.setValue("title", result.headline);
        toast({
            title: "Headline generated!",
            description: "The AI has suggested a new headline for your article.",
        });
    } catch (error) {
        console.error("Failed to generate headline", error);
        toast({
            title: "Generation failed",
            description: "Could not generate a headline at this time.",
            variant: "destructive"
        });
    } finally {
        setIsGenerating(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result); // In a real app, this would be the URL from storage
      };
      reader.readAsDataURL(file);
      toast({ title: 'Image selected', description: 'Preview updated. Save article to persist.' });
    }
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const action = initialData ? 'updated' : 'created';
    toast({
        title: `Article ${action}!`,
        description: `Your article has been successfully ${action}.`,
    });
    router.push('/admin/articles');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Title</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input placeholder="Enter a catchy title for your article" {...field} className="pr-10" />
                            <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={handleGenerateHeadline} disabled={isGenerating}>
                                <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your article content here. Use markdown for formatting."
                        rows={15}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A rich text editor can be integrated here for better content formatting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
              <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <FormField
                    control={form.control}
                    name="seoMetaDescription"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                        <Textarea placeholder="A brief summary for search engines (max 160 characters)." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., karnataka, news, politics" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated keywords.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Publish Immediately</SelectItem>
                            <SelectItem value="scheduled">Schedule for later</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                {form.watch('status') === 'scheduled' && (
                    <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Publication Date</FormLabel>
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
                                disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                 <Button type="submit" className="w-full">{initialData ? 'Update Article' : 'Save Article'}</Button>
                </CardContent>
            </Card>
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                 <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Image Preview" width={200} height={150} className="rounded-lg object-cover aspect-video w-full" />
                  ) : (
                    <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">No image</p>
                    </div>
                  )}
                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button variant="outline" className="w-full" asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                  </Button>
                </div>
              </div>
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {placeholderCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {placeholderDistricts.map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
