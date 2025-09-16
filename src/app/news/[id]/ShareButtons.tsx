
'use client';

import { Button } from "@/components/ui/button";
import { Facebook, Twitter, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Share:</span>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                    <MessageCircle className="h-4 w-4" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                    <Twitter className="h-4 w-4" />
                </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <Facebook className="h-4 w-4" />
                </a>
            </Button>
        </div>
    );
}
