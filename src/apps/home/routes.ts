import { Router } from 'express';
import { z } from 'zod';
import { handleHomeChat, homeRag } from './home';

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .default([]),
});

export const homeRouter = Router();

homeRouter.post('/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ reply: 'Error: Invalid request payload.' });
  }

  try {
    const { message, history } = parsed.data;
    const result = await handleHomeChat(message, history);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown system error.';
    return res.status(500).json({ reply: `System Error: ${message}` });
  }
});

homeRouter.post('/rag/reindex', async (_req, res) => {
  try {
    const result = await homeRag.rebuild();
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

homeRouter.get('/rag/status', async (_req, res) => {
  try {
    const status = await homeRag.status();
    res.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});
