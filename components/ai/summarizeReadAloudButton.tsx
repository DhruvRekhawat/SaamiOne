'use client';

import { generateSummary } from '@/app/actions/generateSummary';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle
} from '@/components/ui/drawer';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SummarizeReadAloudButton({ emailBody }: { emailBody: string }) {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('emailBody', emailBody);
      const generatedSummary = await generateSummary(formData);
      setSummary(generatedSummary || '');
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakSummary = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (summary) {
      speakSummary(summary);
    }
  }, [summary]);

  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={handleGenerateSummary} 
        disabled={isGenerating}
        variant={"secondary"}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Summarize
      </Button>

      {summary && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className='max-w-[800px] mx-auto'>
            <DrawerHeader>
              <DrawerTitle>Email Summary</DrawerTitle>
              <DrawerDescription>
                {summary}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex justify-end p-4">
              <Button 
                variant="outline" 
                onClick={isSpeaking ? stopSpeaking : () => speakSummary(summary)}
              >
                {isSpeaking ? (
                  <VolumeX className="mr-2 h-4 w-4" />
                ) : (
                  <Volume2 className="mr-2 h-4 w-4" />
                )}
                {isSpeaking ? 'Stop' : 'Speak'}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}