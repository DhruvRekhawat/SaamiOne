// app/actions.ts
'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateSummary(formData: FormData) {
  const emailBody = formData.get('emailBody') as string;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Summarize the following email body concisely. Capture the main points, key information, and overall purpose of the email:

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