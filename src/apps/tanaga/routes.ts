import { Router } from 'express';
import { z } from 'zod';
import { generatePoem, tanagaRag } from './tanaga';

const requestSchema = z.object({
  user_input: z.string().min(1),
  language: z.enum(['Tagalog', 'English']).default('Tagalog'),
});

export const tanagaRouter = Router();

tanagaRouter.post('/generate', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      reply: 'Error: Invalid request payload',
      details: parsed.error.flatten(),
    });
  }

  try {
    const context = await tanagaRag.getContext(parsed.data.user_input);
    const response = await generatePoem(
      parsed.data.user_input,
      parsed.data.language,
      context,
    );
    return res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ reply: `System Error: ${message}` });
  }
});

tanagaRouter.post('/rag/rebuild', async (_req, res) => {
  try {
    const result = await tanagaRag.rebuild();
    res.json({
      ok: true,
      indexed: result.chunkCount,
      documents: result.documentCount,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});

tanagaRouter.get('/rag/status', async (_req, res) => {
  try {
    const status = await tanagaRag.status();
    res.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});
