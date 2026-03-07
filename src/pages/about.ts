import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function aboutPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About — intru.in",
    "description": "The story of intru.in — exclusive streetwear India born from two best friends who hated mass-produced fashion. Limited edition, authentic boutique clothing.",
    "url": "https://intru.in/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "intru.in",
      "url": "https://intru.in",
      "foundingDate": "2026",
      "foundingLocation": { "@type": "Place", "name": "India" },
      "description": "Exclusive streetwear India. Limited edition fashion, authentic boutique clothing."
    }
  });

  const body = `<style>
.ab{max-width:780px;margin:0 auto;padding:80px 24px 100px}
.ab-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g400);margin-bottom:16px;text-align:center}
.ab-title{font-family:var(--head);font-size:clamp(32px,6vw,56px);text-transform:uppercase;letter-spacing:-.04em;text-align:center;margin-bottom:16px;line-height:1.1}
.ab-sub{font-size:15px;color:var(--g400);text-align:center;max-width:520px;margin:0 auto 56px;line-height:1.7}
.ab-sec{margin-bottom:56px}
.ab-sec h2{font-family:var(--head);font-size:clamp(18px,3vw,24px);text-transform:uppercase;letter-spacing:-.02em;margin-bottom:14px}
.ab-sec p{font-size:15px;color:var(--g500);line-height:1.85;margin-bottom:14px}
.ab-sec strong{color:var(--bk);font-weight:700}
.ab-quote{font-size:clamp(20px,3vw,28px);line-height:1.6;color:var(--g500);font-style:italic;font-weight:400;border-left:3px solid var(--bk);padding:20px 0 20px 28px;margin:48px 0}
.ab-quote strong{color:var(--bk);font-style:normal}
.ab-vals{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:48px 0}
.ab-val{padding:28px;border:1.5px solid var(--g100);border-radius:8px}
.ab-val h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.ab-val p{font-size:13px;color:var(--g500);line-height:1.7}
.ab-cta{text-align:center;margin-top:56px;padding-top:40px;border-top:1px solid var(--g100)}
.ab-cta h3{font-family:var(--head);font-size:clamp(20px,3vw,28px);text-transform:uppercase;letter-spacing:-.02em;margin-bottom:12px}
.ab-cta p{font-size:14px;color:var(--g400);margin-bottom:28px}
.ab-btn{display:inline-flex;align-items:center;gap:12px;padding:18px 48px;background:var(--bk);color:var(--wh);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;border:none;transition:all .3s var(--ease)}
.ab-btn:hover{background:var(--g600);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.2)}
@media(max-width:640px){.ab-vals{grid-template-columns:1fr}}
</style>

<div class="ab">
<p class="ab-over anim">About Us</p>
<h1 class="ab-title anim d1">Two Best Friends.<br>One Obsession.</h1>
<p class="ab-sub anim d2">We were super picky about what we wore. So we decided to make it ourselves.</p>

<div class="ab-sec anim d3">
<h2>The Picky Founders</h2>
<p>We <strong>hated mass-produced clothes</strong> — the same patterns, the same fabrics, the same everything. Every mall, every online store, carbon copies everywhere. We'd spend hours hunting for pieces that felt unique and always came up empty.</p>
<p>So we made a pact: if nobody's making what we want to wear, <strong>we'll make it ourselves.</strong> Two best friends, one shared frustration, and a bedroom full of fabric swatches — that's how intru.in was born.</p>
</div>

<blockquote class="ab-quote anim">
"We didn't start intru.in to build a brand. We started it because we were <strong>tired of settling</strong>. Every piece is designed over two months — not because we're slow, but because we refuse to ship anything we wouldn't wear ourselves."
</blockquote>

<div class="ab-sec anim">
<h2>The Anti-Hype Philosophy</h2>
<p>We don't do fake drops. We don't manufacture scarcity. When we say <strong>"limited stock only"</strong>, we mean it — we produce small batches because we personally oversee every design, every stitch, every print. Mass production would mean compromising, and we'd rather shut down than do that.</p>
<p>When a piece sells out, it's <strong>gone forever</strong>. That's not a marketing tactic — that's a promise. We don't believe in restocking because the next drop should always be better than the last.</p>
</div>

<div class="ab-sec anim">
<h2>Made With Love, Not Algorithms</h2>
<p>Every intru.in piece is <strong>designed for two months</strong> before it ever touches fabric. We don't follow trends — we follow our gut. If a design doesn't make us say "I need to wear this right now," it doesn't get made.</p>
<p>We source premium cotton, experiment with puff prints and unique techniques, and test every size on real people (starting with ourselves). The result? Clothes that feel like they were made <strong>just for YOU</strong>.</p>
</div>

<div class="ab-vals anim">
<div class="ab-val">
<h3><i class="fas fa-heart" style="margin-right:6px;color:var(--red)"></i> Made With Love</h3>
<p>Every piece is personally designed by the founders. No outsourced designs, no trend-chasing algorithms.</p>
</div>
<div class="ab-val">
<h3><i class="fas fa-lock" style="margin-right:6px"></i> Limited Stock Only</h3>
<p>Small batches, never restocked. When it's gone, it's gone — that's our word.</p>
</div>
<div class="ab-val">
<h3><i class="fas fa-ban" style="margin-right:6px"></i> No Fake Drops</h3>
<p>We don't manufacture hype. Every drop is genuine, every sell-out is real.</p>
</div>
<div class="ab-val">
<h3><i class="fas fa-clock" style="margin-right:6px"></i> 2 Months Per Design</h3>
<p>Rushed fashion is bad fashion. We take our time because you deserve better.</p>
</div>
</div>

<div class="ab-cta anim">
<h3>Ready to Wear Something Real?</h3>
<p>Shop the current drop before it's gone forever.</p>
<a href="/collections" class="ab-btn">Shop Collections <i class="fas fa-arrow-right"></i></a>
</div>
</div>`;

  return shell(
    'About — INTRU.IN | Exclusive Streetwear India | Our Story',
    'The story behind intru.in — exclusive streetwear India by two best friends tired of mass-produced fashion. Limited edition, authentic boutique clothing made with love.',
    body,
    { url: 'https://intru.in/about', schema, razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: !!opts.useMagicCheckout, maintenanceConfig: opts.maintenanceConfig, storeSettings: opts.storeSettings }
  );
}
