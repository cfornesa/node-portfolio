import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { homeRouter } from './apps/home/routes';
import { resumeRouter } from './apps/resume/routes';
import { artRouter } from './apps/art/routes';
import { tanagaRouter } from './apps/tanaga/routes';
import { homeRag } from './apps/home/home';
import { resumeRag } from './apps/resume/resume';
import { artRag } from './apps/art/art';
import { tanagaRag } from './apps/tanaga/tanaga';

const publicDir = path.join(process.cwd(), 'public');

export async function createApp() {
  const app = express();
  const appUrl = process.env.APP_URL?.trim();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: appUrl
        ? [appUrl, 'http://localhost:5000', 'http://127.0.0.1:5000']
        : true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Sub-app static files served at their path prefix ──────────────
  app.use('/resume', express.static(path.join(publicDir, 'resume')));
  app.use('/art', express.static(path.join(publicDir, 'art')));
  app.use('/tanaga', express.static(path.join(publicDir, 'tanaga')));
  // Home page and shared assets
  app.use(express.static(publicDir));

  // ── Health ────────────────────────���────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      apps: ['home', 'resume', 'art', 'tanaga'],
    });
  });

  // ── API Routes ────────────────────────��────────────────────────────
  app.use('/', homeRouter);          // POST /chat, GET /rag/status, POST /rag/reindex
  app.use('/resume', resumeRouter);  // POST /resume/build, /resume/chat, /resume/rag/*
  app.use('/art', artRouter);        // POST /art/chat, /art/rag/*
  app.use('/tanaga', tanagaRouter);  // POST /tanaga/generate, /tanaga/rag/*

  // ── SPA fallback: serve each sub-app's index.html ─────────────────
  app.get('/resume', (_req, res) =>
    res.sendFile(path.join(publicDir, 'resume', 'index.html')),
  );
  app.get('/art', (_req, res) =>
    res.sendFile(path.join(publicDir, 'art', 'index.html')),
  );
  app.get('/tanaga', (_req, res) =>
    res.sendFile(path.join(publicDir, 'tanaga', 'index.html')),
  );
  app.get('/chat', (_req, res) =>
    res.sendFile(path.join(publicDir, 'home', 'index.html')),
  );
  app.get('/', (_req, res) =>
    res.sendFile(path.join(publicDir, 'index.html')),
  );

  // ── Warmup all RAG indexes in parallel (non-blocking) ─────────────
  const warmup = async () => {
    await Promise.all([
      homeRag.warmup(),
      resumeRag.warmup(),
      artRag.warmup(),
      tanagaRag.warmup(),
    ]);
  };

  return { app, warmup };
}
