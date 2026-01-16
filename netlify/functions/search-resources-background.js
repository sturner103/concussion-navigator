// search-resources-background.js
// Background function - can run up to 15 minutes
// The "-background" suffix tells Netlify this is a background function

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisSet(key, value, exSeconds = 600) {
  const response = await fetch(`${UPSTASH_URL}/set/${key}?EX=${exSeconds}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    body: JSON.stringify(value)
  });
  return response.json();
}

export const handler = async (event, context) => {
  console.log('Background function triggered');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { jobId, stage, stageName, stageHelps, location, preference, resourceTypes } = JSON.parse(event.body);
  console.log('Job ID:', jobId, 'Location:', location);

  try {
    // Update status to "searching" immediately
    console.log('Writing pending status to Redis...');
    await redisSet(jobId, {
      status: 'searching',
      createdAt: Date.now()
    });
    console.log('Redis write complete, starting search...');

    // Build preference text
    let preferenceText = "";
    if (preference === "local") {
      preferenceText = "Focus on IN-PERSON services only - clinics, therapists with physical offices, local specialists.";
    } else if (preference === "remote") {
      preferenceText = "Focus on REMOTE/TELEHEALTH services only - online consultations, virtual appointments, telehealth providers who serve this region.";
    } else {
      preferenceText = "Include BOTH in-person local services AND remote/telehealth options that serve this area.";
    }

    // Build the comprehensive search prompt
    const systemPrompt = `You are a compassionate concussion recovery navigator. Your job is to search for and compile REAL, SPECIFIC resources for someone recovering from a concussion.

CRITICAL INSTRUCTIONS:
1. Search for ACTUAL providers, clinics, and services in or serving the specified location
2. Look for specialists in concussion/mTBI care - not just general practitioners
3. Include a MIX of:
   - Concussion clinics and specialized centers
   - Sports medicine physicians with concussion expertise
   - Neurologists specializing in concussion/mTBI
   - Physiotherapists trained in concussion management
   - Vestibular therapists (for dizziness/balance)
   - Neuro-optometrists and vision therapists (for visual symptoms)
   - Neuropsychologists (for cognitive assessment)
   - Mental health professionals familiar with brain injury
4. For each resource, provide: name, type, description, website URL (if available), phone (if available)
5. Verify that resources actually exist and serve the specified location
6. Group resources into logical categories

IMPORTANT - NAMED INDIVIDUALS:
- Prioritize finding NAMED individual practitioners (e.g., "Dr. Sarah Smith, Sports Medicine" not "various providers")
- Search directories, clinic websites, and professional registries to find SPECIFIC people by name
- Include their credentials, specialties, and any distinguishing details
- AVOID generic entries - instead, name specific individuals you find
- Individual practitioners appreciate being discoverable - help connect them with people who need their services

${preferenceText}

The person is at "${stageName}" stage. Resources that typically help at this stage include:
${stageHelps.map(h => `- ${h}`).join('\n')}

IMPORTANT: Search thoroughly. Take your time to find quality, relevant resources. This information could meaningfully help someone's concussion recovery.`;

    const userPrompt = `Please search for concussion recovery resources in or serving: ${location}

Find real, specific resources including:
1. Concussion clinics or specialized concussion programs
2. NAMED sports medicine doctors or physicians with concussion expertise
3. NAMED physiotherapists trained in concussion management
4. Vestibular rehabilitation therapists (for dizziness/balance issues)
5. Neuro-optometrists or vision therapy providers
6. Neuropsychologists for cognitive assessment
7. Mental health professionals familiar with brain injury
8. Any multidisciplinary concussion programs

For practitioners, I want SPECIFIC NAMES like "Dr. Jane Doe, Sports Medicine" - not generic references to directories.

Return your findings as JSON in this exact format:
{
  "introduction": "Brief supportive intro about what you found for this location",
  "categories": [
    {
      "name": "Category Name",
      "resources": [
        {
          "name": "Resource Name",
          "type": "Concussion Clinic|Physician|Physiotherapist|Vestibular Therapist|Vision Specialist|Neuropsychologist|Mental Health|Program",
          "description": "What they offer, specialties, approach",
          "url": "https://...",
          "phone": "phone number if available",
          "notes": "Telehealth offered, specialized in sport concussion, etc."
        }
      ]
    }
  ],
  "additionalNotes": "Any helpful context about concussion care in this region"
}

Search thoroughly and return ONLY the JSON, no other text.`;

    // Make the API call with web search
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
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

    // Parse the JSON response
    let results;
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      results = {
        introduction: "We found some resources for you, though we had trouble formatting them perfectly.",
        categories: [{
          name: "Search Results",
          resources: [{
            name: "Raw Results",
            type: "Information",
            description: textContent.substring(0, 1000),
            url: null,
            phone: null
          }]
        }],
        additionalNotes: "Please try searching again for better formatted results."
      };
    }

    // Store successful results in Redis
    console.log('Search complete, storing results...');
    await redisSet(jobId, {
      status: 'complete',
      completedAt: Date.now(),
      results: results
    });
    console.log('Results stored successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'complete' })
    };

  } catch (error) {
    console.error('Background search error:', error);
    
    // Store error status in Redis
    await redisSet(jobId, {
      status: 'error',
      error: error.message || 'Search failed',
      completedAt: Date.now()
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
