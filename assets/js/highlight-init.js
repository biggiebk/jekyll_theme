document.addEventListener('DOMContentLoaded', async (event) => {
  // First initialize highlight.js synchronously so the DOM inside code blocks
  // reflects final rendered lines (some themes may inject spans etc.)
  if (window.hljs) {
    hljs.highlightAll();
  }

  // Process code blocks after a short delay to ensure highlight.js has finished
  // manipulating the DOM (some browsers/renderers are async)
  await new Promise((r) => setTimeout(r, 20));

  const pres = Array.from(document.querySelectorAll('pre'));
  pres.forEach((pre) => {
    // If the pre is already wrapped, use that wrapper
    let wrapper = pre.closest('.code-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }

    // If we already added line numbers, skip
    if (wrapper.querySelector('ol.line-numbers')) return;

    const code = pre.querySelector('code');
    if (!code) return;

    // Use the rendered text to count lines (after highlight.js)
    const rawText = code.innerText || code.textContent || '';
    const lines = rawText.split('\n');

    const ol = document.createElement('ol');
    ol.className = 'line-numbers';
    lines.forEach((_, idx) => {
      const li = document.createElement('li');
      li.textContent = String(idx + 1);
      li.setAttribute('aria-hidden', 'true');
      ol.appendChild(li);
    });
    wrapper.appendChild(ol);

    // Create copy button (add aria and title for clarity)
    let btn = wrapper.querySelector('.copy-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.innerText = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.title = 'Copy code';
      wrapper.appendChild(btn);
    }

    btn.addEventListener('click', async () => {
      const text = code.innerText;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Try a textarea fallback first
          let copied = false;
          try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            copied = document.execCommand('copy');
            document.body.removeChild(textarea);
          } catch (e) {
            copied = false;
          }
          // If textarea fallback didn't work, try Range selection copy
          if (!copied) {
            try {
              const range = document.createRange();
              range.selectNodeContents(code);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
              copied = document.execCommand('copy');
              sel.removeAllRanges();
            } catch (e) {
              copied = false;
            }
          }
          if (!copied) throw new Error('copy-fallback-failed');
        }
        btn.classList.add('copied');
        const old = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerText = old;
        }, 1400);
      } catch (err) {
        // Provide clearer console info for debugging
        console.error('Copy failed for code block:', err, { textSnippet: text.slice(0, 120) });
        btn.innerText = 'Failed';
        setTimeout(() => {
          btn.innerText = 'Copy';
        }, 1400);
      }
    });
  });
  console.log('Processed', pres.length, 'pre blocks for line numbers and copy buttons');
});

// --- Table of Contents generation and scroll spy ---
document.addEventListener('DOMContentLoaded', () => {
  const tocContainer = document.getElementById('toc-nav');
  if (!tocContainer) return;

  // Collect headings h1-h3 inside the main content
  const contentRoot = document.querySelector('.site-main');
  if (!contentRoot) return;

  const headings = Array.from(contentRoot.querySelectorAll('h1, h2, h3'));
  if (!headings.length) return;

  // Utility to create slug/id
  const slugify = (text) => text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const ul = document.createElement('ul');
  let lastLiByLevel = {1: null, 2: null};

  headings.forEach((h) => {
    const level = Number(h.tagName[1]);
    let id = h.id;
    if (!id) {
      id = slugify(h.innerText || h.textContent || 'heading');
      // Ensure unique
      let uniq = id;
      let i = 1;
      while (document.getElementById(uniq)) { uniq = id + '-' + i; i++; }
      id = uniq;
      h.id = id;
    }

    const li = document.createElement('li');
    li.className = `toc-level-${level}`;
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.innerText = h.innerText || h.textContent;
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      document.getElementById(id).scrollIntoView({behavior: 'smooth', block: 'start'});
      history.replaceState(null, '', `#${id}`);
    });
    li.appendChild(a);

    if (level === 1) {
      ul.appendChild(li);
      lastLiByLevel[1] = li;
      lastLiByLevel[2] = null;
    } else if (level === 2) {
      // append as child of last level 1
      if (lastLiByLevel[1]) {
        let sub = lastLiByLevel[1].querySelector('ul');
        if (!sub) { sub = document.createElement('ul'); lastLiByLevel[1].appendChild(sub); }
        sub.appendChild(li);
        lastLiByLevel[2] = li;
      } else {
        ul.appendChild(li);
        lastLiByLevel[2] = li;
      }
    } else if (level === 3) {
      // append as child of last level 2; if none, append under last level 1
      if (lastLiByLevel[2]) {
        let sub2 = lastLiByLevel[2].querySelector('ul');
        if (!sub2) { sub2 = document.createElement('ul'); lastLiByLevel[2].appendChild(sub2); }
        sub2.appendChild(li);
      } else if (lastLiByLevel[1]) {
        let sub = lastLiByLevel[1].querySelector('ul');
        if (!sub) { sub = document.createElement('ul'); lastLiByLevel[1].appendChild(sub); }
        sub.appendChild(li);
      } else {
        ul.appendChild(li);
      }
    }
  });

  tocContainer.appendChild(ul);

  // Scroll spy: highlight active section in TOC
  const tocLinks = Array.from(tocContainer.querySelectorAll('a'));
  const headingPositions = headings.map(h => ({ id: h.id, el: h }));

  const onScroll = () => {
    const offset = 120; // consider header height
    const scrollPos = window.scrollY + offset;
    let current = headingPositions[0];
    for (const item of headingPositions) {
      if (item.el.offsetTop <= scrollPos) current = item;
    }
    tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // run once to set initial state
  setTimeout(onScroll, 300);

});



