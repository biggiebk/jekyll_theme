// Simple vendor script to download Prism core and line-numbers plugin
// Usage: node scripts/vendor-prism.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
    out: path.join(__dirname, '..', 'assets', 'js', 'prism.min.js')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',
    out: path.join(__dirname, '..', 'assets', 'js', 'prism-line-numbers.min.js')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js',
    out: path.join(__dirname, '..', 'assets', 'js', 'prism-toolbar.min.js')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css',
    out: path.join(__dirname, '..', 'assets', 'css', 'prism-toolbar.css')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
    out: path.join(__dirname, '..', 'assets', 'js', 'prism-copy-to-clipboard.min.js')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css',
    out: path.join(__dirname, '..', 'assets', 'css', 'prism-line-numbers.css')
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
    out: path.join(__dirname, '..', 'assets', 'css', 'prism-core.css')
  }
];

function download(url, out) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(out);
    fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(out);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Failed to download ' + url + ' status ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlinkSync(out, { force: true });
      reject(err);
    });
  });
}

(async () => {
  for (const f of files) {
    try {
      console.log('Downloading', f.url);
      await download(f.url, f.out);
      console.log('Saved to', f.out);
    } catch (e) {
      console.error('Failed', f.url, e.message);
    }
  }
  console.log('Done. You may want to update assets/css/prism.css to tune colors or merge prism-core.css.');
})();
