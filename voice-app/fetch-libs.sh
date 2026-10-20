#!/bin/sh
# Downloads the speech-recognition library into www/ at build time (kept out of git).
set -e
cd "$(dirname "$0")"
npm pack @huggingface/transformers@4.3.1 --silent >/dev/null
tar -xzf huggingface-transformers-4.3.1.tgz package/dist/transformers.min.js
mv package/dist/transformers.min.js www/transformers.min.js
rm -rf package huggingface-transformers-4.3.1.tgz
