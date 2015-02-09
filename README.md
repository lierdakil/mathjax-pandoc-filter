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
