const MISTRAL_EMBED_URL = 'https://api.mistral.ai/v1/embeddings';
const MISTRAL_EMBED_MODEL = 'mistral-embed';

/**
 * Embed text using the Mistral Embeddings API (mistral-embed, 1024 dimensions).
 * Requires MISTRAL_API_KEY in the environment.
 */
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not set.');
  }

  const response = await fetch(MISTRAL_EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MISTRAL_EMBED_MODEL,
      input: [text],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mistral embeddings API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    data: { embedding: number[]; index: number }[];
  };

  return data.data[0].embedding;
}
