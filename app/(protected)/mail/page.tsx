import { auth } from "@/auth";
import { SummarizeReadAloudButton } from "@/components/ai/summarizeReadAloudButton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "next-auth";

// Type for email message
interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  body:string;
}

function isSessionWithToken(
  session: Session | null
): session is Session & { accessToken: string } {
  return session !== null && "accessToken" in session;
}

function decodeBase64(data: string) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

function getEmailBody(payload: any): string {
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
        return decodeBase64(part.body.data);
      }
      if (part.parts) {
        const body = getEmailBody(part);
        if (body) return body;
      }
    }
  }
  
  return '';
}




async function MailPage() {
  const session = await auth();

  if (!isSessionWithToken(session)) {
    return <div>Please sign in to view emails</div>;
  }

  try {
    const messages = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
    const fullMessages: EmailMessage[] = await Promise.all(
      messages.messages.map(async (msg: { id: string }) => {
        const fullMessage = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        ).then((res) => res.json());

        const headers = fullMessage.payload.headers;
        const subject =
          headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h: any) => h.name === "From")?.value || "";
        const date = headers.find((h: any) => h.name === "Date")?.value || "";

        // Check if message has UNREAD label
        const isUnread = fullMessage.labelIds?.includes("UNREAD") || false;

        return {
          id: fullMessage.id,
          threadId: fullMessage.threadId,
          subject,
          from,
          date,
          snippet: fullMessage.snippet,
          isUnread,
          body: getEmailBody(fullMessage.payload),
        };
      })
    );



    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Emails</h1>
        <Tabs defaultValue="unread" className="w-full">
          <TabsList>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            {" "}
            <div className="space-y-4">
              {fullMessages.map((email) => (
                <Card
                  key={email.id}
                  className={`border p-4 rounded-lg ${
                    email.isUnread ? "" : "hidden"
                  }`}
                >
                  <h2 className="font-semibold">{email.subject}</h2>
                  <p className="text-sm text-gray-600">{email.from}</p>
                  <p className="text-sm text-gray-500">{email.date}</p>
                  <p className="my-2">{email.snippet}</p>
                  <SummarizeReadAloudButton emailBody={email.body}></SummarizeReadAloudButton>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="read">
            {" "}
            <div className="space-y-4">
              {fullMessages.map((email) => (
                <Card
                  key={email.id}
                  className={`border p-4 rounded-lg bg-zinc-100 ${
                    email.isUnread ? "hidden" : ""
                  }`}
                >
                  <h2 className="font-semibold">{email.subject}</h2>
                  <p className="text-sm text-gray-600">{email.from}</p>
                  <p className="text-sm text-gray-500">{email.date}</p>
                  <p className="mt-2">{email.snippet}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Error fetching emails:", error);
    return <div>Error loading emails</div>;
  }
}

export default MailPage;
