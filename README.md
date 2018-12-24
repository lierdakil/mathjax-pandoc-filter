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

-   `mathjax`

    Will be converted to JS object and passed to `MathJax.config`. Refer to
    [MathJax-node documentation](https://github.com/mathjax/MathJax-node#configoptions) for details.

-   `mathjax.typeset`

    Will be unified with default typeset options and passed to each call of `MathJax.typeset`. Refer to [MathJax-node documentation](https://github.com/mathjax/MathJax-node#typesetoptions-callback) for details.

    Values here will override the defaults.

    Note: you can override any values, but you probably don't want to touch `math` and `svg` at least.

Example:

```bash
echo '$$a_i$$' | pandoc --filter mathjax-pandoc-filter -Mmathjax.centerDisplayMath -Mmathjax.noInlineSVG
```

You can also specify this options in Markdown document's YAML header:
```markdown
---
mathjax.centerDisplayMath: true
mathjax.noInlineSVG: true
mathjax.typeset:
  cjkCharWidth: 15
---

$$a_i$$
```

Note: you can't set `mathjax` or `mathjax.typeset` from command line.
