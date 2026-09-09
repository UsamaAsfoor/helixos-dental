# a. Development Agency — Dental Landing Page (Local Replica)

Exact static replica of [fluentaiconsulting.com/dental](https://www.fluentaiconsulting.com/dental) (`/for/dental-practices`).

## Run locally

```bash
chmod +x serve.sh
./serve.sh
```

Then open:

- http://127.0.0.1:8765/
- http://127.0.0.1:8765/b/ — A/B variation (buyer-psychology section order)
- http://127.0.0.1:8765/quiz/ — AI Business Optimization quiz funnel
- http://127.0.0.1:8765/dental/
- http://127.0.0.1:8765/for/dental-practices/
- http://127.0.0.1:8765/thank-you/
- http://127.0.0.1:8765/tour/
- http://127.0.0.1:8765/hog/ — HelixHog analytics (pageviews, sources, funnel, heatmaps)

HelixHog is a PostHog-style tracker that runs beside the Meta Pixel. It does not replace it. Events are stored in `helixhog/data/` (not committed). The tracker only sends from localhost unless you set `data-api-host` on `js/helixhog.js`.

Or without the script:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

## Local install

This repo lives at:

```bash
~/fluentaiconsulting-dental
```

Run it:

```bash
cd ~/fluentaiconsulting-dental
./serve.sh
```

Portable backup bundle:

```bash
~/fluentaiconsulting-dental.bundle
```

## Calendly MCP

This project includes `.cursor/mcp.json` with a local Calendly MCP server (via `npx calendly-mcp-server`).

The official hosted Calendly MCP (`https://mcp.calendly.com`) does not work in Cursor today because Calendly rejects Cursor's OAuth redirect URIs during registration.

Setup:

1. Get a Personal Access Token: [Calendly Integrations](https://calendly.com/integrations) → **API and webhooks** → **Get a token now**
2. Paste it into `.cursor/mcp.json` as `CALENDLY_API_KEY`
3. Reload Cursor (Command Palette → **Developer: Reload Window**)
