// resource-detail.js
// Fetches additional details about a specific resource

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { url, resourceName, resourceType, stageName, location } = JSON.parse(event.body);

  try {
    const systemPrompt = `You are a helpful assistant providing information about concussion recovery resources. Be concise, accurate, and supportive. Focus on practical information that would help someone deciding whether this resource is right for them.`;

    let userPrompt;
    if (url) {
      userPrompt = `Please search for more information about "${resourceName}" (${resourceType}) located in or serving ${location}. 

Look for:
- What specific concussion services they offer
- Their approach to concussion management
- Any specializations (sport concussion, pediatric, vestibular, etc.)
- Wait times or accessibility information if available
- Patient reviews or reputation
- Whether they accept referrals or self-referrals

If you can access their website (${url}), summarize the most relevant information for someone recovering from a concussion.

Provide a brief, helpful summary (3-4 paragraphs max). Use **bold** for section headers if needed. Be direct and practical.`;
    } else {
      userPrompt = `Please search for more information about "${resourceName}" (${resourceType}) that serves people in ${location}.

Look for:
- What specific concussion services they offer
- Their approach to concussion management
- Contact information or how to access their services
- Any reviews or reputation information

Provide a brief, helpful summary (2-3 paragraphs max). Be direct and practical.`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: userPrompt }]
    });

    // Extract text response
    let textContent = "";
    for (const block of response.content) {
      if (block.type === "text") {
        textContent += block.text;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: textContent })
    };

  } catch (error) {
    console.error('Resource detail error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not fetch additional details' })
    };
  }
};
