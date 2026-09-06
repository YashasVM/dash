# dash

Static source for [yashasvm.pages.dev](https://yashasvm.pages.dev/).

inspired by t3.gg
## Files

- `index.html` - Page shell and metadata.
- `styles.css` - Layout, typography, and visual styling.
- `script.js` - Project link data and rendering.

## Product docs

The reviewable docs site lives in `docs-site/` and uses Fumadocs with one separate MDX page per product under `docs-site/content/docs/products/`.

Preview it with any static server, for example:

```sh
cd docs-site
npm install
npm run dev
```

Then open `http://localhost:3000/docs/`. For the main Cloudflare Pages site, run `./build-cloudflare.sh` and deploy `.pages-dist`. This preserves the homepage and copies the Fumadocs export into `/docs` without publishing the source tree.
