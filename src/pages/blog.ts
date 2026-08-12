import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

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

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;      // <title> tag
  seoDesc: string;       // meta description
  excerpt: string;       // shown on the blog index card
  cover: string;         // hero image URL
  category: 'Style' | 'Fabric' | 'Culture' | 'Guides';
  readMins: number;
  publishedISO: string;
  updatedISO: string;
  author: string;
  keywords: string;
  // HTML body of the article — kept as one long string so links + strong tags render
  body: string;
}

// -----------------------------------------------------------------------------
// Blog posts — each one is a targeted piece of organic content
// -----------------------------------------------------------------------------
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-oversized-tshirt-brands-india-2026',
    title: 'The Best Oversized T-Shirt Brands in India (2026)',
    seoTitle: 'Best Oversized T-Shirt Brands in India 2026 — Heavyweight, Premium & Affordable',
    seoDesc: 'A curated 2026 guide to the best oversized t-shirt brands in India — heavyweight GSM options, fits, price ranges, and how Intru compares on quality, drop model, and made-in-India credentials.',
    excerpt: 'From 240 GSM heavyweight tees to the drop-based streetwear scene — we compare Indian brands on fabric weight, fit accuracy, price, and whether the "oversized" is real or just a bigger size.',
    cover: 'https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1200',
    category: 'Guides',
    readMins: 7,
    publishedISO: '2026-06-15',
    updatedISO: '2026-08-01',
    author: 'Intru Editorial',
    keywords: 'best oversized t-shirt brands india, oversized tshirt india, heavyweight tshirt india, premium streetwear india, indian streetwear brands 2026',
    body: `<p><strong>India\'s oversized t-shirt market has exploded since 2022.</strong> The problem: most brands sell a "regular" tee cut one size bigger and slap the word "oversized" on the tag. A true oversized fit is engineered into the pattern — dropped shoulders, wider body, longer length — and cut from a heavyweight fabric that actually holds the drape.</p>

<p>Here is how the leading Indian oversized t-shirt brands stack up in 2026, judged on the metrics that matter — fabric weight (GSM), fit accuracy, price, and the level of transparency about where and how the garments are made.</p>

<h2>What "oversized" should actually mean</h2>
<p>Before we compare, three things you should demand from any oversized tee in India:</p>
<ul>
  <li><strong>220 GSM or higher.</strong> Anything under 200 GSM will cling to your body in Indian humidity and lose shape after 5 washes.</li>
  <li><strong>Dropped shoulder seam.</strong> The shoulder seam should sit past your natural shoulder — that is what creates the boxy silhouette, not extra chest width.</li>
  <li><strong>Longer body.</strong> A true oversized tee is 2–3 inches longer than a regular fit of the same size, so it hangs correctly with cargos or wide-leg trousers.</li>
</ul>

<h2>How Intru compares</h2>
<p>We make every Intru piece at 240 GSM garment-dyed cotton, cut with a proper dropped shoulder and length-drop pattern. Every drop is manufactured in small batches in Hyderabad, never restocked. Explore the current drop at <a href="/collections?cat=T-Shirts">intru.in/collections</a>.</p>

<h3>The Intru philosophy</h3>
<p>We do not run flash sales, we do not restock, and we do not sell a "regular" fit next to an "oversized" fit. There is one silhouette, and it is built into the pattern. If you wear Medium in a normal tee, you wear Medium at Intru. See our <a href="/style-guide">complete oversized-tee style guide</a> for outfit ideas.</p>

<h2>What to look for when comparing brands</h2>
<p>When you\'re researching oversized tee brands in India, check for these signals of quality on the product page:</p>
<ol>
  <li><strong>GSM disclosed.</strong> Any brand serious about heavyweight streetwear will publish the GSM. If it\'s not on the page, it\'s probably 160–180 GSM.</li>
  <li><strong>Actual measurements in inches.</strong> Chest, length, sleeve — not just "S/M/L". A brand that publishes real measurements takes their pattern seriously.</li>
  <li><strong>Pre-shrunk fabric.</strong> Look for "pre-shrunk" or "garment-dyed" on the label. Both processes lock in the fit so it doesn\'t change after your first wash.</li>
  <li><strong>Small-batch or drop model.</strong> Brands that make 200–500 pieces per SKU care more about the pattern than mass producers who cut thousands.</li>
</ol>

<h2>Price bands in the Indian oversized market</h2>
<p><strong>₹399–₹699:</strong> Bulk-manufactured tees, usually 140–180 GSM. Fit is inconsistent because pattern control is loose at this price. You get what you pay for.</p>
<p><strong>₹800–₹1,300:</strong> The sweet spot for heavyweight oversized in India. This is where Intru sits at <strong>₹999</strong> — 240 GSM, pre-shrunk, garment-dyed, dropped shoulder, made in India. You get streetwear-grade construction at a price that isn\'t importing western brand markup.</p>
<p><strong>₹1,500+:</strong> Import brands or premium Indian labels with heavy branding. Fabric quality is usually similar to the mid-band — you\'re paying for the logo.</p>

<h2>The verdict</h2>
<p>Pick a brand that (a) publishes real GSM and measurements, (b) makes pieces in small batches, and (c) is transparent about where they cut and sew. If you\'re ready to try one, browse the current <a href="/collections">Intru drop</a> — every piece hits all three benchmarks, and the drop model means what you buy stays rare.</p>

<div style="background:#f5f5f5;border-left:3px solid #0a0a0a;padding:20px 24px;margin:32px 0;font-size:14px;line-height:1.7">
<strong style="display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-size:11px">Related reading</strong>
→ <a href="/blog/how-to-choose-oversized-tshirt-size">How to choose your oversized t-shirt size in India</a><br>
→ <a href="/blog/heavyweight-vs-lightweight-cotton">Heavyweight vs lightweight cotton — which is right for Indian weather?</a><br>
→ <a href="/style-guide">The Intru Style Guide: 6 ways to style an oversized tee</a>
</div>`
  },
  {
    slug: 'how-to-choose-oversized-tshirt-size',
    title: 'How to Choose the Right Oversized T-Shirt Size',
    seoTitle: 'Oversized T-Shirt Size Guide India — How to Choose Your Fit',
    seoDesc: 'A no-nonsense sizing guide for oversized t-shirts in India. Why "size up" is bad advice, how to measure yourself, and the exact chest and length numbers you should look for.',
    excerpt: 'Do you size up for oversized? (No.) How do you actually measure yourself? What if you\'re between sizes? Every question about oversized tee sizing, answered.',
    cover: 'https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1200',
    category: 'Guides',
    readMins: 5,
    publishedISO: '2026-06-20',
    updatedISO: '2026-07-28',
    author: 'Intru Editorial',
    keywords: 'oversized tshirt size guide india, how to size oversized tshirt, oversized fit sizing, intru size chart, oversized tee measurement',
    body: `<p>The single most common question we get on Instagram DMs: <em>"Should I size up for an oversized tee?"</em></p>
<p><strong>Short answer: No.</strong> If you wear Medium in a regular-fit tee, you should wear Medium in a true oversized tee. Sizing up is what people do when their brand does not actually make an oversized pattern — they just buy a bigger regular tee and hope it looks oversized.</p>

<h2>Why sizing up is a trap</h2>
<p>When you buy a size larger than your normal:</p>
<ul>
  <li>The <strong>chest width</strong> becomes correct-ish for the oversized look, but…</li>
  <li>The <strong>shoulder seam</strong> now sits way too far down your arm — it looks sloppy, not intentional.</li>
  <li>The <strong>sleeve length</strong> extends past your elbow — same problem.</li>
  <li>The <strong>body length</strong> is only slightly longer, so the proportion is off.</li>
</ul>
<p>A properly cut oversized tee solves all four in a single pattern. That\'s the whole point.</p>

<h2>How to measure yourself at home</h2>
<p>You need a soft measuring tape (or a piece of string + a ruler). Two measurements:</p>

<h3>1. Chest circumference</h3>
<p>Wrap the tape around the widest part of your chest, under the armpits. Keep it snug but not tight. Note the number in inches.</p>

<h3>2. Torso length</h3>
<p>From the top of your shoulder (where the seam should sit on a regular shirt) down to the point where you want the tee to end. On an oversized tee, you\'ll want this to hit past the belt line — typically 27–30 inches for men, 24–27 inches for women.</p>

<h2>The Intru sizing benchmark</h2>
<p>Every Intru product page has a full measurement table, but here are the anchor numbers for our current drop:</p>
<div style="overflow-x:auto;margin:20px 0">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr style="border-bottom:2px solid #0a0a0a"><th style="text-align:left;padding:12px 8px">Size</th><th style="text-align:left;padding:12px 8px">Chest (in)</th><th style="text-align:left;padding:12px 8px">Length (in)</th><th style="text-align:left;padding:12px 8px">Fits body chest (in)</th></tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">S</td><td style="padding:10px 8px">44</td><td style="padding:10px 8px">27</td><td style="padding:10px 8px">36–38</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">M</td><td style="padding:10px 8px">46</td><td style="padding:10px 8px">28</td><td style="padding:10px 8px">38–40</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">L</td><td style="padding:10px 8px">48</td><td style="padding:10px 8px">29</td><td style="padding:10px 8px">40–42</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">XL</td><td style="padding:10px 8px">50</td><td style="padding:10px 8px">30</td><td style="padding:10px 8px">42–44</td></tr>
<tr><td style="padding:10px 8px">XXL</td><td style="padding:10px 8px">52</td><td style="padding:10px 8px">31</td><td style="padding:10px 8px">44–46</td></tr>
</tbody></table>
</div>
<p>Notice the pattern: the <strong>tee chest is always ~6–8 inches wider than your body chest</strong>. That gap is the oversized drape, built into the pattern.</p>

<h2>Between sizes? Follow the drop rule</h2>
<p>If your body chest is 40 inches, you\'re at the top of Medium and the bottom of Large. Ask yourself:</p>
<ul>
  <li><strong>Do you want an extreme drop?</strong> Go Large. The tee will hang further off your shoulders.</li>
  <li><strong>Do you want a cleaner, tailored oversized look?</strong> Go Medium. The drape will be intentional but not extreme.</li>
</ul>
<p>For crop tops (women), the same logic applies — but note our <a href="/collections?cat=Crop-Tops">Crop Tops</a> use a specific pattern with a shorter torso, not just a cropped version of the men\'s tee.</p>

<h2>Still unsure? Ask our AI Stylist</h2>
<p>Every product page has an AI Stylist button (bottom-right). Tell it your height, weight and preferred fit, and it will recommend the exact size for that piece. Or DM us <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a> — a real person replies within a few hours.</p>`
  },
  {
    slug: 'heavyweight-vs-lightweight-cotton',
    title: 'Heavyweight vs Lightweight Cotton: Which Is Right for Indian Weather?',
    seoTitle: 'Heavyweight vs Lightweight Cotton T-Shirt — Which Is Best for India?',
    seoDesc: 'Heavyweight 240 GSM cotton vs lightweight 160 GSM — which handles Indian summer, monsoons, and AC interiors better? A fabric guide with real durability, breathability, and drape data.',
    excerpt: 'Everyone assumes lightweight cotton is cooler in Indian heat. It isn\'t. Here\'s why heavyweight 240 GSM often wins — from breathability to drape to how long the tee actually lasts.',
    cover: 'https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1200',
    category: 'Fabric',
    readMins: 6,
    publishedISO: '2026-06-25',
    updatedISO: '2026-07-30',
    author: 'Intru Editorial',
    keywords: 'heavyweight vs lightweight cotton, 240 gsm tshirt, cotton weight india, best fabric for indian summer, breathable cotton tshirt',
    body: `<p>The received wisdom in India: <em>"Buy a thin cotton tee — it\'s hotter here, so lighter fabric will keep you cool."</em></p>
<p>The reality: <strong>lightweight cotton often traps heat and moisture worse than heavyweight cotton</strong>, and dies after 20 washes. Here\'s what a decade of streetwear R&D has taught us about fabric weight for Indian climates.</p>

<h2>What GSM actually measures</h2>
<p><strong>GSM = grams per square metre.</strong> It\'s the weight of a 1m × 1m sheet of that fabric.</p>
<ul>
  <li><strong>140–170 GSM:</strong> Lightweight — thin, semi-transparent, mass-market tees.</li>
  <li><strong>180–210 GSM:</strong> Midweight — most H&M / Zara basics.</li>
  <li><strong>220–260 GSM:</strong> Heavyweight streetwear — Intru sits at <strong>240 GSM</strong>.</li>
  <li><strong>280+ GSM:</strong> Overweight, often used for hoodies and workwear.</li>
</ul>

<h2>Myth: heavier fabric is hotter</h2>
<p>This is the assumption everyone makes, and it\'s wrong for three reasons:</p>

<h3>1. Airflow &gt; thinness</h3>
<p>Lightweight cotton clings to your skin as soon as you sweat, sealing off airflow. Heavyweight cotton is stiffer and holds a small air gap between the fabric and your body — that gap is where cooling happens. Same reason loose linen shirts feel cooler than a thin polyester tee.</p>

<h3>2. Sweat absorption &gt; sweat retention</h3>
<p>A 240 GSM cotton tee absorbs sweat into the fibres and releases it via evaporation. A 160 GSM tee saturates faster and just stays wet against your skin.</p>

<h3>3. Structure prevents cling</h3>
<p>The most uncomfortable feeling in Indian heat isn\'t heat — it\'s wet cotton stuck to your body. Heavyweight fabric holds its own shape, so even when it\'s damp it doesn\'t cling. That\'s the difference.</p>

<h2>Durability: the hidden cost of lightweight</h2>
<p>A ₹300 lightweight cotton tee looks fine on day one. By month three:</p>
<ul>
  <li>The neck rib has curled and lost shape.</li>
  <li>Small holes are appearing from friction.</li>
  <li>The colour has faded 20–30%.</li>
  <li>The fit has stretched 1 size larger.</li>
</ul>
<p>A 240 GSM garment-dyed tee at ₹999 lasts <strong>5–8× longer</strong>. The math on cost-per-wear is not close.</p>

<h2>Where heavyweight loses</h2>
<p>Fair balance — there are two cases where lightweight cotton wins:</p>
<ol>
  <li><strong>Extreme humidity + no AC.</strong> If you\'re outdoors in 90% humidity for 4+ hours (think coastal fishing / hiking), a very thin 130 GSM tee dries faster after saturation.</li>
  <li><strong>Layering under formalwear.</strong> If the tee is a base layer under a shirt or blazer, thinness matters more than drape.</li>
</ol>
<p>For everything else — daily wear, streetwear, going out, working from home — heavyweight is the correct answer.</p>

<h2>How to test fabric weight without a scale</h2>
<p>Two quick tests you can do in-store or before ordering:</p>
<ol>
  <li><strong>The hand test.</strong> Bunch the fabric in your fist. Heavyweight cotton pushes back — you feel resistance. Lightweight collapses into nothing.</li>
  <li><strong>The light test.</strong> Hold the fabric up to a bright light. If you can clearly see the outline of your hand behind it, it\'s under 180 GSM.</li>
</ol>

<h2>What Intru uses, and why</h2>
<p>Every Intru piece is <strong>240 GSM garment-dyed cotton</strong>. We landed on this weight after 18 months of testing — it\'s the exact point where you get structure and drape without any excess weight. Combined with our dropped-shoulder oversized pattern, the tee holds its architecture in 40°C Hyderabad summers without clinging.</p>
<p>Try one — <a href="/collections?cat=T-Shirts">shop the current tee drop</a>. And read our <a href="/style-guide">style guide</a> for how to build a heavyweight-cotton wardrobe.</p>`
  },
  {
    slug: 'style-crop-top-outfit-ideas',
    title: '7 Ways to Style an Oversized Crop Top',
    seoTitle: 'How to Style Oversized Crop Tops — 7 Outfit Ideas | Intru',
    seoDesc: 'Seven ways to style an oversized crop top — from high-waist cargo pants to layering under blazers. Real outfit formulas for Indian weather and body types.',
    excerpt: 'The oversized crop is the most versatile piece in a streetwear wardrobe — but only if you know how to style it. Seven outfit formulas that actually work.',
    cover: 'https://intru.in/cdn/shop/files/4.png?v=1748692140&width=1200',
    category: 'Style',
    readMins: 4,
    publishedISO: '2026-07-02',
    updatedISO: '2026-07-25',
    author: 'Intru Editorial',
    keywords: 'crop top outfit ideas, how to style crop top, oversized crop top styling, crop top with cargo pants, indian streetwear women',
    body: `<p>The oversized crop top is the piece that gets asked about most in DMs. It looks simple on the hanger and then people freeze at home wondering what to pair it with. Here are seven formulas we go back to on repeat.</p>

<h2>1. The high-waist cargo</h2>
<p>Oversized crop + high-waisted wide-leg cargo pants. The crop sits just above the natural waistline, cargo does the rest. Add chunky sneakers. This is the safest, most repeatable formula — it works on every body type.</p>

<h2>2. Layer under a blazer</h2>
<p>Wear an oversized crop under a slightly-oversized blazer, with straight-leg jeans. The crop adds a modern edge to what would otherwise be an office look. Best in monochrome (black crop, black blazer, dark denim).</p>

<h2>3. The slip skirt</h2>
<p>A satin midi slip skirt + oversized crop = polished but relaxed. The heavyweight cotton of the crop gives structure that a fitted top wouldn\'t. Add block-heel sandals for going out.</p>

<h2>4. Cycling shorts + oversized crop</h2>
<p>Everyone owns cycling shorts now. Pair with an oversized crop and chunky white sneakers — the classic athleisure formula. Bonus: the crop\'s length balances the tightness of the shorts.</p>

<h2>5. Tuck it into denim</h2>
<p>Half-tuck the front of the crop into high-waist straight-leg jeans. Front-tuck only, back stays out. Small styling move, huge visual effect — breaks the horizontal line of the crop hem.</p>

<h2>6. Layered over a fitted long-sleeve</h2>
<p>For winter and AC interiors: oversized crop over a fitted long-sleeve tee. Great for tier-2/3 cities where evenings get cold. Layer under a bomber or coach jacket for extra warmth.</p>

<h2>7. Monochrome column</h2>
<p>All one colour, head to toe — crop, pants, sneakers. Instantly elongates the body and looks intentional. Best colours to try: all black, all off-white, all sage green.</p>

<h2>What we\'d actually recommend buying</h2>
<p>Any of these looks needs a well-cut oversized crop as the foundation — one that has a proper pattern, not just a chopped-off tee. Browse our current <a href="/collections?cat=Crop-Tops">crop tops drop</a> — every piece is 240 GSM heavyweight cotton with a pattern designed for the crop silhouette, not adapted from a men\'s tee.</p>
<p>Also read the <a href="/style-guide">full Intru style guide</a> for the framework we use to build every outfit.</p>`
  },
  {
    slug: 'why-limited-drops-work',
    title: 'Why Limited Drops Beat Fast Fashion',
    seoTitle: 'Why Limited Drops Beat Fast Fashion — The Sustainable Streetwear Case',
    seoDesc: 'The economics and ethics of the limited-drop clothing model vs fast fashion. Why owning fewer, rarer pieces is better for you and the planet — and how Intru builds around it.',
    excerpt: 'Fast fashion sells you 12 versions of the same tee and hopes you buy 4. The limited-drop model does the opposite — one version, made in small batches, never restocked. Here\'s why it works.',
    cover: 'https://intru.in/cdn/shop/files/5.png?v=1748692170&width=1200',
    category: 'Culture',
    readMins: 5,
    publishedISO: '2026-07-08',
    updatedISO: '2026-07-20',
    author: 'Intru Editorial',
    keywords: 'limited drop streetwear, sustainable fashion india, fast fashion alternative, small batch clothing, drop model streetwear',
    body: `<p>Walk into any fast-fashion store and you\'ll see the same white t-shirt in 20 slightly different cuts. Six shades of the "same" grey. Twelve variants of the "same" cargo. The abundance is the strategy — overwhelm you until you buy something.</p>
<p>The <strong>limited-drop model</strong> is the exact opposite. One version of each design, cut in a small batch, released once, and never restocked. It sounds constraining. It\'s actually freeing.</p>

<h2>The fast-fashion trap</h2>
<p>Traditional retail runs on continuous replenishment. To keep shelves stocked they:</p>
<ul>
  <li>Manufacture at giant scale (10,000+ units per SKU per season).</li>
  <li>Sacrifice pattern quality for speed.</li>
  <li>Use lightweight, cheaper fabric (140–170 GSM cotton or blends).</li>
  <li>Overproduce by 20–30% to cover restock demand — the excess ends up incinerated or dumped.</li>
</ul>
<p>Result: everything is available all the time, quality is mediocre, and 100 billion pieces of clothing are made globally every year.</p>

<h2>How the drop model changes the math</h2>
<p>A drop-based brand like Intru works differently:</p>
<ol>
  <li>Design one piece with real care — pattern-graded, fit-tested, sample-checked.</li>
  <li>Cut a small batch (usually 200–500 pieces per SKU).</li>
  <li>Release it. Sell through in days or weeks.</li>
  <li>Retire the design. Never restock.</li>
</ol>
<p>What this gets you:</p>
<ul>
  <li><strong>Zero overproduction</strong> — every piece cut is a piece sold, so nothing gets destroyed.</li>
  <li><strong>Higher quality per piece</strong> — small batches mean the sampling/QC cycle can be thorough.</li>
  <li><strong>Real scarcity</strong> — what you own stays rare. Nobody else will be wearing the same tee in three years because there are no more of them.</li>
</ul>

<h2>Why "you\'ll wear it more" is the real sustainability story</h2>
<p>The most sustainable garment isn\'t the one made from recycled materials — it\'s the one you wear 100 times instead of 5. That\'s a fashion-industry stat that gets repeated because it\'s true.</p>
<p>Drop-model clothing gets worn more because:</p>
<ul>
  <li>You spent more per piece → you value it more.</li>
  <li>The pattern is better → it looks right longer.</li>
  <li>The fabric is heavier → it survives more wash cycles.</li>
  <li>Nothing replaces it — the design is vaulted, so this specific piece is <em>your</em> piece.</li>
</ul>

<h2>The counter-argument (fairly)</h2>
<p>Two legitimate criticisms of the drop model:</p>
<ol>
  <li><strong>FOMO can drive over-purchasing.</strong> Some drop brands manufacture artificial scarcity to trigger panic buys. We publish real batch sizes on every drop precisely to fight that.</li>
  <li><strong>Missing out feels bad.</strong> If a drop sells out before you can buy, that stings. We recommend joining the drop notification list (footer) so you know before the general audience.</li>
</ol>
<p>Both are real. Neither outweighs the systemic upside.</p>

<h2>What Intru actually does</h2>
<p>Every Intru drop is manufactured in Hyderabad in batches of 200–500. We do not restock. When a piece sells out it\'s vaulted permanently. Fabric is 240 GSM heavyweight cotton, garment-dyed, cut with a real oversized pattern. Explore the <a href="/collections">current drop</a> before it\'s gone — and read our <a href="/about">founder story</a> for how we got here.</p>`
  }
];

