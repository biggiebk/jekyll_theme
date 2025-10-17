// Add a watermark button to every pre>code block that copies the code when clicked.
document.addEventListener('DOMContentLoaded', function () {
  // Ensure there is an announcer element for screen reader feedback
  let announcer = document.getElementById('copy-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'copy-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }

  const blocks = Array.from(document.querySelectorAll('pre > code'));
  blocks.forEach(code => {
    const pre = code.parentElement;
    // avoid adding twice
    if (pre.querySelector('.code-watermark')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-watermark';
    btn.innerText = 'Copy';
    btn.title = 'Copy code to clipboard';
    btn.setAttribute('aria-label', 'Copy code');

    const setCopied = () => {
      btn.innerText = 'Copied';
      btn.classList.add('code-copied');
      announcer.textContent = 'Code copied to clipboard';
      setTimeout(() => { btn.innerText = 'Copy'; btn.classList.remove('code-copied'); announcer.textContent = ''; }, 1500);
    };

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = code.innerText;
      // Try Clipboard API first
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          setCopied();
          return;
        }
      } catch (err) {
        // fall through to fallback
      }

      // Fallback approach
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        // prevent scrolling to bottom in some browsers
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (ok) setCopied(); else {
          // If copy failed, still provide visual feedback but announce failure.
          announcer.textContent = 'Copy failed';
          setTimeout(()=>{ announcer.textContent = ''; }, 1500);
        }
      } catch (err) {
        announcer.textContent = 'Copy failed';
        setTimeout(()=>{ announcer.textContent = ''; }, 1500);
      }
    });

    // Allow keyboard activation: native button handles Enter/Space.
    pre.style.position = pre.style.position || 'relative';
    pre.appendChild(btn);
  });
});
