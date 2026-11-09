# Deployment: Docker on a VPS, deployed by GitHub Actions

This is how techwithswag.com runs in production, and how to rebuild the setup from
scratch. The site moved from Vercel to a Hostinger KVM 2 VPS (Ubuntu 22.04, 2 vCPU,
8 GB RAM) that also hosts other, unrelated projects behind the same nginx.

## How it fits together

```
push to main
   -> GitHub Actions: lint + route types + tsc          (.github/workflows/deploy.yml)
   -> SSH as "portfolio" to the VPS
   -> git pull in /opt/portfolio, docker compose up -d --build
   -> container "portfolio" listens on 127.0.0.1:5000

visitor -> Cloudflare DNS (DNS only) -> nginx :443 -> 127.0.0.1:5000
```

| Piece | Where / what |
|---|---|
| Linux users | `ahmad` (sudo, admin tasks) and `portfolio` (no sudo, owns this site, member of `docker`) |
| Code | `/opt/portfolio`, a clone of the GitHub repo, read-only deploy key |
| Config | `/opt/portfolio/.env` (git-ignored, `chmod 600`) |
| Container | name `portfolio`, image `portfolio:latest`, compose service `web` |
| Port | `127.0.0.1:5000` -> container `3000`; not open in the firewall |
| nginx | one file, `/etc/nginx/sites-available/techwithswag.conf` (symlinked into `sites-enabled`) |
| TLS | one Let's Encrypt wildcard cert `techwithswag-wildcard` (`techwithswag.com` + `*.techwithswag.com`), issued through Cloudflare DNS, auto-renewing |
| DNS | Cloudflare (registrar stays at GoDaddy; its nameservers point to Cloudflare) |
| Daily digest | crontab of the `portfolio` user -> `scripts/chat-digest-cron.sh` (replaces the Vercel cron) |

Not in git, so back these up or write them down: `.env`, the nginx file, the certificate
(re-issuable), the crontab, the Cloudflare API token, and the GitHub secrets.

## What the repo contains

- `next.config.ts`: `output: "standalone"` for a small runtime image.
- `Dockerfile`: three stages (deps, build, runtime). The site's `.env` is mounted as a
  **build secret** at `.env.production.local`, so keys never land in an image layer and
  `NEXT_PUBLIC_*` values get inlined at build time. `content/` is copied into the runtime
  image explicitly because the blog reads it from disk at runtime.
- `docker-compose.yml`: one service, `restart: unless-stopped`, `.env` as runtime env,
  healthcheck, port bound to localhost only.
- `.github/workflows/deploy.yml`: the pipeline (see below).
- `scripts/chat-digest-cron.sh`: calls the digest route with the bearer secret.
- `src/app/layout.tsx`: Vercel Analytics only renders when running on Vercel. Google
  Analytics is unaffected.

## One-time setup (in the order it was done)

Commands that need `sudo` run as `ahmad`. Everything for the site itself runs as
`portfolio` (`sudo -iu portfolio` from `ahmad`).

### 1. Dedicated user

```bash
sudo adduser --disabled-password --gecos "" portfolio
sudo usermod -aG docker portfolio
sudo mkdir -p /opt/portfolio && sudo chown portfolio:portfolio /opt/portfolio
```

`docker` group membership is effectively root on the host, but `portfolio` has no sudo,
no password and none of the other projects' keys or files.

