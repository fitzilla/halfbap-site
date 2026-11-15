# Half Bap Recording Studios: website

A static site: plain HTML, CSS and JavaScript, with no build step. Upload the folder to any static host, such as Netlify, Vercel, GitHub Pages or Cloudflare Pages.

## Run it locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## How it works

- **Desktop (900px and wider):** a photo slideshow, with a stack of five strips on the right. Clicking a strip opens it sideways into a big-text panel, and the ✕ (top right), the photo or Esc closes it.
- **Phone (under 900px):** the slideshow fills the screen. The **Menu** button opens a full-screen vertical menu, and each item opens its own page. The **✕** takes you back to where you were (the menu, or the homepage).
- **Slideshow:** shows the studio first, then Alana Henderson. It moves on every 7 seconds and has arrows, dots and a pause button. It also pauses on hover or focus, and swipes on phones.
- **Article:** "Read more" slides in a drawer from the right, with the homepage dimmed behind it.
- **Intro:** on the first visit in a browser session, the logo fills the screen and then flies into the top-left corner. Any click or key skips it.
- **Gallery:** each photo opens a lightbox with arrows, swipe and keyboard controls.
- **Links:** every view has its own URL that can be shared: `#about`, `#services`, `#equipment`, `#gallery`, `#contact` and `#alana-henderson`.
- **Keyboard:** with a panel open, ← and → step through the sections; on the homepage they move the slideshow. Esc closes things.
- **Older browsers:** works on Safari 13+ and every current browser. With JavaScript off, all five sections show as one long scrolling page.
- **Reduced motion:** visitors who ask their device for less motion get no intro animation and no autoplay.

## Files

| File | What's in it |
|---|---|
| `index.html` | All the content |
| `css/styles.css` | Desktop layout first, then the phone layout under `@media (max-width: 899px)` |
| `js/main.js` | Panels, the drawer, the slideshow, the logo intro, the article and the form |
| `img/` | Photos from the original site, the cropped Half Bap logo, and the Alana Henderson video still |

## Still to do before launch

- [ ] Remove the `<meta name="robots" content="noindex, nofollow">` line in `index.html` so search engines can find the site.

- [ ] **Instagram feed:** the "Latest on Instagram" tiles are studio photos linking to the profile. For real posts, swap the `.feed__grid` list for an Instagram feed embed (e.g. Behold or Elfsight) (search `TODO` in `index.html`).
- [ ] Fill in **[Producer]** and **[Engineer]** in the Alana Henderson article in `index.html`.
- [ ] **Booking form:** at the moment it opens the visitor's email app with the details filled in. To receive submissions without that step, point the `<form>` at a form service such as Formspree or Netlify Forms, and remove the `submit` handler in `js/main.js`.
- [ ] **Images (nice to have):** re-encode as WebP/AVIF with JPEG fallbacks and tighter compression. Roughly halves image weight (about 2.5MB down to 1–1.3MB if everything is opened).
- [ ] **Fonts:** Chakra Petch, Inter Tight and Space Mono, all from Google Fonts. They're free to use (OFL licence) on any site.
- [ ] Add more slides: copy a `hero__img` and a `stage-layer`, give them the next `data-slide-index`, and add a matching `.dot`.
