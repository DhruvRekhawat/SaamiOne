import { auth } from "@/auth";
import EmailCard from "@/components/email/email-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";

// Type for email message
export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  body: string;
  avatarUrl: string;
}

// function decodeBase64(data: string) {
//   return Buffer.from(data, "base64").toString("utf-8");
// }

function getEmailBody(payload: any): string {
  // Helper function to decode base64 safely
  const decodeBase64Safe = (data: string) => {
    try {
      return Buffer.from(data, "base64").toString("utf-8");
    } catch (error) {
      console.error("Base64 decoding error:", error);
      return "";
    }
  };

  // Recursive function to extract HTML or plain text body
  const extractBody = (part: any): string => {
    // Check if this part is a direct body
    if (part.body?.data) {
      // Prioritize HTML over plain text
      if (part.mimeType === "text/html") {
        return decodeBase64Safe(part.body.data);
      } else if (part.mimeType === "text/plain") {
        return `<pre>${decodeBase64Safe(part.body.data)}</pre>`;
      }
    }

    // If this is a multipart message, recursively search for HTML/text
    if (part.parts) {
      for (const subPart of part.parts) {
        // Prioritize HTML
        if (subPart.mimeType === "text/html") {
          return decodeBase64Safe(subPart.body.data);
        }
      }

      // If no HTML, look for plain text
      for (const subPart of part.parts) {
        if (subPart.mimeType === "text/plain") {
          return `<pre>${decodeBase64Safe(subPart.body.data)}</pre>`;
        }
      }

      // Recursively check nested parts
      for (const subPart of part.parts) {
        if (subPart.parts) {
          const nestedBody = extractBody(subPart);
          if (nestedBody) return nestedBody;
        }
      }
    }

    return "";
  };

  // Start extraction from the payload
  return extractBody(payload) || "No body found";
}

async function fetchEmails(
  accessToken: string | unknown,
  searchQuery: string
): Promise<EmailMessage[]> {
  const messagesResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      searchQuery
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  if (!messagesResponse.messages || !Array.isArray(messagesResponse.messages)) {
    console.error("No messages found or invalid response:", messagesResponse);
    return [];
  }

  const emails = await Promise.all(
    messagesResponse.messages.map(async (msg: { id: string }) => {
      try {
        const fullMessage = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        ).then((res) => res.json());

        if (!fullMessage || !fullMessage.payload || !fullMessage.payload.headers) {
          console.error("Invalid message structure:", fullMessage);
          return null; // Skip this email if it's invalid
        }

        const headers = fullMessage.payload.headers;
        const subject =
          headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h: any) => h.name === "From")?.value || "";
        const date = headers.find((h: any) => h.name === "Date")?.value || "";
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
      } catch (error) {
        console.error("Error fetching or processing message:", msg.id, error);
        return null; // Skip this email if there's an error
      }
    })
  );

  // Filter out any null values from failed fetches
  return emails.filter((email) => email !== null) as EmailMessage[];
}


export default async function MailPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();

  if (!session || !("accessToken" in session)) {
    redirect("/login");
  }

  const searchQuery = searchParams.q || "";
  const emails = await fetchEmails(session.accessToken, searchQuery);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Emails</h1>
      <form
        method="GET"
        action="/mail"
        className="mb-4 flex justify-start items-center"
      >
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search emails..."
          className="w-full p-2 border rounded-lg max-w-[600px]"
        />
        <Button type="submit" variant={"secondary"} className="p-2 rounded-lg ">
          <Search></Search>
        </Button>
      </form>
      <Tabs defaultValue="unread" className="w-full">
        <TabsList>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value="unread">
          <div className="space-y-4">
            {emails
              .filter((email) => email.isUnread)
              .map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="read">
          <div className="space-y-4">
            {emails
              .filter((email) => !email.isUnread)
              .map((email) => (
                <Card
                  key={email.id}
                  className="border p-4 rounded-lg bg-zinc-100"
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
}


