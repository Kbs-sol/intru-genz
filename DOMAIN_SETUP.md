# INTRU.IN — Custom Domain Setup Guide (v11)

This document provides a step-by-step guide for pointing `intru.in` (GoDaddy) to your Cloudflare Pages deployment.

## 1. Cloudflare Pages Configuration
1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** → **intru-genz**.
3. Click the **Custom Domains** tab.
4. Click **Set up a custom domain**.
5. Type `intru.in` and click **Continue**.
6. Cloudflare will ask to activate the domain. Follow the prompts.
7. **Repeat** for `www.intru.in` to ensure both work.

## 2. DNS Update (GoDaddy)
You have two options. **Option A is highly recommended** for automatic SSL and better performance.

### Option A: Change Nameservers (Recommended)
1. Log in to [GoDaddy Domain Portfolio](https://dcc.godaddy.com/control/portfolio).
2. Select `intru.in`.
3. Click **DNS** → **Nameservers**.
4. Click **Change Nameservers** → **I'll use my own nameservers**.
5. Enter the nameservers provided by Cloudflare (e.g., `ada.ns.cloudflare.com`, `ben.ns.cloudflare.com`).
6. Click **Save** and wait 1–24 hours for propagation.

### Option B: CNAME Records (Only if you can't change NS)
If you must keep GoDaddy DNS:
1. In GoDaddy DNS, add a **CNAME** record:
   - **Name**: `@` (or `intru.in`)
   - **Value**: `intru-genz.pages.dev`
2. Add another **CNAME** for `www`:
   - **Name**: `www`
   - **Value**: `intru-genz.pages.dev`

---

## 3. Update Third-Party Services
Once `intru.in` is live, update these locations to prevent authentication/payment failures:

### A. Google Cloud Console (Auth)
1. Go to [Google API Console](https://console.cloud.google.com/apis/credentials).
2. Open your **OAuth 2.0 Client ID**.
3. Add `https://intru.in` and `https://www.intru.in` to **Authorized JavaScript origins**.
4. Add `https://intru.in/auth/google/callback` to **Authorized redirect URIs**.

### B. Razorpay Dashboard (Payments)
1. Go to [Razorpay → Settings → Webhooks](https://dashboard.razorpay.com/app/webhooks).
2. Edit or Add a webhook.
3. Set the **Webhook URL** to `https://intru.in/api/webhooks/razorpay`.
4. Check that the secret matches `RAZORPAY_WEBHOOK_SECRET` in your Cloudflare secrets.

### C. Resend (Email)
1. Go to [Resend → Domains](https://resend.com/domains).
2. Ensure `intru.in` is verified.
3. If not, follow the DNS instructions to add the required `MX`, `TXT`, and `CNAME` records to your Cloudflare DNS tab.

### D. Supabase (Redirects)
1. Go to [Supabase → Auth → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration).
2. Add `https://intru.in` to the **Redirect URLs** whitelist.

---

## 4. Verification
Run these commands in your terminal to verify the setup:

```bash
# Check if the domain points to Cloudflare
nslookup intru.in

# Check if the API is responding on the new domain
curl https://intru.in/api/health
```

If `/api/health` returns `status: "ok"`, your production environment is live! 🥂
