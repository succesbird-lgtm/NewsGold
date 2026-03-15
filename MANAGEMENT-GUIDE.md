# NewsOnGold — Website Management Guide
## For Teachers, Students, and Administrators

---

## 📁 File Structure Overview

```
newsgold/
├── index.html              ← Homepage (edit this rarely)
├── netlify.toml            ← Netlify settings (do not edit)
├── css/
│   └── style.css           ← All visual styles
├── js/
│   └── main.js             ← Gold prices, calculator, navigation
└── pages/
    ├── articles.html       ← Article listing page
    ├── article-sample.html ← Template for new articles ⭐
    ├── about.html          ← About the project
    ├── curiosities.html    ← Gold facts page
    ├── other-metals.html   ← Other metals prices
    ├── privacy.html        ← Privacy policy
    └── disclaimer.html     ← Disclaimer
```

---

## ✍️ HOW TO PUBLISH A NEW ARTICLE (Daily Workflow)

### Step 1 — Duplicate the template
1. Open `pages/article-sample.html` in a text editor (e.g. Notepad, VS Code, or similar)
2. Save a copy with a new name: `pages/your-article-title.html`
   - Use lowercase, hyphens for spaces: `bitcoin-history-brazil.html`

### Step 2 — Edit the article content
Find and replace these parts inside the file:

| What to change | Where to find it |
|---|---|
| Page title (browser tab) | `<title>` tag in `<head>` |
| Meta description | `<meta name="description">` |
| Article category | `<span class="article-page-cat">` |
| Article heading | `<h1 class="article-page-title">` |
| Author name | `.article-page-byline .author` |
| Date | The date in `.article-page-byline` |
| Article body text | Inside `<div class="article-page-body">` |
| The emoji image | Change the emoji in `<div class="article-page-img">` |

### Step 3 — Add the article to the homepage
Open `index.html` and find the "Latest Articles" section. Copy one existing `<article class="article-card">` block and update the title, date, category, link, and short excerpt.

### Step 4 — Add the article to articles.html
Do the same in `pages/articles.html` — add a new card to the articles grid.

### Step 5 — Deploy to Netlify
See the Netlify deployment section below.

---

## 🚀 DEPLOYING TO NETLIFY

