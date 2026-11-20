# Stoke Design

Static site: `index.html` (home), `about.html`, `services.html`, `contact.html`, `portfolio.html` and one case-study page per project
(`7b-iv-trinity-wellness-center.html`, `shooters-bar-and-grill.html`, `valor-christian-high-school.html`, `hair-by-drew.html`), styled by `styles.css`,
with smooth scroll and intro animation in `motion.js` and the mobile menu in `nav.js`.

## Run locally with live reload

Requires Node 20 or newer. No install step.

```bash
npm run dev        # http://localhost:8000, reloads on every file change
npm run dev:sync   # same, plus git pull every 5s to pick up pushed changes
```

- CSS edits are swapped in place without a reload, so the intro animation doesn't replay.
- Any other change (HTML, JS, images) reloads the page.
- Use another port with `PORT=3000 npm run dev`.
- `dev:sync` needs a clean working tree on a branch that tracks a remote, and only
  fast-forwards. If it can't pull, it prints why and keeps serving.

## Hidden pages

`johnson-brothers-painting.html` is hidden for now: it is not linked from the portfolio, the Next buttons or the
Services page, and it is marked `noindex`. To bring it back, remove it from `HIDDEN` in the page generator, add its
tile to `portfolio.html`, and re-add its Related work link on `services.html`.

## Contact form

`contact.html` sends messages through Web3Forms, using the access key in its `access_key` field (keys are meant to sit
in page HTML). To change the key or the inbox that receives messages, get a new key at https://web3forms.com and
replace that field's value. If the field ever holds a placeholder starting with `YOUR_ACCESS_KEY`, the form refuses to
send and tells visitors it is not connected.
