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

## Configuration

The filter will check Pandoc metadata for the following boolean options:

-   `mathjax.centerDisplayMath`

    Will add `text-align: center` style to display math paragraphs

-   `mathjax.noInlineSVG`

    Will render math as `img` tags instead of inline `svg`

Example:

```bash
echo '$$a_i$$' | pandoc --filter mathjax-pandoc-filter -Mmathjax.centerDisplayMath -Mmathjax.noInlineSVG
```

You can also specify this options in Markdown document's YAML header:
```markdown
---
mathjax.centerDisplayMath: true
mathjax.noInlineSVG: true
---

$$a_i$$
```
