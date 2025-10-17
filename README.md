Jekyll Dark Theme
==================

Minimal dark Jekyll theme that uses the following colors:
- Background: rgb(23,32,36)
- Foreground: rgb(192,239,254)

Features
- Dark site styles
- Code blocks include a small "Copy" watermark in the top-right; clicking it copies the code block to the clipboard with brief feedback.
 - Syntax highlighting (Prism) tuned to the dark theme colors for common languages
 - Syntax highlighting (Prism) tuned to the dark theme colors for common languages

Vendor Prism locally
1. Run the vendor script to download Prism core and the line-numbers plugin into `assets/`:

```fish
node scripts/vendor-prism.js
```

2. The theme will load local copies of `prism.min.js` and the `prism-line-numbers` plugin and CSS. Line numbers will be available if you add the `line-numbers` class to your `pre` elements (Prism will also auto-initialize).

Usage
1. Copy the files into your Jekyll site or add this directory as a remote theme/local theme.
2. In your site's `_config.yml` set `theme: jekyll-dark-theme` (or include the layout files into your site)
3. Build the site with `jekyll build` or `jekyll serve`.

Notes
- The copy feature uses the Clipboard API with a fallback to document.execCommand.
- Colors are defined in `assets/css/style.css` as CSS variables `--bg` and `--fg`.
# jekyll_theme