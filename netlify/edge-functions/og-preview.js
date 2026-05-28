/**
 * Netlify Edge Function: og-preview
 *
 * Intercepts requests to /blog/* from social media crawlers and
 * returns a lightweight HTML page with proper Open Graph meta tags,
 * fetched live from Supabase. Regular browsers pass through normally.
 */

const SUPABASE_URL = 'https://cebnksgmakamfutvdceh.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYm5rc2dtYWthbWZ1dHZkY2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTk3MjgsImV4cCI6MjA5MTk5NTcyOH0.7S6uVa6QPautnOoIYhsFb6yuwblLfUZHLeMZn6HIiyU';

// User-agent substrings that belong to social/link-preview crawlers
const BOT_PATTERNS = [
  'whatsapp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'slack-imgproxy',
  'telegrambot',
  'discordbot',
  'imessagebot',
  'iframely',
  'embedly',
  'pinterest',
  'vkshare',
  'w3c_validator',
  'googlebot',
  'bingbot',
  'yahoo! slurp',
  'duckduckbot',
  'applebot',
  'rogerbot',
  'showyoubot',
  'outbrain',
];

function isBot(userAgent) {
  const ua = (userAgent || '').toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Upgrade Unsplash URL to 1200px wide for og:image */
function ogImageUrl(url) {
  if (!url) return 'https://serviceconnectpro.ai/og-default.jpg';
  return url.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, '').replace(/q=\d+/, 'q=85');
}

export default async function handler(request, context) {
  const userAgent = request.headers.get('user-agent') || '';

  // Let real browsers through — the SPA handles them
  if (!isBot(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  // Strip leading /blog/ and any trailing slash
  const slug = url.pathname.replace(/^\/blog\//, '').replace(/\/+$/, '');

  if (!slug) {
    return context.next();
  }

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,featured_image&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!apiRes.ok) return context.next();

    const posts = await apiRes.json();
    const post = posts?.[0];

    if (!post) return context.next();

    const pageTitle = `${post.title} | Service Connect Pro`;
    const description =
      post.excerpt || 'Find verified home service professionals on Service Connect Pro.';
    const image = ogImageUrl(post.featured_image);
    const canonicalUrl = `https://serviceconnectpro.ai/blog/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph (WhatsApp, Facebook, iMessage, Slack, Discord, etc.) -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Service Connect Pro" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(post.title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
</head>
<body>
  <h1>${escapeHtml(post.title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(canonicalUrl)}">Read the full article</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (_err) {
    // On any error, fall back to the normal SPA
    return context.next();
  }
}
