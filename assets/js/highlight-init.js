document.addEventListener('DOMContentLoaded', (event) => {
  if (window.hljs) {
    hljs.highlightAll();
  }

  // Attach copy buttons to code blocks
  const pres = Array.from(document.querySelectorAll('pre'));
  pres.forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    // Avoid adding multiple buttons
    if (pre.classList.contains('code-wrapper')) return;

    // Wrap pre in a container so we can position the button
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.innerText = 'Copy';
    wrapper.appendChild(btn);

    btn.addEventListener('click', async () => {
      const text = code.innerText;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        btn.classList.add('copied');
        const old = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerText = old;
        }, 1400);
      } catch (err) {
        console.error('Copy failed', err);
        btn.innerText = 'Failed';
        setTimeout(() => {
          btn.innerText = 'Copy';
        }, 1400);
      }
    });
  });
});