// -----------------------------------------------------------------------------
// Blog index page
// -----------------------------------------------------------------------------
export function blogIndexPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const today = new Date().toISOString().split('T')[0];

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://intru.in/blog#blog',
    'name': 'Intru Journal — Streetwear Style, Fabric & Culture',
    'description': 'Long-form guides on oversized streetwear, heavyweight cotton, styling and the limited-drop model. Written by the Intru team from Hyderabad.',
    'url': 'https://intru.in/blog',
    'inLanguage': 'en-IN',
    'publisher': { '@type': 'Organization', 'name': 'Intru', 'url': 'https://intru.in' },
    'dateModified': today,
    'blogPost': BLOG_POSTS.map(p => ({
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

  const cats = [...new Set(BLOG_POSTS.map(p => p.category))];

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
<p class="bl-sub">Long reads on oversized streetwear, heavyweight cotton, styling and the limited-drop model. Written by the Intru team from Hyderabad.</p>
</section>

<section class="bl-wrap">
<div class="bl-filters" role="tablist" aria-label="Filter by category">
<button class="bl-fb act" data-cat="all" onclick="filterBlog('all',this)">All</button>
${cats.map(c => `<button class="bl-fb" data-cat="${c}" onclick="filterBlog('${c}',this)">${c}</button>`).join('')}
</div>

<div class="bl-grid" id="blGrid">
${BLOG_POSTS.map(p => `<a href="/blog/${p.slug}" class="bl-card" data-cat="${p.category}">
<div class="bl-cimg">
<img src="${p.cover}" alt="${p.title}" loading="lazy" width="600" height="375">
<span class="bl-cbadge">${p.category}</span>
</div>
<div class="bl-cmeta">${new Date(p.publishedISO).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'})} · ${p.readMins} min read</div>
<h2 class="bl-ctitle">${p.title}</h2>
<p class="bl-cex">${p.excerpt}</p>
<span class="bl-crm">Read Article <i class="fas fa-arrow-right"></i></span>
</a>`).join('')}
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
    'Long-form guides on oversized streetwear, heavyweight cotton, styling tips, and the limited-drop model. Written by the Intru team in Hyderabad, India.',
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
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const url = 'https://intru.in/blog/' + post.slug;

  // Related posts — same category, excluding self, up to 3
  const related = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fallback = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category !== post.category).slice(0, 3 - related.length);
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
<p>Limited-run oversized streetwear, made in Hyderabad. Never restocked.</p>
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
