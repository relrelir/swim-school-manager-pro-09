#!/usr/bin/env bash
# setup-secrets.sh — Sets all GitHub Actions secrets for the CD workflow
#
# Prerequisites:
#   1. gh auth login   (run once in your terminal — opens browser)
#   2. bash scripts/setup-secrets.sh

set -e

REPO="relrelir/swim-school-manager-pro-09"
SA_KEY_PATH="/tmp/firebase-sa-key.json"
ENV_FILE="$(dirname "$0")/../.env"
GH_PATH="/c/Program Files/GitHub CLI/gh"

echo "🔐 Setting GitHub Actions secrets for $REPO..."
echo ""

# ── 1. Firebase Service Account key ──────────────────────────────────────────
if [ ! -f "$SA_KEY_PATH" ]; then
  echo "❌  Service account key not found at $SA_KEY_PATH"
  echo "    Run: gcloud iam service-accounts keys create /tmp/firebase-sa-key.json \\"
  echo "           --iam-account=github-actions-deploy@swim-academy-2026.iam.gserviceaccount.com"
  exit 1
fi

"$GH_PATH" secret set FIREBASE_SERVICE_ACCOUNT \
  --repo "$REPO" \
  < "$SA_KEY_PATH"
echo "  ✓  FIREBASE_SERVICE_ACCOUNT"

# ── 2. VITE_* secrets from .env ───────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  .env file not found at $ENV_FILE"
  exit 1
fi

VITE_KEYS=(
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID
)

for key in "${VITE_KEYS[@]}"; do
  value=$(grep "^${key}=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
  if [ -z "$value" ]; then
    echo "  ⚠️  $key not found in .env — skipping"
    continue
  fi
  printf '%s' "$value" | "$GH_PATH" secret set "$key" --repo "$REPO"
  echo "  ✓  $key"
done

# ── 3. Cleanup key from temp ──────────────────────────────────────────────────
rm -f "$SA_KEY_PATH"
echo ""
echo "  🗑  Removed temp key from /tmp"
echo ""
echo "✅  All secrets set! Push to main to trigger deploy:"
echo "    git push origin main"
echo "    → https://github.com/$REPO/actions"
