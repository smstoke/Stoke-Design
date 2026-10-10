# Stoke Design

Static site: `index.html` (home) and `portfolio.html`, styled by `styles.css`,
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