### First-time setup:
1. Create a free account at [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub/GitLab/Bitbucket OR drag-and-drop the folder
4. Set **Publish directory** to: `.` (just a dot)
5. Click **Deploy site**

### Recommended: Using GitHub (best for daily publishing)
1. Create a free GitHub account
2. Create a repository called `newsgold`
3. Upload all files there
4. Connect Netlify to your GitHub repo
5. Every time you push a file change to GitHub → Netlify automatically updates the website

### Quick drag-and-drop method:
1. Log in to Netlify
2. Go to your site dashboard
3. Click **"Deploys"** tab
4. Drag your entire `newsgold/` folder onto the deploy area
5. Wait ~30 seconds → site is live

### Your site URL:
Netlify gives you a free URL like `newsgold.netlify.app`. You can add a custom domain (e.g. `newsgold.com`) in **Site settings → Domain management**.

---

## 💰 GOOGLE ADSENSE SETUP

### Step 1 — Apply for AdSense
1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign in with your Google account
3. Enter your website URL and contact details
4. Wait for approval (can take 1–14 days; site must have real content)

### Step 2 — Add your Publisher ID to all HTML files
Once approved, Google gives you a publisher ID like `ca-pub-1234567890`.

Open each HTML file and find this comment near the top:
```html
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script> -->
```
- Remove the `<!--` and `-->` comment tags
- Replace `ca-pub-XXXXXXXXXX` with your real publisher ID

### Step 3 — Activate AdSense slots
Find these placeholder blocks in the HTML:
```html
<div class="adsense-slot">
  <!-- Google AdSense Ad Unit -->
  <!-- <ins class="adsbygoogle"...></ins> -->
  <p>📢 Advertisement</p>
</div>
```
Replace the inner comment with your actual AdSense `<ins>` tag from your AdSense dashboard.

### Alternative ad networks (if AdSense approval is slow):
- **Media.net** — Yahoo/Bing ads, easier approval
- **Ezoic** — Good for educational sites
- **Mediavine** — Requires 50,000 monthly sessions

---

## 🎨 CHANGING COLOURS

All colours are defined in `css/style.css` at the top of the file inside `:root { }`.

```css
:root {
  --gold:       #C9A84C;   ← Main gold colour
  --gold-light: #E8C96A;   ← Lighter gold
  --gold-dark:  #9A7A2E;   ← Darker gold
  --green:      #2ECC9A;   ← Accent green (buttons, ticker)
  --black:      #111111;   ← Main text
  --dark:       #1A1A1A;   ← Header/footer background
}
```

To change the colour scheme: simply replace the hex codes. For example, to use blue instead of green for buttons, change `--green: #2ECC9A` to `--green: #3498DB`.

---

## 📝 ARTICLE WRITING TEMPLATE FOR STUDENTS

When writing your article, use this structure inside `<div class="article-page-body">`:

```html
<p>Introduction paragraph — explain the topic in 2–3 sentences.</p>

<h2>First Main Section</h2>
<p>Explanation paragraph...</p>

<blockquote>"A relevant quote from a source." — Source Name</blockquote>

<h2>Second Main Section</h2>
<p>Explanation paragraph...</p>

<h3>Sub-topic</h3>
<p>More detail...</p>

<p>Conclusion paragraph — summarise the key points.</p>
```

**Article checklist for students:**
- [ ] Title is clear and interesting
- [ ] At least 300 words
- [ ] Includes a source/reference
- [ ] Checked for spelling errors
- [ ] Teacher has reviewed and approved
- [ ] Category selected (Gold / Bitcoin / Finance / History / Other)

---

## 🔧 ADDING A REAL LOGO

1. Export your Canva logo as a PNG (transparent background recommended)
2. Save it as `images/logo.png` in the site folder
3. In each HTML file, find `<div class="logo-icon">N</div>` and replace with:
   ```html
   <img src="../images/logo.png" alt="NewsOnGold logo" style="height:44px;width:auto;" />
   ```
   (On `index.html` use `images/logo.png` without the `../`)

---

## 🌐 GOLD PRICE API (Live Prices)

The site currently shows demo prices. To enable live prices:

1. Register at [goldapi.io](https://www.goldapi.io) (free tier available)
2. Get your API key
3. Open `js/main.js`
4. Find `goldApiKey: ''` and enter your key: `goldApiKey: 'your-key-here'`

The site already tries to fetch from `goldprice.org` (no key needed). If that fails, it shows demo prices automatically.

---

## 📊 TRACKING VISITORS (Analytics)

To see how many people visit your site:

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new property for your website
3. Add the Google Analytics tag to each HTML file, just before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
Replace `G-XXXXXXXXXX` with your real Measurement ID.

---

## 🇧🇷 CLONING FOR PORTUGUESE VERSION

When cloning for the Portuguese site:
1. Download all files from Netlify or GitHub
2. Upload to the new domain's hosting
3. Replace all English text in HTML files with Portuguese
4. Update `<html lang="en">` to `<html lang="pt-BR">` in each file
5. Update the email address and any locale-specific content
6. Apply for a new AdSense property for the new domain

---

## 🆘 COMMON ISSUES & FIXES

| Problem | Fix |
|---|---|
| Gold prices not updating | The free API may be temporarily down — prices fall back to demo values automatically |
| Calculator shows wrong result | Check that you entered grams, not ounces |
| Website looks broken after editing | Open browser console (F12) to see error messages |
| Image not showing | Check the file path — files in `pages/` need `../images/` to access the images folder |
| Netlify deploy failed | Check that `netlify.toml` is in the root folder |

---

## 📞 SUPPORT

For technical issues with this website, consult:
- Netlify documentation: [docs.netlify.com](https://docs.netlify.com)
- AdSense help: [support.google.com/adsense](https://support.google.com/adsense)
- HTML/CSS reference: [developer.mozilla.org](https://developer.mozilla.org)

---

*This guide was prepared as part of the NewsOnGold Financial Education Project, Mato Grosso do Sul, Brazil.*
