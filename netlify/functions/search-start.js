// search-start.js
// Starts the background search and returns immediately with a job ID

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { jobId, stage, stageName, stageHelps, location, preference } = JSON.parse(event.body);

    if (!jobId || !location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Store job as "pending" in Redis (expires in 10 minutes)
    await redisSet(jobId, {
      status: 'pending',
      createdAt: Date.now(),
      params: { stage, stageName, stageHelps, location, preference }
    });

    // Trigger the background function (fire and forget)
    const backgroundUrl = `${process.env.URL}/.netlify/functions/search-resources-background`;
    
    fetch(backgroundUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, stage, stageName, stageHelps, location, preference })
    }).catch(err => console.log('Background trigger sent'));

    return {
      statusCode: 202,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jobId, 
        status: 'pending',
        message: 'Search started' 
      })
    };

  } catch (error) {
    console.error('Error starting search:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to start search' })
    };
  }
};
