'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateReply(formData: FormData) {
  const emailBody = formData.get('emailBody') as string;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Generate a reply for the following email, keep it concise and professional:

${emailBody}

Summary:`,
      maxTokens: 150
    });

    return text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary.';
  }
}