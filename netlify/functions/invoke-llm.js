import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, response_json_schema } = JSON.parse(event.body);

    let system = 'You are a helpful AI assistant for a service marketplace platform.';
    if (response_json_schema) {
      system +=
        ' Respond ONLY with a valid JSON object matching this schema (no markdown, no extra text): ' +
        JSON.stringify(response_json_schema);
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();

    if (response_json_schema) {
      // Extract JSON block from response
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(text),
    };
  } catch (err) {
    console.error('invoke-llm error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
