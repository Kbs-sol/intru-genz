import { shell } from '../components/shell'
import { STORE_CONFIG, SEED_BLOG_POSTS, type Product, type LegalPage, type BlogPost } from '../data'

// Re-export BlogPost + a legacy BLOG_POSTS alias so any older imports keep working.
// New callers should pass fetched posts via opts.posts (fetched from Supabase in
// index.tsx). The public site falls back to SEED_BLOG_POSTS when Supabase is
// unconfigured or the table is empty — so crawlers/users always see content.
export type { BlogPost } from '../data'
export const BLOG_POSTS = SEED_BLOG_POSTS;

/**
 * /blog and /blog/:slug — organic content hub.
 *
 * Purpose: publish long-form articles that target long-tail queries
 * ("how to style oversized t-shirt men india", "heavyweight cotton vs lightweight",
 * "streetwear brands india under 1500", "crop top styling guide") — the exact
 * intent shape GSC shows Intru already gets impressions for at position 3–5
 * but zero clicks. Each post is a full article with schema, internal links to
 * products, and CTAs into /collections.
 *
 * Design: catalog page (blog index) + article page (single post). Everything
 * is derived from BLOG_POSTS below — add a new entry to publish.
 *
 * NOTE: /style-guide already exists as a standalone article; the blog also
 * links to it as the flagship style-guide post so we don't fragment SEO.
 */


