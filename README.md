# mathjax-pandoc-filter

Install via `npm i mathjax-pandoc-filter`

Example usage:

```bash
echo '$$a_i$$' | pandoc --filter ~/node_modules/.bin/mathjax-pandoc-filter
```

Or, if you have npm bin in PATH, just

```bash
echo '$$a_i$$' | pandoc --filter mathjax-pandoc-filter
```

If you need to use `img` tags instead of inline SVG, use `mathjax-pandoc-filter-img` binary:

```bash
echo '$$a_i$$' | pandoc --filter mathjax-pandoc-filter-img
```

Bear in mind that math text baseline will likely be somewhat misaligned.
