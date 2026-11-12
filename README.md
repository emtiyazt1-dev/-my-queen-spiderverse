# MY QUEEN — The Spider-Man Love Universe

A mobile-first romantic website with a cinematic Spider-Man-inspired red/blue theme, wishes, letters, private photo gallery, timeline, surprise room, dreams, settings, and backup export.

## What is now cloud-connected

- Supabase email/password sign-in (no local demo-password fallback).
- All app content syncs to the authenticated owner's `app_state` row set.
- Row Level Security limits each account to its own data.
- Gallery images upload to the private `queen-private` Storage bucket and are viewed using short-lived signed URLs.
- Deleting a gallery photo also attempts to delete its private Storage object.

## One-time setup

1. Create a Supabase project.
2. In **Authentication → Users**, create the owner account and confirm its email. Use this email and password on the website. In Authentication settings, turn off public sign-ups if the project is only for this one owner.
3. In **SQL Editor**, run the complete `supabase/schema.sql` script from this project.
4. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`: Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key only. Never use a service-role or secret key in a browser app.
   - `VITE_OWNER_EMAIL`: the owner user's email address.
5. Install and build:

```bash
npm install
npm run build
```

6. Deploy the project to Vercel. Add the same three environment variables in **Project → Settings → Environment Variables**, for Production, Preview, and Development as needed. Redeploy after changing environment variables.
7. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed Vercel URL. Add that URL to Redirect URLs.

## Android / Termux commands

After downloading and extracting the ZIP into `~/storage/downloads/my-queen-spiderverse`:

```bash
pkg update -y
pkg install nodejs-lts unzip -y
cd ~/storage/downloads/my-queen-spiderverse
npm install
npm run build
```

For deployment, use the Vercel integration if connected, or install the Vercel CLI and run `vercel --prod` after signing in:

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Privacy notes

The website's public URL can be opened by anyone, but the app content is not returned until Supabase authentication succeeds. Database rows are protected by RLS, and the photo bucket is private. Use a strong unique owner password, keep email confirmation enabled, and do not share your login. The browser-visible Supabase publishable/anon key is expected; the service-role key must never be placed in Vite environment variables.

The app currently uses one owner account. If you want your wife to have a separate login, that requires a deliberate sharing model and additional authorization policies; do not simply create a second account and assume it can see the owner's data.

## Build and preview

```bash
npm run dev
npm run build
npm run preview
```

The production build output is `dist/`.
