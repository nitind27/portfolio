#!/usr/bin/env bash
# Run on Hostinger VPS (Web Terminal) from the site99 project folder.
set -euo pipefail

echo "==> Pulling latest code..."
git pull origin main

echo "==> Clean build..."
rm -rf .next
npm run build

echo "==> Restarting app..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart all || pm2 start npm --name site99 -- start
else
  echo "pm2 not found — restart your Node process manually (systemctl / screen / nohup)."
fi

echo ""
echo "==> Verification checks (run after restart):"
echo "  OK:  curl -s https://site99.online/google26a11afd3cf7e199.html"
echo "  404: curl -s -o /dev/null -w '%{http_code}' https://site99.online/googlea1b2c3d4e5f6.html"
echo ""
echo "When fake file returns 404, click VERIFY in Google Search Console."
