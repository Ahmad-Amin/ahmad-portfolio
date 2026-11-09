#!/usr/bin/env bash
# Replaces the Vercel cron in vercel.json: calls the daily chatbot digest route
# on the local container with the same bearer secret. Install it in crontab
# (see DEPLOY.md). Reads CRON_SECRET from the site's .env.
set -euo pipefail
ENV_FILE="${ENV_FILE:-/opt/portfolio/.env}"
SECRET="$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"')"
curl -fsS --max-time 60 -H "Authorization: Bearer ${SECRET}" \
  "http://127.0.0.1:5000/api/cron/chat-digest"
