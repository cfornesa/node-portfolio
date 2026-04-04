import { Router } from 'express';
import { buildResume, editResume, resumeRag } from './resume';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export const resumeRouter = Router();

resumeRouter.post('/build', async (req, res) => {
  const body = req.body ?? {};
  const requiredFields = [
    'name', 'occupation', 'industry', 'job_description',
    'summary', 'skills', 'experience', 'education', 'awards',
  ];

  for (const field of requiredFields) {
    if (!isNonEmptyString(body[field])) {
      return res.status(400).json({ error: 'Missing one or more required resume fields.' });
    }
  }

  const startTime = Date.now();
  try {
    const result = await buildResume({
      name: body.name.trim(),
      occupation: body.occupation.trim(),
      industry: body.industry.trim(),
      jobDescription: body.job_description.trim(),
      summary: body.summary.trim(),
      skills: body.skills.trim(),
      experience: body.experience.trim(),
      education: body.education.trim(),
      awards: body.awards.trim(),
    });
    res.json({ ...result, duration: (Date.now() - startTime) / 1000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

resumeRouter.post('/chat', async (req, res) => {
  const body = req.body ?? {};
  const currentResume = body.resume;
  const userMessage = body.message;
  const history = Array.isArray(body.history) ? body.history : [];

  if (!isNonEmptyString(currentResume) || !isNonEmptyString(userMessage)) {
    return res.status(400).json({ error: 'Missing resume or message.' });
  }

  const startTime = Date.now();
  try {
    const result = await editResume(currentResume.trim(), userMessage.trim(), history);
    res.json({ ...result, duration: (Date.now() - startTime) / 1000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

resumeRouter.post('/rag/reindex', async (_req, res) => {
  try {
    const result = await resumeRag.rebuild();
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

resumeRouter.get('/rag/status', async (_req, res) => {
  try {
    const status = await resumeRag.status();
    res.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});
