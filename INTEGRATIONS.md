# Integrations — setup and go-live

Slack, email, Google Sheets and Notion send Outlier and Signal results out of the app.
Connections belong to the Creos Labs account, so connecting in one product shows in the other.
None of them read from or connect to anyone's social accounts.

## 1. Database

Run `supabase/migrations/0020_integrations.sql`. Both tables have RLS on and **no policies** on purpose —
only server code using the service-role key can read them, so tokens can never reach the browser.

## 2. Environment variables

| Variable | Used for |
| --- | --- |
| `INTEGRATIONS_ENCRYPTION_KEY` | AES-256-GCM key for stored tokens. `openssl rand -base64 32`. Losing it means every connection must be redone. |
| `NEXT_PUBLIC_SITE_URL` | Public root URL, e.g. `https://www.creos-labs.com`. Builds OAuth redirect URIs and links in messages. |
| `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET` | Slack app. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client (Sheets). |
| `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET` | Notion public integration. |
| `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET` | Transactional email (`EMAIL_FROM` like `Creos Labs <alerts@mail.creos-labs.com>`). |
| `CRON_SECRET` | Already used by the Outlier cron; the two new crons use it too. |
| `NEXT_PUBLIC_INTEGRATIONS_LIVE` | Set to `1` **last** to show the homepage band and product-page lines. |

A provider with missing variables shows "Unavailable" on its card instead of a broken connect flow.

## 3. Provider setup

All redirect URIs live on the root domain, whichever product the user starts from.

- **Slack** — create an app, enable *Public Distribution*. Scopes: `incoming-webhook`, `chat:write`.
  Redirect URL: `{SITE}/api/integrations/slack/callback`.
  Event Subscriptions → Request URL `{SITE}/api/integrations/slack/events`, subscribe to `app_uninstalled` and `tokens_revoked`.
- **Google** — OAuth client (web). Scope `https://www.googleapis.com/auth/drive.file` only. Redirect URI:
  `{SITE}/api/integrations/sheets/callback`. (`drive.file` is a sensitive scope: expect Google's verification review before public launch.)
- **Notion** — public integration with *Read content*, *Update content*, *Insert content*. Redirect URI:
  `{SITE}/api/integrations/notion/callback`.
- **Resend** — verify a sending subdomain (SPF, DKIM, DMARC). Add a webhook to `{SITE}/api/integrations/email/webhook`
  for `email.bounced` and `email.complained`.

## 4. Logos

> **Placeholder artwork in place.** `slack.svg`, `sheets.svg` and `notion.svg` currently come from SVG Repo (third-party uploads), and `sheets.svg` is the Google Drive icon, not Sheets. Replace all three with the official files from each brand's own asset page before launch.

Use each brand's official files only, and check their guidelines (Slack, Google, Notion all publish them).
Drop them in `public/brand/integrations/` as `slack.svg`, `sheets.svg`, `notion.svg`. Until a file exists the UI shows the service name
instead of a logo — nothing is redrawn. Email uses a generic envelope. Phrase as "works with", never as a partnership.
Don't show Teams or "coming soon" logos.

## 5. Crons (vercel.json)

- `/api/cron/integrations` daily at 14:30 UTC — sends anything still queued, retries failures, releases digests. Daily because Hobby plans only allow daily crons; instant deliveries are sent right after the request that queued them (scorecards, manual and daily Outlier pulls). On Pro, change it to `* * * * *` and retries run within minutes. Hobby cron timing can drift by up to an hour.
- `/api/cron/integrations-weekly` Mondays 14:00 UTC — builds the weekly outlier digest.

## 6. Before the website copy goes live

Go through the acceptance list in the brief, then update the privacy policy to list the integrations and the transactional email
provider as subprocessors, then set `NEXT_PUBLIC_INTEGRATIONS_LIVE=1`.
