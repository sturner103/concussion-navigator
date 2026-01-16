// site-help.js
// Handles site-wide floating helper questions

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userMessage } = JSON.parse(event.body);

    const systemPrompt = `You are a helpful assistant for Support Navigator, a free tool that helps people understand their relationship with food and find eating disorder support resources.

Key things you can help with:
- Explaining how the assessment works (12 questions, takes 5 minutes)
- Explaining the 4 stages (0-3) of support needs
- Answering questions about privacy (nothing stored, no accounts)
- Helping people understand what resources we can find
- Answering general questions about eating disorder support

IMPORTANT: 
- Yes! We can search for eating disorder support services anywhere in the world
- The assessment is free and completely private
- We don't diagnose - we help navigate to appropriate resources
- If someone seems in crisis, gently point them to crisis resources

Keep responses concise (2-3 sentences max) and warm.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    });

    const reply = response.content[0].text;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('Site help error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response' })
    };
  }
};