// -----------------------------------------------------------------------------
// Blog index page
// -----------------------------------------------------------------------------
export function blogIndexPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  posts?: BlogPost[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const today = new Date().toISOString().split('T')[0];

  // Prefer Supabase-fetched posts; fall back to SEED_BLOG_POSTS so users and
  // crawlers always see the same 5 flagship articles even if the DB is empty.
  const posts: BlogPost[] = (opts.posts && opts.posts.length ? opts.posts : SEED_BLOG_POSTS)
    .filter(p => p.isPublished !== false);

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://intru.in/blog#blog',
    'name': 'Intru Journal — Streetwear Style, Fabric & Culture',
    'description': 'Long-form guides on oversized streetwear, heavyweight cotton, styling and the limited-drop model. Written by the Intru team.',
    'url': 'https://intru.in/blog',
    'inLanguage': 'en-IN',
    'publisher': { '@type': 'Organization', 'name': 'Intru', 'url': 'https://intru.in' },
    'dateModified': today,
    'blogPost': posts.map(p => ({
      '@type': 'BlogPosting',
      'headline': p.title,
      'url': 'https://intru.in/blog/' + p.slug,
      'datePublished': p.publishedISO,
      'dateModified': p.updatedISO,
      'author': { '@type': 'Organization', 'name': p.author },
      'image': p.cover,
      'keywords': p.keywords
    }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://intru.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://intru.in/blog' }
    ]
  };
  const schema = JSON.stringify([listSchema, breadcrumbSchema]);

  const cats = [...new Set(posts.map(p => p.category))];

  const body = `
<style>
.bl-hero{padding:80px 24px 40px;text-align:center;max-width:860px;margin:0 auto}
.bl-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g500);margin-bottom:12px}
.bl-h1{font-family:var(--head);font-size:clamp(32px,5vw,52px);text-transform:uppercase;letter-spacing:-.04em;margin-bottom:16px;line-height:1.05}
.bl-sub{font-size:15px;color:var(--g500);max-width:580px;margin:0 auto 20px;line-height:1.7}
.bl-wrap{max-width:1200px;margin:0 auto;padding:0 24px 100px}
.bl-filters{display:flex;justify-content:center;gap:8px;margin:24px 0 48px;flex-wrap:wrap}
.bl-fb{padding:9px 18px;border:1.5px solid var(--g200);background:none;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g600);cursor:pointer;transition:all .2s;font-family:inherit}
.bl-fb:hover,.bl-fb:focus-visible{border-color:var(--bk);color:var(--bk);outline:none}
.bl-fb.act{background:var(--bk);color:var(--wh);border-color:var(--bk)}
.bl-fb:focus-visible{outline:2px solid var(--bk);outline-offset:2px}
.bl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:32px}
.bl-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .3s var(--eo)}
.bl-card:hover{transform:translateY(-4px)}
.bl-card.hidden{display:none}
.bl-cimg{position:relative;aspect-ratio:16/10;overflow:hidden;border-radius:10px;background:var(--g50);margin-bottom:16px}
.bl-cimg img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.bl-card:hover .bl-cimg img{transform:scale(1.05)}
.bl-cbadge{position:absolute;top:12px;left:12px;background:rgba(10,10,10,.9);backdrop-filter:blur(8px);color:#fff;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 12px;border-radius:4px}
.bl-cmeta{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--g500);margin-bottom:8px}
.bl-ctitle{font-family:var(--head);font-size:22px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px;line-height:1.2}
.bl-cex{font-size:14px;color:var(--g600);line-height:1.65;margin-bottom:12px}
.bl-crm{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--bk);display:inline-flex;align-items:center;gap:6px;margin-top:auto}
.bl-crm i{transition:transform .2s}
.bl-card:hover .bl-crm i{transform:translateX(4px)}
@media(max-width:640px){.bl-hero{padding:56px 16px 24px}.bl-wrap{padding:0 16px 80px}.bl-grid{gap:24px}.bl-ctitle{font-size:19px}}
</style>

<section class="bl-hero">
<p class="bl-over">Intru Journal</p>
<h1 class="bl-h1">Style, Fabric<br>&amp; Culture</h1>
<p class="bl-sub">Long reads on oversized streetwear, heavyweight cotton, styling and the limited-drop model. Written by the Intru team.</p>
</section>

<section class="bl-wrap">
<div class="bl-filters" role="tablist" aria-label="Filter by category">
<button class="bl-fb act" data-cat="all" onclick="filterBlog('all',this)">All</button>
${cats.map(c => `<button class="bl-fb" data-cat="${c}" onclick="filterBlog('${c}',this)">${c}</button>`).join('')}
</div>

<div class="bl-grid" id="blGrid">
${posts.length ? posts.map(p => `<a href="/blog/${p.slug}" class="bl-card" data-cat="${p.category}">
<div class="bl-cimg">
<img src="${p.cover}" alt="${p.title}" loading="lazy" width="600" height="375">
<span class="bl-cbadge">${p.category}</span>
</div>
<div class="bl-cmeta">${new Date(p.publishedISO).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'})} · ${p.readMins} min read</div>
<h2 class="bl-ctitle">${p.title}</h2>
<p class="bl-cex">${p.excerpt}</p>
<span class="bl-crm">Read Article <i class="fas fa-arrow-right"></i></span>
</a>`).join('') : '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--g500)">No articles yet — check back soon.</p>'}
</div>
</section>

<script>
function filterBlog(cat, btn) {
  document.querySelectorAll('.bl-fb').forEach(function(b){b.classList.remove('act')});
  if (btn) btn.classList.add('act');
  document.querySelectorAll('.bl-card').forEach(function(c){
    if (cat === 'all' || c.dataset.cat === cat) c.classList.remove('hidden');
    else c.classList.add('hidden');
  });
}
</script>`;

  return shell(
    'Intru Journal — Streetwear Style, Fabric & Culture | Blog',
    'Long-form guides on oversized streetwear, heavyweight cotton, styling tips, and the limited-drop model. Written by the Intru team.',
    body,
    {
      url: 'https://intru.in/blog',
      schema,
      razorpayKeyId: opts.razorpayKeyId,
      googleClientId: opts.googleClientId,
      products: opts.products,
      legalPages: opts.legalPages,
      useMagicCheckout: !!opts.useMagicCheckout,
      maintenanceConfig: opts.maintenanceConfig,
      storeSettings: opts.storeSettings,
      pageType: 'website'
    }
  );
}

// -----------------------------------------------------------------------------
// Single blog post page
// -----------------------------------------------------------------------------
export function blogPostPage(post: BlogPost, opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  posts?: BlogPost[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const url = 'https://intru.in/blog/' + post.slug;

  // Related posts pool: prefer live posts from Supabase (opts.posts). Fall back
  // to SEED_BLOG_POSTS so we still show related content even if the DB is empty.
  const pool: BlogPost[] = (opts.posts && opts.posts.length ? opts.posts : SEED_BLOG_POSTS)
    .filter(p => p.isPublished !== false);
  const related = pool.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fallback = pool.filter(p => p.slug !== post.slug && p.category !== post.category).slice(0, 3 - related.length);
  const relatedPosts = [...related, ...fallback].slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url + '#article',
    'headline': post.title,
    'name': post.title,
    'description': post.seoDesc,
    'url': url,
    'inLanguage': 'en-IN',
    'author': { '@type': 'Organization', 'name': post.author, 'url': 'https://intru.in' },
    'publisher': {
      '@type': 'Organization',
      'name': 'Intru',
      'url': 'https://intru.in',
      'logo': { '@type': 'ImageObject', 'url': 'https://intru.in/favicon.png' }
    },
    'datePublished': post.publishedISO,
    'dateModified': post.updatedISO,
    'image': [post.cover],
    'keywords': post.keywords,
    'articleSection': post.category,
    'wordCount': post.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': url }
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://intru.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://intru.in/blog' },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': url }
    ]
  };
  const schema = JSON.stringify([articleSchema, breadcrumbSchema]);

  const body = `
<style>
.bp-wrap{max-width:780px;margin:0 auto;padding:60px 24px 100px}
.bp-crumb{font-size:11px;color:var(--g500);margin-bottom:24px;letter-spacing:.5px}
.bp-crumb a{color:var(--g500);text-decoration:none}
.bp-crumb a:hover{color:var(--bk);text-decoration:underline}
.bp-cat{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--bk);margin-bottom:12px;display:inline-block;padding:6px 12px;border:1.5px solid var(--bk);border-radius:20px}
.bp-h1{font-family:var(--head);font-size:clamp(28px,4.5vw,44px);text-transform:uppercase;letter-spacing:-.03em;line-height:1.1;margin-bottom:20px}
.bp-meta{display:flex;gap:16px;font-size:12px;color:var(--g500);margin-bottom:36px;font-weight:500;flex-wrap:wrap}
.bp-meta span{display:inline-flex;align-items:center;gap:6px}
.bp-cover{aspect-ratio:16/9;overflow:hidden;border-radius:12px;margin-bottom:40px;background:var(--g50)}
.bp-cover img{width:100%;height:100%;object-fit:cover}
.bp-body{font-size:17px;line-height:1.85;color:#1a1a1a}
.bp-body h2{font-family:var(--head);font-size:clamp(22px,3vw,30px);text-transform:uppercase;letter-spacing:-.02em;margin:48px 0 16px;padding-top:8px}
.bp-body h3{font-size:18px;font-weight:800;margin:32px 0 10px;color:var(--bk)}
.bp-body p{margin-bottom:18px;color:#333}
.bp-body ul,.bp-body ol{margin:16px 0 24px;padding-left:24px}
.bp-body li{margin-bottom:8px;color:#333;line-height:1.75}
.bp-body a{color:var(--bk);font-weight:600;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1.5px}
.bp-body a:hover{background:#fef3c7}
.bp-body strong{color:var(--bk);font-weight:700}
.bp-body table{width:100%;border-collapse:collapse;margin:20px 0;font-size:14px}
.bp-body th,.bp-body td{padding:10px;text-align:left}
.bp-body blockquote{border-left:3px solid var(--bk);padding:16px 24px;margin:24px 0;background:var(--g50);font-style:italic;font-size:16px}

.bp-share{margin:56px 0 40px;padding:24px 0;border-top:1px solid var(--g100);border-bottom:1px solid var(--g100);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.bp-share-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--g500)}
.bp-share-btns{display:flex;gap:10px}
.bp-share-btns a{width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--g50);color:var(--bk);font-size:16px;transition:all .2s;text-decoration:none;border:1px solid var(--g100)}
.bp-share-btns a:hover{background:var(--bk);color:var(--wh)}

.bp-cta{margin:48px 0;padding:36px 32px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);color:#fff;border-radius:12px;text-align:center}
.bp-cta h3{font-family:var(--head);font-size:24px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px;color:#fff}
.bp-cta p{font-size:14px;color:#d4d4d4;margin-bottom:20px}
.bp-cta a{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:#fff;color:#0a0a0a;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:6px;text-decoration:none;transition:transform .2s}
.bp-cta a:hover{transform:translateY(-2px)}

.bp-related{margin-top:64px}
.bp-related h3{font-family:var(--head);font-size:20px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid var(--bk)}
.bp-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
.bp-related-card{text-decoration:none;color:inherit;transition:transform .3s}
.bp-related-card:hover{transform:translateY(-3px)}
.bp-related-card img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:8px;margin-bottom:10px}
.bp-related-card h4{font-size:14px;font-weight:700;line-height:1.35;color:var(--bk);margin-bottom:4px}
.bp-related-card p{font-size:11px;color:var(--g500);text-transform:uppercase;letter-spacing:1.5px;font-weight:700}

@media(max-width:640px){.bp-wrap{padding:40px 16px 80px}.bp-body{font-size:16px}}
</style>

<article class="bp-wrap" itemscope itemtype="https://schema.org/BlogPosting">
<nav class="bp-crumb" aria-label="Breadcrumb">
<a href="/">Home</a> / <a href="/blog">Blog</a> / <span>${post.title}</span>
</nav>
<span class="bp-cat" itemprop="articleSection">${post.category}</span>
<h1 class="bp-h1" itemprop="headline">${post.title}</h1>
<div class="bp-meta">
  <span><i class="fas fa-user"></i> <span itemprop="author">${post.author}</span></span>
  <span><i class="fas fa-calendar"></i> <time itemprop="datePublished" datetime="${post.publishedISO}">${new Date(post.publishedISO).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}</time></span>
  <span><i class="fas fa-clock"></i> ${post.readMins} min read</span>
</div>
<div class="bp-cover">
<img src="${post.cover}" alt="${post.title}" itemprop="image" width="1200" height="675" loading="eager">
</div>
<div class="bp-body" itemprop="articleBody">
${post.body}
</div>

<div class="bp-share" role="group" aria-label="Share this article">
<span class="bp-share-label">Share this article</span>
<div class="bp-share-btns">
<a href="https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + url)}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
<a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer" aria-label="Share on X"><i class="fab fa-x-twitter"></i></a>
<a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram"><i class="fab fa-instagram"></i></a>
<a href="mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}" aria-label="Share via email"><i class="fas fa-envelope"></i></a>
</div>
</div>

<div class="bp-cta">
<h3>Shop the Current Drop</h3>
<p>Limited-run oversized streetwear, made in India. Never restocked.</p>
<a href="/collections">Shop Now <i class="fas fa-arrow-right"></i></a>
</div>

${relatedPosts.length ? `<section class="bp-related">
<h3>Continue Reading</h3>
<div class="bp-related-grid">
${relatedPosts.map(rp => `<a href="/blog/${rp.slug}" class="bp-related-card">
<img src="${rp.cover}" alt="${rp.title}" loading="lazy" width="220" height="138">
<p>${rp.category} · ${rp.readMins} min</p>
<h4>${rp.title}</h4>
</a>`).join('')}
</div>
</section>` : ''}
</article>`;

  return shell(
    post.seoTitle,
    post.seoDesc,
    body,
    {
      url,
      og: post.cover,
      schema,
      razorpayKeyId: opts.razorpayKeyId,
      googleClientId: opts.googleClientId,
      products: opts.products,
      legalPages: opts.legalPages,
      useMagicCheckout: !!opts.useMagicCheckout,
      maintenanceConfig: opts.maintenanceConfig,
      storeSettings: opts.storeSettings,
      pageType: 'article'
    }
  );
}
