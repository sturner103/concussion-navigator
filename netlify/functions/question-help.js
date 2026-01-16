// question-help.js
// Handles help requests for specific assessment questions

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { question, questionText, userMessage } = JSON.parse(event.body);

    const systemPrompt = `You are a supportive assistant helping someone understand an assessment question about eating patterns and body image. The user is on Question ${question}: "${questionText}"

Your role:
- Help clarify what the question is asking
- Give examples of what each answer option might look like in daily life
- Be warm, non-judgmental, and supportive
- Do NOT tell them what to answer
- Do NOT diagnose or label their experiences
- Keep responses concise (2-3 sentences)

If they seem distressed, acknowledge their feelings gently and remind them they can take a break or exit anytime.`;

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
    console.error('Question help error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response' })
    };
  }
};
