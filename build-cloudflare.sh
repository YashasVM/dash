#!/usr/bin/env bash
set -euo pipefail

npm --prefix docs-site ci
npm --prefix docs-site run build

rm -rf .pages-dist
mkdir -p .pages-dist
cp index.html styles.css script.js favicon.svg 404.html linkedin-preview.png preview.png .pages-dist/
cp -R fonts .pages-dist/fonts
cp -R logos .pages-dist/logos
cp -R functions .pages-dist/functions

for path in _next api docs llms.mdx og; do
  cp -R "docs-site/out/$path" ".pages-dist/$path"
done

for file in llms.txt llms-full.txt; do
  cp "docs-site/out/$file" ".pages-dist/$file"
done
