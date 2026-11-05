# dash

Static source for [yash0.in](https://yash0.in/) (also served at [yashasvm.pages.dev](https://yashasvm.pages.dev/)).

inspired by t3.gg

## Files

- `index.html` - Page shell and metadata.
- `home.css` - Homepage styling (dark, also.codes fonts and palette: Geist, Geist Mono, Geist Pixel).
- `script.js` - Project list, tabs, and the GitHub tab (contribution graph + recent public activity, fetched client-side).
- `styles.css` - Shared base and 404 page styling.

## Product docs

The reviewable docs site lives in `docs-site/` and uses Fumadocs with one separate MDX page per product under `docs-site/content/docs/products/`.

Preview it with any static server, for example:

```sh
cd docs-site
npm install
npm run dev
```

Then open `http://localhost:3000/docs/`. For the main Cloudflare Pages site, run `./build-cloudflare.sh` and deploy `.pages-dist`. This preserves the homepage and copies the Fumadocs export into `/docs` without publishing the source tree.

## Local preview

Run `python3 preview.py` and open http://localhost:8788/#github. Enter a GitHub username to explore their contribution graph and public activity. Profile links preserve the selected username in the URL.

Compare five working search styles at http://localhost:8788/?review=1#github. Search and reset update in place. The review controls are only shown with `review=1`.

`node test-explorer.cjs` checks search without a document reload, scroll position, all five styles at three viewport widths, and overlapping requests. It requires `playwright-core` and Chromium; set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` if they are outside the default locations.
