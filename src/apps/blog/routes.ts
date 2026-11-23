import { Router } from 'express';

export const BLOG_FEED_URL =
  process.env.BLOG_FEED_URL?.trim() ||
  'https://blog.cfornesa.com/feeds/posts/default?alt=rss';

const CACHE_TTL_MS = 15 * 60 * 1000;
type BlogPost = { title: string; date: string; excerpt: string; url: string };
let cachedPosts: BlogPost[] | undefined;
let cacheExpiresAt = 0;
let pendingFetch: Promise<BlogPost[]> | undefined;

function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const numeric = code[1]?.toLowerCase() === 'x'
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' } as Record<string, string>)[code.toLowerCase()] ?? entity;
  });
}

function field(item: string, name: string): string {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  if (!match) return '';
  const raw = match[1].trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1');
  return decodeEntities(raw);
}

function plainText(value: string): string {
  return decodeEntities(
    value
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6])\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

function parseFeed(xml: string): BlogPost[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map(([, item]) => {
      const title = plainText(field(item, 'title'));
      const dateValue = field(item, 'pubDate');
      const timestamp = Date.parse(dateValue);
      const url = field(item, 'link').trim();
      if (!title || !Number.isFinite(timestamp) || !/^https?:\/\//i.test(url)) return null;
      return {
        title,
        date: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(timestamp),
        timestamp,
        excerpt: plainText(field(item, 'description')).slice(0, 200),
        url,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map(({ timestamp: _timestamp, ...post }) => post);
}

async function loadPosts(): Promise<BlogPost[]> {
  if (cachedPosts && Date.now() < cacheExpiresAt) return cachedPosts;
  if (!pendingFetch) {
    pendingFetch = (async () => {
      const response = await fetch(BLOG_FEED_URL, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`Feed returned ${response.status}`);
      const posts = parseFeed(await response.text());
      cachedPosts = posts;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return posts;
    })().finally(() => { pendingFetch = undefined; });
  }
  try {
    return await pendingFetch;
  } catch {
    return [];
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function renderPage(posts: BlogPost[]): string {
  const content = posts.length
    ? posts.map((post) => `<article class="blog-card"><h2><a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a></h2><p class="blog-date">${escapeHtml(post.date)}</p><p>${escapeHtml(post.excerpt)}</p><p class="blog-source">From the Working Log blog</p><a class="blog-read" href="${escapeHtml(post.url)}">Read on the blog</a></article>`).join('\n')
    : '<p class="blog-empty">The first entry lands soon. <a href="https://blog.cfornesa.com">Visit the Working Log blog</a>.</p>';

  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Working Log</title><link rel="stylesheet" href="/assets/styles.css"><style>
.blog-main{max-width:900px;margin:0 auto;padding:112px 24px 72px}.blog-heading{margin-bottom:36px}.blog-heading h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;letter-spacing:-.05em;margin:0 0 12px}.blog-list{display:grid;gap:20px}.blog-card{padding:26px;border:1px solid rgba(128,128,128,.25);border-radius:16px;background:var(--color-surface-container,rgba(128,128,128,.06))}.blog-card h2{font-size:1.45rem;font-weight:800;margin:0 0 8px}.blog-card h2 a{color:inherit;text-decoration:none}.blog-card h2 a:hover,.blog-read:hover{color:var(--color-primary,#64748b)}.blog-date,.blog-source{font-size:.78rem;color:var(--color-on-surface-variant,#777)}.blog-date{margin:0 0 14px}.blog-card>p:not(.blog-date):not(.blog-source){line-height:1.7}.blog-source{margin:18px 0 8px}.blog-read{font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.blog-empty{padding:28px;border:1px solid rgba(128,128,128,.25);border-radius:16px}.blog-nav{position:fixed;z-index:50;top:0;width:100%;padding:18px 24px;background:rgba(128,128,128,.08);backdrop-filter:blur(16px);border-bottom:1px solid rgba(128,128,128,.18)}.blog-nav-inner{max-width:1200px;margin:auto;display:flex;justify-content:space-between;gap:20px;align-items:center}.blog-brand{font-weight:900;letter-spacing:-.04em;color:var(--color-primary,#64748b)}.blog-links{display:flex;gap:24px;flex-wrap:wrap}.blog-links a{color:inherit;text-decoration:none;font-weight:600}.blog-footer{text-align:center;padding:24px;color:var(--color-on-surface-variant,#777);font-size:.85rem}
</style></head><body><nav class="blog-nav"><div class="blog-nav-inner"><a class="blog-brand" href="/">CHRIS FORNESA</a><div class="blog-links"><a href="/">Home</a><a href="/about">About</a><a href="/portfolio">Portfolio</a><a href="/readme">Readme</a><a href="/blog">Working Log</a></div></div></nav><main class="blog-main"><header class="blog-heading"><h1>Working Log</h1></header><section class="blog-list">${content}</section></main><footer class="blog-footer">&copy; 2026 Chris Fornesa. A <a href="https://creatrweb.com" target="_blank" rel="noopener">Creatrweb Site</a>.</footer></body></html>`;
}

export const blogRouter = Router();
blogRouter.get('/', async (_req, res) => {
  res.type('html').status(200).send(renderPage(await loadPosts()));
});
