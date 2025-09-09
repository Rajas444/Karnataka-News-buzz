
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, Send, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aiChat } from "@/ai/flows/ai-chat-interface";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AIChatOutput } from "@/ai/flows/ai-chat-interface";
import Link from "next/link";

interface Message {
    sender: 'user' | 'ai';
    text: string;
    relatedArticles?: AIChatOutput['relatedArticles'];
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await aiChat({ query: input });
            const aiMessage: Message = { sender: 'ai', text: result.summary, relatedArticles: result.relatedArticles };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            toast({
                title: "AI Chat Error",
                description: "Sorry, I couldn't process your request right now.",
                variant: "destructive"
            })
            // Do not remove user message on error, so they can retry
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
                    size="icon"
                >
                    <Bot className="h-8 w-8" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-[80vw] max-w-md p-0 border-none">
                <Card className="shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline text-lg">News Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px] p-4">
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div key={index} className={cn("flex items-end gap-2", message.sender === 'user' ? "justify-end" : "justify-start")}>
                                        {message.sender === 'ai' && <Avatar className="h-6 w-6"><AvatarFallback>AI</AvatarFallback></Avatar>}
                                        <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p>{message.text}</p>
                                            {message.relatedArticles && message.relatedArticles.length > 0 && (
                                                 <div className="mt-2 border-t pt-2">
                                                     <h4 className="font-semibold text-xs mb-1">Related Articles:</h4>
                                                     <ul className="list-disc list-inside space-y-1">
                                                         {message.relatedArticles.map((article, i) => (
                                                            <li key={i}>
                                                                <Link href={article.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                                                                    {article.title}
                                                                </Link>
                                                            </li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                     <div className="flex items-end gap-2 justify-start">
                                        <Avatar className="h-6 w-6"><AvatarFallback>AI</AvatarFallback></Avatar>
                                        <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4">
                        <div className="flex w-full items-center space-x-2">
                            <Button variant="ghost" size="icon" disabled={isLoading}>
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Input
                                placeholder="Ask about news..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isLoading}
                            />
                            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
