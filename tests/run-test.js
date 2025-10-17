const { spawn } = require('child_process');
const path = require('path');

const serveBin = path.join(__dirname, '..', 'node_modules', '.bin', 'serve');
const testsBin = path.join(__dirname, 'copy.spec.js');

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(serveBin, ['-p', '5000', '-s', path.join(__dirname, '..')], { stdio: ['ignore', 'inherit', 'inherit'] });
    proc.on('error', reject);
    // give server a moment to start
    setTimeout(() => resolve(proc), 750);
  });
}

(async ()=>{
  let server;
  try {
    server = await startServer();
    console.log('Server started on http://127.0.0.1:5000');
    // Run the test file with node so Playwright can execute
    const testProc = spawn(process.execPath, [testsBin], { stdio: 'inherit' });
    testProc.on('close', (code) => {
      if (server) server.kill();
      process.exit(code);
    });
  } catch (err) {
    if (server) server.kill();
    console.error(err);
    process.exit(1);
  }
})();
