# 💗 TryToBeSingle.com

> A simple test of your relationship status. Good luck escaping. 😂

A tiny romantic prank website. It asks one question — **"Are you single?"** — and the NO button has serious commitment issues: it runs away from the cursor, dodges taps on phones, and refuses to be pressed. Click YES and you get a dramatic "Congratulations… JUST KIDDING 😂😂" with a shower of hearts.

## Features

- **Runaway NO button** — measures the distance from the pointer to the button and bolts when you get within ~95px (mouse) or ~52px (touch). Taps, clicks and Enter/Space only make it run again.
  - Always stays inside the visible window, never covers the question or the YES button, and re-checks its position when the window is resized or a phone rotates.
  - Dodges *away* from the pointer, and sometimes does a surprise long-distance leap.
  - Doesn't block normal scrolling anywhere else on the page.
- **10 rotating escape messages** ("Nice try 😂", "Your boyfriend would like a word.", …), shuffled so they never repeat back to back.
- **Live escape counter** and a **Replay the prank** link.
- **Secret surprise** after 7 escapes: "Okay, okay... we know the truth. ❤️" → "Someone is already lucky enough to have your heart." with a pulsing heart.
- **YES sequence**: OH REALLY?! 👀 → Congratulations! You're officially single... → (1.5s) JUST KIDDING 😂😂 → Now go tell your boyfriend you love him. ❤️ — with heart + confetti shower and a **TAKE ME BACK ❤️** button that resets everything.
- Cartoon heart mascot whose eyes follow your cursor, heartbeats, and laughs every time NO escapes.
- Floating hearts, sparkles, glass card, heart-shaped cursor on desktop.
- Sound toggle (off by default — sounds are synthesized, nothing autoplays).
- Respects `prefers-reduced-motion`. No backend, no tracking, no analytics.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

To build the production version: `npm run build` (output goes to `dist/`), and `npm run preview` to try that build locally.

## Deploy for free

### Option A — GitHub Pages (already set up)

This repo includes `.github/workflows/deploy.yml`, which builds and publishes the site on every push to `main`.

One-time setup:

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab and re-run the latest "Deploy to GitHub Pages" run (or push any commit).

The site will be live at `https://<your-username>.github.io/lover/`.

### Option B — Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub and click **Add New → Project**.
2. Import this repo. Vercel detects Vite automatically (build: `npm run build`, output: `dist`).
3. Click **Deploy**. You'll get a link like `https://lover-xyz.vercel.app`; you can rename the project to get a nicer URL.

### Custom domain

To actually use `trytobesingle.com`, buy the domain from any registrar, then add it under **Settings → Pages → Custom domain** (GitHub) or **Project → Settings → Domains** (Vercel) and follow the DNS instructions shown there. No code changes are needed: the build uses relative paths, so it works from any URL.

## Tweaking

- Number of escapes before the surprise: `SURPRISE_AFTER` in `src/components/AskScreen.jsx`.
- Escape messages: `src/utils/messages.js`.
- How close the pointer can get before NO runs: `ZONES` in `src/components/RunawayButton.jsx`.

## Project structure

```
src/
  App.jsx                 screens + transitions
  index.css               all styles
  components/
    AskScreen.jsx         the question, counter, messages
    RunawayButton.jsx     the escaping NO button
    YesScreen.jsx         the "JUST KIDDING" sequence
    Surprise.jsx          the secret romantic pop-up
    Confetti.jsx          heart + confetti shower (canvas)
    Mascot.jsx            the cartoon heart
    Background.jsx        floating hearts and sparkles
    Header.jsx            logo + sound toggle
  hooks/useSound.js       tiny Web Audio sound effects
  utils/                  messages, reduced-motion helper
```

Made with ❤️ and absolutely no intention of letting you be single.
