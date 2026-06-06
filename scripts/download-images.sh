#!/bin/bash
# Reads C:/tmp/images.json (array of {url, localPath, productSlug, sku}) and
# downloads every image into the local path, creating directories as needed.
# Parallelised with xargs.

set -uo pipefail

MANIFEST="C:/tmp/images.json"

# First pass: ensure all destination directories exist.
node -e "
const fs=require('fs');
const path=require('path');
const m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
const dirs = new Set();
for (const e of m) dirs.add(path.dirname(e.localPath));
for (const d of dirs) fs.mkdirSync(d, {recursive: true});
console.error('Created '+dirs.size+' directories');
"

# Second pass: emit url<TAB>localPath lines to xargs.
node -e "
const fs=require('fs');
const m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
for (const e of m) {
  // Skip if file already exists (resumable).
  if (fs.existsSync(e.localPath)) continue;
  process.stdout.write(e.url+'\t'+e.localPath+'\n');
}
" | xargs -I {} -P 24 -d '\n' bash -c '
  line="$1"
  url="${line%%	*}"
  dst="${line#*	}"
  curl -sL --max-time 30 -o "$dst" "$url" || echo "FAIL $url" >&2
' _ {}

# Report.
node -e "
const fs=require('fs');
const m = JSON.parse(fs.readFileSync('$MANIFEST','utf8'));
let ok=0, miss=0, total=m.length;
for (const e of m) { if (fs.existsSync(e.localPath) && fs.statSync(e.localPath).size > 100) ok++; else miss++; }
console.log('Downloaded: '+ok+' / '+total+' (missing: '+miss+')');
"
