import { EmailMessage } from '@/app/(protected)/mail/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Send, Wand2 } from 'lucide-react';
import { SummarizeReadAloudButton } from '../ai/summarizeReadAloudButton';

function EmailCard({ email }: { email: EmailMessage }) {
  return (
    <Card className="border p-4 rounded-lg flex items-center space-x-4">
      <Sheet>
        <div>
          <SheetTrigger className="text-start">
            <h2 className="font-semibold">{email.subject}</h2>
          </SheetTrigger>
          <p className="text-sm text-gray-600">{email.from}</p>
          <p className="text-sm text-gray-500">{email.date}</p>
          <p className="my-2">{email.snippet}</p>
          <SummarizeReadAloudButton emailBody={email.body} />
        </div>
        <SheetContent style={{ maxWidth: "90vw" }} className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{email.subject}</SheetTitle>
            <div className="flex justify-between items-center">
              <SheetDescription>
                <p className="text-sm text-gray-600">{email.from}</p>
                <p className="text-sm text-gray-500">{email.date}</p>
              </SheetDescription>
              <SummarizeReadAloudButton emailBody={email.body} />
            </div>
          </SheetHeader>
          <ScrollArea className="h-[60vh] w-full flex-grow">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </ScrollArea>
          <SheetFooter className="border-t pt-4 mt-4 flex flex-col space-y-2">
            <Textarea 
              placeholder="Type your message here..." 
              className="w-full mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
              </Button>
              <Button size="sm">
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

export default EmailCard;