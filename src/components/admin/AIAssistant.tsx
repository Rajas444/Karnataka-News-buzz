
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Square, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiPoweredChat } from '@/ai/flows/ai-powered-chat-interface';
import { cn } from '@/lib/utils';

// Check for SpeechRecognition API
const SpeechRecognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function AiAssistant() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setUserInput((prev) => prev + finalTranscript + ' ');
      }
    };
    
    rec.onend = () => {
      setIsRecording(false);
    };

    rec.onerror = (event) => {
      toast({
        title: 'Speech Recognition Error',
        description: `Error: ${event.error}`,
        variant: 'destructive',
      });
      setIsRecording(false);
    };

    recognition.current = rec;
  }, [toast]);

  const toggleRecording = () => {
    if (!recognition.current) return;

    if (isRecording) {
      recognition.current.stop();
      setIsRecording(false);
    } else {
      recognition.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setAiResponse('');
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }

    try {
      const result = await aiPoweredChat({ query: userInput });
      setAiResponse(result.response);
      
      if (result.audio) {
        audioRef.current = new Audio(result.audio);
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }

    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Assistant Error',
        description: 'Could not generate a response.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot /> AI Content Assistant
        </CardTitle>
        <CardDescription>
          Use your voice or text to draft headlines or article copy.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="space-y-2">
            <label htmlFor="user-input" className="text-sm font-medium">Your Prompt</label>
            <Textarea
            id="user-input"
            placeholder="e.g., 'Write a headline about a new tech park in Hubballi' or start recording."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            disabled={isLoading}
            />
        </div>
        <div className="flex gap-2">
            <Button onClick={toggleRecording} variant="outline" size="icon" disabled={!SpeechRecognition || isLoading}>
                {isRecording ? <Square className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={handleSubmit} className="flex-grow" disabled={isLoading || !userInput.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Generate
            </Button>
        </div>
        <div className="space-y-2 flex-grow">
            <label htmlFor="ai-response" className="text-sm font-medium">Generated Content</label>
            <Textarea
                id="ai-response"
                placeholder="AI response will appear here..."
                value={aiResponse}
                readOnly
                rows={8}
                className="bg-muted flex-grow"
            />
        </div>
      </CardContent>
    </Card>
  );
}