### 2. Read-only deploy key and clone (as `portfolio`)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "vps-deploy"
cat ~/.ssh/github_deploy.pub     # add in GitHub: repo > Settings > Deploy keys (write access OFF)
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh-keyscan github.com >> ~/.ssh/known_hosts
git clone git@github.com:Ahmad-Amin/ahmad-portfolio.git /opt/portfolio
```

### 3. Production `.env`

```bash
cd /opt/portfolio && cp .env.example .env && chmod 600 .env && nano .env
```

Copy the values from the old Vercel project. Format is `NAME=value`: no quotes, no spaces
around `=`. Set `NEXT_PUBLIC_SITE_URL` to the final public URL (no trailing slash); it is
baked into the build. Add a fresh `CRON_SECRET` (`openssl rand -hex 24`). Don't add
`VERCEL_URL`. The Vercel-injected `KV_URL`, `REDIS_URL` and `KV_REST_API_READ_ONLY_TOKEN`
are unused and can be dropped.

Check the names without printing values: `grep -E '^[A-Z_]+=' .env | cut -d= -f1 | sort`

### 4. First build

```bash
cd /opt/portfolio
docker compose up -d --build            # ~2.5 minutes the first time
docker compose ps                       # wait for "healthy"
curl -sI http://127.0.0.1:5000/ | head -3
```

### 5. Daily digest cron (as `portfolio`)

```bash
crontab -e
# add:
0 18 * * * /opt/portfolio/scripts/chat-digest-cron.sh >> $HOME/chat-digest.log 2>&1
```

Test once: `/opt/portfolio/scripts/chat-digest-cron.sh`. A quiet day answers
`{"sent":false,"reason":"no conversations in this window"}`, which is correct.

### 6. GitHub Actions login

The workflow needs its own SSH key. Generate it on the VPS (as `portfolio`) so the private
key never touches a laptop:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gha_deploy -N "" -C "github-actions"
echo "no-port-forwarding,no-agent-forwarding,no-X11-forwarding $(cat ~/.ssh/gha_deploy.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/gha_deploy                       # private key -> GitHub secret VPS_SSH_KEY
ssh-keyscan -t ed25519 VPS_IP               # -> GitHub secret VPS_KNOWN_HOSTS
shred -u ~/.ssh/gha_deploy                  # after the secrets are saved
```

GitHub > repo > Settings > Secrets and variables > Actions:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | `portfolio` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | the full private key, including the BEGIN and END lines |
| `VPS_KNOWN_HOSTS` | the `ssh-keyscan` line |

The workflow fails fast with `Missing GitHub secret ...` if any of the first four is empty.

### 7. DNS on Cloudflare

The domain is registered at GoDaddy, but its nameservers point to Cloudflare so the
wildcard certificate can be issued and renewed automatically (GoDaddy limits its DNS API
to accounts with many domains).

Moving DNS: add the site in Cloudflare, compare its imported records against the old DNS
page one by one (the importer skipped two `CNAME`s once, `send` and `rsend`, which are
email-related), turn DNSSEC off at the registrar first if it was on, then change the
nameservers at the registrar.

Records now:

| Type | Name | Target | Proxy |
|---|---|---|---|
| `A` | `@` | VPS IP | DNS only |
| `A` | `*` | VPS IP | DNS only |
| `CNAME` | `www` | `techwithswag.com` | DNS only |
| `MX`, `TXT`, `CNAME` | email records (Resend, DMARC, `send`, `rsend`, Google verification) | as imported | DNS only |

Exact records always win over the `*` wildcard, so the email `CNAME`s are unaffected.

### 8. Wildcard certificate

Create a Cloudflare API token: My Profile > API Tokens > **Edit zone DNS** template, zone
resource `techwithswag.com` only. Optionally restrict it by IP to the VPS. If you do, add
**both** the VPS IPv4 and IPv6 addresses: certbot may connect over IPv6, and an IPv4-only
filter gives `9109 Cannot use the access token from location: <ipv6>`.

```bash
sudo apt install -y python3-certbot-dns-cloudflare
sudo mkdir -p /etc/letsencrypt/secrets
sudo install -m 600 /dev/null /etc/letsencrypt/secrets/cloudflare.ini
sudo nano /etc/letsencrypt/secrets/cloudflare.ini     # one line: dns_cloudflare_api_token = TOKEN
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/secrets/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 30 \
  --cert-name techwithswag-wildcard \
  -d techwithswag.com -d '*.techwithswag.com' \
  --deploy-hook "systemctl reload nginx" \
  -m YOUR_EMAIL --agree-tos --no-eff-email
sudo certbot renew --dry-run
```

Use `certonly`, never `certbot --nginx`: this VPS hosts other sites, and `--nginx` edits
shared config. Wait until Cloudflare shows the zone as Active before requesting the
certificate, because Let's Encrypt checks the domain's current nameservers. Renewal runs
on certbot's own timer and reloads nginx.

### 9. nginx

