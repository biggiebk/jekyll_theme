// Make Prism line numbers clickable and create permalinks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre.line-numbers').forEach((pre, preIndex) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const idBase = (code.id && code.id.length) ? code.id : ('code-' + preIndex);
    code.id = idBase;

    // Prism places .line-numbers-rows with span children containing numbers
    const rows = pre.querySelectorAll('.line-numbers-rows > span');
    rows.forEach((span, i) => {
      span.style.cursor = 'pointer';
      const line = i + 1;
      const lineId = `${idBase}-L${line}`;
      span.setAttribute('data-line-number', String(line));
      span.setAttribute('role', 'link');
      span.addEventListener('click', (e) => {
        const url = new URL(window.location.href);
        url.hash = lineId;
        history.replaceState(null, '', url);
        // Scroll to the code line
        const el = document.getElementById(lineId);
        if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
      });
      // Add a target anchor in the code for the line
      // Try to find or create a span wrapper for each line inside code
      const wrapper = document.createElement('span');
      wrapper.id = lineId;
      wrapper.style.display = 'block';
      // Extract existing text for that line if possible
      // This is a best-effort: replace the line by wrapping the text node.
      // If code already has line wrappers (e.g., from server-side), don't clobber.
      // Insert wrapper at appropriate position: append so anchor exists for scrolling.
      pre.querySelector('code').appendChild(wrapper);
    });
  });
});
