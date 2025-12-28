#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');
if (!fs.existsSync(swPath)) {
  console.error('sw.js not found at', swPath);
  process.exit(1);
}

const content = fs.readFileSync(swPath, 'utf8');

// Generate timestamp in format YYYYMMDDHHMM
function genTimestamp() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    z(d.getMonth() + 1) +
    z(d.getDate()) +
    z(d.getHours()) +
    z(d.getMinutes())
  );
}

const ts = genTimestamp();

const newCacheName = `v${ts}`;

const updated = content.replace(/const\s+CACHE_NAME\s*=\s*['"][^'"]+['"];?/, `const CACHE_NAME = '${newCacheName}';`);

if (updated === content) {
  console.error('Failed to update CACHE_NAME — pattern not found');
  process.exit(0);
}

fs.writeFileSync(swPath, updated, 'utf8');
console.log('Updated CACHE_NAME to', newCacheName);

// Stage the file so the commit will include the change when run in a pre-commit hook
try {
  const { spawnSync } = require('child_process');
  const res = spawnSync('git', ['add', swPath], { stdio: 'inherit' });
  if (res.status !== 0) {
    // Non-fatal — still exit successfully so commit can continue
    console.warn('git add returned non-zero status:', res.status);
  }
} catch (e) {
  console.warn('Could not run git add:', e.message);
}