This VPS runs nginx 1.18, so HTTP/2 goes on the `listen` line (`listen 443 ssl http2;`;
the standalone `http2 on;` directive doesn't exist yet and breaks the config). One file
covers everything under the domain. Exact `server_name` matches beat the wildcard, so a
future app on a subdomain needs no new nginx file.

`/etc/nginx/sites-available/techwithswag.conf`:

```nginx
# One file for everything under techwithswag.com.

server {
    listen 80;
    listen [::]:80;
    server_name techwithswag.com *.techwithswag.com;
    return 301 https://$host$request_uri;
}

# The portfolio.
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name techwithswag.com;

    ssl_certificate     /etc/letsencrypt/live/techwithswag-wildcard/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techwithswag-wildcard/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # Overwrite, not append: the chat and subscribe rate limits trust the
        # first X-Forwarded-For entry.
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;      # chat replies are streamed
        proxy_read_timeout 90s;
    }
}

# Every other subdomain: 404 until something serves it. To serve another app, add an
# exact-name server block above this one, or replace the return with a proxy_pass.
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name *.techwithswag.com;

    ssl_certificate     /etc/letsencrypt/live/techwithswag-wildcard/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techwithswag-wildcard/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 404;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.techwithswag.com;

    ssl_certificate     /etc/letsencrypt/live/techwithswag-wildcard/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techwithswag-wildcard/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 301 https://techwithswag.com$request_uri;
}
```

Enable it only after the test passes:

```bash
sudo nginx -t                                    # file + all other sites
sudo ln -s /etc/nginx/sites-available/techwithswag.conf /etc/nginx/sites-enabled/techwithswag.conf
sudo nginx -t && sudo systemctl reload nginx
```

Write the file with `sudo nano` and paste into it. Pasting a long heredoc into a terminal
can silently truncate it. If a broken file is already symlinked, remove the symlink
(`sudo rm /etc/nginx/sites-enabled/techwithswag.conf`) straight away: a reload or reboot
with a broken config would take down every site on the server.

Right after a reload, the first request can still hit an old worker and show the old
behaviour; repeat it.

## Everyday use

```bash
# Deploy: push to main. Watch it in GitHub > Actions.

# On the VPS, as portfolio
cd /opt/portfolio
docker compose ps                     # health
docker logs -f portfolio              # live logs (same: docker compose logs -f web)
docker compose restart web            # restart only
git log --oneline -3                  # what is deployed
```

- **Changed `.env`?** Runtime-only keys (Anthropic, Resend, Upstash, tokens):
  `docker compose up -d --force-recreate`. A changed `NEXT_PUBLIC_*` value or a key used
  while prerendering pages needs `docker compose up -d --build`.
- **Roll back:** `git reset --hard <good-commit> && docker compose up -d --build`, then
  fix `main` on GitHub so the next deploy doesn't undo it.
- **Disk:** the workflow prunes dangling images after each deploy; check with `df -h`.
- **Certificate:** `sudo certbot certificates`; renewal is automatic.

## Problems we hit, and the fixes

| Symptom | Cause | Fix |
|---|---|---|
| CI: `Cannot find name 'PageProps'` | Next generates these global types into `.next/`, which a fresh checkout lacks | `npx next typegen` before `tsc` (already in the workflow) |
| Deploy job: `ssh` prints usage text | `VPS_HOST` / `VPS_USER` secrets not set | Add the secrets; the workflow now names the missing one |
| certbot: `9109 Cannot use the access token from location: <ipv6>` | Token IP filter had only the IPv4 address | Add the VPS IPv6 address to the token's IP filter |
| nginx: `unknown directive "http2"` | nginx 1.18 | `listen 443 ssl http2;` |
| Chat: "I can't reply right now" | Container logs showed `401 invalid x-api-key`: the key copied into `.env` was wrong | New key, then `docker compose up -d --force-recreate` |
| Chat 503 / 403 / 429 | 503 = key unset; 403 = same-origin check (nginx must pass `Host`); 429 = rate limit | Check `docker logs portfolio` |
| `www` showed 200 right after a reload | Timing, old worker | Repeat the request |
| Docker build on a Mac: read-only filesystem | Mac disk was full | Free disk space; this does not affect the VPS |

## Cloudflare proxy (CDN): not enabled yet

All records are DNS only. Turning on the orange cloud adds a CDN and basic protection, but
nginx would then see Cloudflare's addresses instead of visitors', which would break the
per-visitor rate limits on `/api/chat` and `/api/subscribe`. Before enabling it, restore
the real client IP in nginx (the `real_ip` module with Cloudflare's published IP ranges, or
`CF-Connecting-IP`), set Cloudflare SSL/TLS to **Full (strict)** (the origin certificate is
publicly trusted), and test the chat widget. Don't proxy the email records.
