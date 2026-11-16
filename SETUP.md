# Setup

One-time setup for Supabase, Google sign-in and Vercel. Takes about 20 minutes. Do the steps in order: each needs a value from the one before.

## 1. Supabase project

1. Create a project at https://supabase.com/dashboard (free tier; region **Frankfurt (eu-central-1)**).
2. **SQL Editor → New query:** paste and run each file in `supabase/migrations/` in order (or `supabase link` + `supabase db push`).
3. **Project Settings → API:** note the **Project URL**, the **anon public** key and the **service_role** key. The service_role key is a secret: it goes only into Vercel (step 3), never into chat, email or the repo.

## 2. Google sign-in (owner and family)

1. https://console.cloud.google.com → create a project (e.g. "Ønskelisten").
2. **APIs & Services → OAuth consent screen:** External, app name "Kåres ønskeliste", your email as support and developer contact. Leave it in *Testing* and add every family member's Google address under **Audience → Test users** (up to 100): only test users can sign in. **Publish app** stays greyed out until the Branding page has a homepage and a privacy policy address; do that later if adding test users becomes a chore.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID:** type *Web application*.
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.
5. In Supabase: **Authentication → Sign In / Providers → Google:** enable, paste Client ID and secret, save.
6. In Supabase: **Authentication → URL Configuration:**
   - Site URL: `https://onskelisten.vercel.app`
   - Redirect URLs: add `https://onskelisten.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

## 3. Vercel project

1. https://vercel.com/new → import `dryakepin/onskelisten`. Project name `onskelisten` gives the address `onskelisten.vercel.app`.
2. **Settings → Environment Variables** (Production and Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `OWNER_EMAILS` | your Google address |
   | `APP_URL` | `https://onskelisten.vercel.app` |
   | `CRON_SECRET` | output of `openssl rand -base64 32` |

3. Redeploy. The weekly price refresh (Mondays 05:17 UTC) is set in `vercel.json`.

## 4. Import the current list

Claude exports the artifact's data to `data/artifact-export.json` (git-ignored) and runs:

```
npx tsx --env-file=.env.local scripts/import-artifact.ts data/artifact-export.json
```

The import is safe to repeat: wishes match on their old id, family members on email.

## 5. Check it works

1. Open `https://onskelisten.vercel.app/login` and sign in with Google. You land on the list.
2. Ask one family member to open the site, press "Log ind med Google" with the address you listed for them, reserve a wish, then release it.
3. **Send mail** tab: press "Åbn i Gmail" for yourself to see the message.
