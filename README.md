# Half Bap Recording Studios: website

A static site: plain HTML, CSS and JavaScript, with no build step. Upload the folder to any static host, such as GitHub Pages, Netlify, Vercel or Cloudflare Pages.

Preview: https://fitzilla.github.io/halfbap-site/

## Run it locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## How it works

- **Desktop (900px and wider):** a photo slideshow, with a stack of five strips on the right. Clicking a strip opens it sideways into a big-text panel; the ✕ (top right), the dimmed photo or Esc closes it.
- **Phone (under 900px):** the slideshow fills the screen. **Menu** opens a full-screen vertical menu, and each item opens its own page. The **✕** takes you back to where you were (the menu, or the homepage).
- **Intro:** on the first visit in a browser session, the studio photo and logo fill the screen, then the logo glides into the top-left corner while the site fades in. Any click or key skips it.
- **Slideshow:** the studio, then Alana Henderson. Moves on every 7 seconds; arrows, dots, a pause button and swipe. Pauses on hover or keyboard focus.
- **Article:** "Read more" slides in a drawer from the right (two-thirds of the screen on desktop).
- **Lightbox:** gallery and producer photos open large, with arrows, swipe and keyboard controls.
- **Shareable links:** `#about`, `#services`, `#equipment`, `#gallery`, `#contact` and `#alana-henderson`.
- **Keyboard:** with a panel open, ← and → step through the sections; on the homepage they move the slideshow. Esc closes things.
- **Reduced motion:** visitors who ask their device for less motion get no intro, no autoplay and instant transitions.
- **Without JavaScript:** all five sections show as one long scrolling page.
- **Browser support:** full experience in browsers from about 2022 on (Safari 15.5+, Chrome, Edge, Firefox). Older Safari (13–15.4) still works, with some spacing and focus handling less polished.

## Images

Every photo has a WebP version (served to all modern browsers, about 60% smaller) with the original JPEG/PNG as an automatic fallback, using `<picture>`. Grids use 800px versions in `img/thumbs/`; the full-size photo only loads in the lightbox. The hero has a 1280px version for phones and small laptops.

To add or replace a photo, keep the JPEG and make a WebP next to it:

```bash
cwebp -q 76 -metadata none photo.jpg -o photo.webp
```

## Search engines and AI assistants

- **Structured data:** a JSON-LD block in `<head>` describes the studio (name, address, email, founders, producers, services, Instagram and Facebook) so Google and AI assistants get the facts right.
- **`llms.txt`:** a plain-English summary of the studio for AI assistants (ChatGPT, Claude, Perplexity and others). Update it when services, people or contact details change.
- **`robots.txt`:** allows search engines and AI assistants, and points to the sitemap.
- **`sitemap.xml`:** lists the site.
- **Share previews:** Open Graph tags give a proper title, description and photo when the link is shared on WhatsApp, iMessage, Facebook and so on.

## Files

| File | What's in it |
|---|---|
| `index.html` | All the content, plus the SEO tags and structured data |
| `css/styles.css` | Desktop layout first, then the phone layout under `@media (max-width: 899px)` |
| `js/main.js` | Panels, drawer, slideshow, intro, article, lightbox and form |
| `img/` | Photos (WebP + JPEG), the Half Bap logo and the Alana Henderson video still |
| `llms.txt`, `robots.txt`, `sitemap.xml` | For AI assistants and search engines |

## Still to do before launch

- [ ] **Domain:** when halfbapstudios.com points here, update `og:url` and `og:image` in `index.html` (marked `TODO`) to the real domain. The canonical link, structured data, `llms.txt`, `robots.txt` and `sitemap.xml` already use halfbapstudios.com.
- [ ] Remove the `<meta name="robots" content="noindex, nofollow">` line in `index.html` so search engines can find the site.
- [ ] **Contact form:** it currently opens the visitor's email app with the details filled in. For enquiries straight to the inbox, sign up to [Formspree](https://formspree.io) (works on GitHub Pages, free tier), set the `<form>`'s `action` to the Formspree URL with `method="post"`, and remove the `submit` handler at the end of `js/main.js`.
- [ ] Fill in **[Producer]** and **[Engineer]** in the Alana Henderson article.
- [ ] Get Alana's OK to use the video still.
- [ ] **Instagram feed (optional):** the "Latest on Instagram" tiles in Contact us are studio photos linking to the profile. For real posts, swap the `.feed__grid` list for a feed embed (e.g. Behold or Elfsight).
- [ ] **More slides:** copy a `hero__img` and a `stage-layer`, give them the next `data-slide-index`, and add a matching `.dot`.

Fonts are Chakra Petch (headlines) and Inter Tight (everything else) from Google Fonts: free to use (OFL licence) on any site.
