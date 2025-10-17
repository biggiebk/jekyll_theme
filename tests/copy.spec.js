const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://127.0.0.1:5000/');
    // Wait for code block and watermark
    await page.waitForSelector('pre > code');
    const btn = await page.waitForSelector('.code-watermark');

    // Listen for clipboard writes by exposing a function to page
    await page.exposeFunction('onClipboardWrite', (text) => {
      // no-op in node, we'll inspect clipboard after click via navigator.clipboard.readText
    });

    // Click the button
    await btn.click();

    // small wait for async copy
    await page.waitForTimeout(500);

    // Read clipboard in the page context
    const clipboardText = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {
        return null;
      }
    });

    if (!clipboardText || !clipboardText.includes('Hello, Jekyll Dark Theme!')) {
      console.error('Clipboard did not contain expected text:', clipboardText);
      process.exitCode = 2;
    } else {
      console.log('Clipboard contains expected text.');
    }

    // Check ARIA announcer text content
    const announcer = await page.$('#copy-announcer');
    const announcerText = announcer ? await page.evaluate(el => el.textContent, announcer) : '';
    if (!announcerText || !announcerText.includes('copied')) {
      console.error('Announcer did not announce copy:', announcerText);
      process.exitCode = 3;
    } else {
      console.log('Announcer announced: ', announcerText);
    }

  } finally {
    await browser.close();
  }
})();
