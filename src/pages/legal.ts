import { shell } from '../components/shell'
import { STORE_CONFIG, LEGAL_PAGES, type LegalPage } from '../data'

export function legalPage(page: LegalPage, env?: { razorpayKeyId?: string; googleClientId?: string }): string {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title + " — intru.in",
    "description": page.title + " for intru.in — Premium Indian Streetwear",
    "url": "https://intru.in/p/" + page.slug,
    "dateModified": page.updatedAt
  });

  const body = `<style>
.lg{max-width:740px;margin:0 auto;padding:64px 24px 100px}
.lgbc{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--g400);margin-bottom:36px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}
.lgbc a:hover{color:var(--bk)}
.lgh{font-family:var(--head);font-size:clamp(28px,4vw,44px);text-transform:uppercase;letter-spacing:-.03em;margin-bottom:8px}
.lgup{font-size:11px;color:var(--g400);font-weight:500;margin-bottom:40px;letter-spacing:.5px}
.lgbdy{font-size:14px;line-height:1.85;color:var(--g500)}
.lgbdy h2{font-family:var(--head);font-size:18px;text-transform:uppercase;letter-spacing:-.02em;margin:36px 0 12px;color:var(--bk)}
.lgbdy p{margin-bottom:14px}
.lgbdy ul{margin:10px 0 14px 20px}
.lgbdy ul li{margin-bottom:4px}
.lgbdy a{color:var(--bk);font-weight:600;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}
.lgbdy strong{color:var(--bk);font-weight:700}
.lgbdy em{font-style:italic}
.lgnav{display:flex;flex-wrap:wrap;gap:10px;margin-top:48px;padding-top:28px;border-top:1px solid var(--g100)}
.lgnav a{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:var(--g50);border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--g500);transition:all .2s}
.lgnav a:hover{background:var(--bk);color:var(--wh)}
.lgnav a.cur{background:var(--bk);color:var(--wh)}
</style>

<div class="lg">
<nav class="lgbc"><a href="/">Home</a><span>/</span><span style="color:var(--bk)">${page.title}</span></nav>
<h1 class="lgh">${page.title}</h1>
<p class="lgup">Last updated: ${new Date(page.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
<div class="lgbdy">${page.content}</div>
<div class="lgnav">
${LEGAL_PAGES.map(p => '<a href="/p/' + p.slug + '"' + (p.slug === page.slug ? ' class="cur"' : '') + '>' + p.title + '</a>').join('')}
</div>
</div>`;

  return shell(
    page.title + ' — INTRU.IN',
    page.title + ' for intru.in — India\'s premium minimalist streetwear brand. Limited drops, no restocks.',
    body,
    { url: 'https://intru.in/p/' + page.slug, schema, razorpayKeyId: env?.razorpayKeyId, googleClientId: env?.googleClientId }
  );
}
