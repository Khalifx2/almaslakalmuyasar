# Al-Maslak al-Muyassar — website files

A plain HTML site (no build tools). Layout of this repo:

```
wrangler.jsonc     tells Cloudflare "this is a folder of web pages" (don't edit)
README.md          this file (not part of the website)
public/            the website itself — everything visitors can see
```

## Pages (inside `public/`)
| File | Page |
|---|---|
| `index.html` | Homepage |
| `visa.html` · `housing.html` · `life.html` · `safety.html` | The guide |
| `institutes.html` · `institutes-arabic.html` · `institutes-quran.html` | Institutes |
| `tools.html` | Budget calculator + pre-departure checklist |
| `faq.html` · `community.html` | FAQ and community groups |
| `services.html` | Services + enquiry form |
| `about.html` · `terms.html` · `privacy.html` | About and legal |
| `404.html` | "Page not found" |

Shared files: `shell.css`, `shell.js` (menu, footer, language switcher, analytics switch), `guide.css`, `calculator.js`, `favicon.svg`, `og-image.png` (the picture shown when the site is shared on WhatsApp), `sitemap.xml`, `robots.txt`, `_headers`, `_redirects`.

## Quick edits (GitHub pencil icon)
Safe to change: wording, links, dates, numbers — anything between `>` and `<`. Don't edit inside `<script>` or `<style>` unless a line below says so. After you commit, Cloudflare republishes in about a minute.

| To change | Where |
|---|---|
| **Enquiry form key** (Web3Forms) | `public/services.html` — search `YOUR_ACCESS_KEY_HERE` |
| **Visit statistics** (Cloudflare) | `public/shell.js` — the `ANALYTICS_TOKEN = ''` line at the top |
| **Menu items** | `public/shell.js` — the `NAV` list |
| **Service prices** | search `£295`, `£150`, `£30` in `public/services.html` and `public/index.html` (dollar prices sit beside them) |
| **Contact email** | search `hello@almaslakalmuyasar.com` in `services.html`, `about.html`, `terms.html`, `privacy.html` |
| **Business address** | `terms.html` and `privacy.html` — the yellow `[YOUR BUSINESS ADDRESS]` |
| **Call length** | search `30 minutes` in `services.html` |
| **Calculator prices / exchange rates** | `public/calculator.js` — the `EGYPT_COST_DATA` block |
| **Institute prices** | the cards in `institutes-arabic.html` / `institutes-quran.html` (and the matching line in `calculator.js`) |

## Before launch
- Replace `YOUR_ACCESS_KEY_HERE` in `services.html` with your Web3Forms key, then send yourself a test enquiry.
- Replace `[YOUR BUSINESS ADDRESS]` in `terms.html` and `privacy.html`. It must be a real street address, not a PO box. Then delete the HTML comment at the top of each file.
- Have a solicitor review the Terms and Privacy Policy once you have taken a few payments.
- Make sure `hello@almaslakalmuyasar.com` exists and can receive mail before the site goes live.

## Notes
- This guide covers Cairo (primarily Nasr City) only. The disclaimer appears on the homepage, the Institutes overview, the Housing page and the footer of every page.
- Google's translation script loads only when a visitor picks a language other than English.
- The full step-by-step setup (domain, hosting, email, form, analytics) is in `DEPLOYMENT-GUIDE.md`.
