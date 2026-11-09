# Deploying to a VPS (Docker + GitHub Actions)

Flow: you push to `main` → GitHub Actions runs lint and type-check → it SSHes into the
VPS → the VPS pulls the commit and runs `docker compose up -d --build` → the new
container replaces the old one. nginx sits in front and serves the domain over HTTPS,
proxying to the container on port 5000.

These steps assume Ubuntu 22.04/24.04 and a domain you control. Replace `example.com`.

## 1. Prepare the VPS

```bash
# as a sudo user (not root), on the VPS
sudo apt update && sudo apt install -y git nginx ufw curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # log out and back in afterwards

# firewall: SSH + web only. Port 5000 is NOT opened; nginx reaches it on localhost.
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

`next build` needs roughly 1.5-2 GB of memory. On a 1-2 GB VPS add swap first:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Let the VPS pull from GitHub (read-only deploy key)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "vps-deploy"
cat ~/.ssh/github_deploy.pub
```

Add the printed public key in GitHub → repo → Settings → Deploy keys (leave "Allow write
access" off). Then:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
sudo mkdir -p /opt/portfolio && sudo chown $USER /opt/portfolio
git clone git@github.com:Ahmad-Amin/ahmad-portfolio.git /opt/portfolio
```

## 3. Create the production `.env`

```bash
cd /opt/portfolio && cp .env.example .env && nano .env
```

Fill in the same values you have on Vercel, plus:

```
NEXT_PUBLIC_SITE_URL=https://example.com
```

`NEXT_PUBLIC_*` values are baked in at build time, so change them and rebuild. `.env` is
git-ignored and is used twice: as a build secret (never stored in an image layer) and as
the container's runtime environment. Set `chmod 600 .env`.

## 4. First build and smoke test

```bash
cd /opt/portfolio
docker compose up -d --build
docker compose ps                    # STATUS should become "healthy"
curl -I http://127.0.0.1:5000/       # 200
docker compose logs -f web           # Ctrl+C to leave
```

## 5. nginx and HTTPS

`/etc/nginx/sites-available/portfolio`:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # Overwrite, don't append: the chat and subscribe rate limits trust the first
        # X-Forwarded-For entry, so a client must not be able to supply its own.
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Chat replies are streamed, so don't buffer them.
        proxy_buffering off;
        proxy_read_timeout 90s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

The chat route's same-origin check compares `Origin` with the `Host` header, which is why
`proxy_set_header Host $host` matters. If you put Cloudflare in front, the rate limiter
needs the real client IP from `CF-Connecting-IP` instead (tell me and I'll adjust).

## 6. Replace the Vercel cron (daily chatbot digest)

`vercel.json`'s cron doesn't run on a VPS. Use the host's crontab (18:00 server time; the
VPS is usually UTC, same as Vercel):

```bash
crontab -e
# add:
0 18 * * * /opt/portfolio/scripts/chat-digest-cron.sh >> /var/log/chat-digest.log 2>&1
```

You may need `sudo touch /var/log/chat-digest.log && sudo chown $USER /var/log/chat-digest.log`.
Test once by hand: `/opt/portfolio/scripts/chat-digest-cron.sh`.

## 7. GitHub Actions secrets

On your laptop or the VPS, make a key pair just for the workflow:

```bash
ssh-keygen -t ed25519 -f gha_deploy -N "" -C "github-actions"
ssh-copy-id -i gha_deploy.pub USER@VPS_IP     # or append the .pub to ~/.ssh/authorized_keys
ssh-keyscan -p 22 VPS_IP                      # copy the output for VPS_KNOWN_HOSTS
```

GitHub → repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | the SSH user (the one in the `docker` group) |
| `VPS_PORT` | SSH port (`22` unless you changed it) |
| `VPS_SSH_KEY` | full contents of the private file `gha_deploy` |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan` above |

Delete the local `gha_deploy` files afterwards. The workflow is
`.github/workflows/deploy.yml`; push to `main` (or run it from the Actions tab) to deploy.

## 8. Moving the domain from Vercel

1. Deploy and test on the VPS first (step 4), e.g. with `curl --resolve example.com:443:VPS_IP https://example.com`
   after certbot, or just with the VPS IP on port 80.
2. Lower the DNS TTL a day before. Then point the `A` record (and `www`) to the VPS IP.
3. After it works, remove the domain from the Vercel project, and disconnect or pause the
   Vercel deployment so pushes don't build twice.
4. Things that change: Vercel Analytics stops (the component is now skipped off Vercel; GA
   still works), there's no built-in CDN, and Upstash Redis, Resend and the APIs keep
   working because they're external services.

## Everyday commands

```bash
cd /opt/portfolio
docker compose logs -f web         # live logs
docker compose restart web         # restart only
git log --oneline -5               # what's deployed
# roll back: git reset --hard <good-commit> && docker compose up -d --build
```

Changing `.env` needs `docker compose up -d --build` (not just `restart`) if you touched a
`NEXT_PUBLIC_*` value or a key used while building pages; runtime-only keys just need
`docker compose up -d`.
