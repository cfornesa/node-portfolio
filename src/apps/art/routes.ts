import { Router } from 'express';
import { z } from 'zod';
import { handleArtChat, artRag } from './art';

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .default([]),
  preferences: z
    .object({
      style: z.string().nullable().optional(),
      medium: z.string().nullable().optional(),
      skill_level: z.string().nullable().optional(),
      focus: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const artRouter = Router();

artRouter.post('/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ reply: 'Error: Invalid request payload.' });
  }

  try {
    const { message, history, preferences } = parsed.data;
    const result = await handleArtChat(message, history, preferences);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown system error.';
    return res.status(500).json({ reply: `System Error: ${message}` });
  }
});

artRouter.post('/rag/reindex', async (_req, res) => {
  try {
    const result = await artRag.rebuild();
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

artRouter.get('/rag/status', async (_req, res) => {
  try {
    const status = await artRag.status();
    res.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});
