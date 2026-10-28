# Setting up coach accounts (Supabase)

Coach accounts and saved sessions use [Supabase](https://supabase.com), a free hosted database with built-in logins.
Until you do this, the site still works. Saved sessions are just kept in the browser instead of in an account.

## 1. Create a project

1. Sign up at [supabase.com](https://supabase.com) (free plan is fine).
2. Click **New project**. Give it a name (e.g. `drill-library`), set a database password (save it somewhere), pick the region closest to you, and click **Create**.
3. Wait a minute or two while it sets up.

## 2. Create the tables

1. In the left sidebar, open **SQL Editor**.
2. Click **New query**, paste everything from [`supabase-setup.sql`](supabase-setup.sql), and click **Run**.
3. You should see "Success. No rows returned".

Then do the same with [`supabase-drills.sql`](supabase-drills.sql). It creates the `drills` table for drills coaches upload,
and a `drill-media` storage bucket for their photos and videos.

If you set up the drills table before creator names were added, also run
[`supabase-authors.sql`](supabase-authors.sql) once. It adds the `author_name` column.

## 3. Connect the site

1. Open **Project Settings** (gear icon) → **API Keys** (on some projects it's **Data API** / **API**).
2. Copy the **Project URL** and the **publishable** key (older projects call it the **anon public** key).
3. Paste them into [`config.js`](config.js):

   ```js
   const SUPABASE_URL = "https://abcdefgh.supabase.co";
   const SUPABASE_KEY = "sb_publishable_...";
   ```

   The publishable / anon key is designed to be public, so it's fine to commit it. The table's security rules keep each coach's sessions private.
   **Never** use the `secret` or `service_role` key here. That one can read everything.

## 4. Tell Supabase where your site lives

This makes the "confirm your email" link send coaches back to your site.

1. Go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your GitHub Pages address, e.g.
   `https://grangerous23-dot.github.io/drilllibrary/drill.html`
3. Under **Redirect URLs**, add the same address.

## 5. Try it

1. Commit and push `config.js`, then open your site.
2. Click **Log in / Sign up** → **Sign up**, and create an account with your email.
3. Click the confirmation link in the email, then log in.
4. Build a session, click **Save session**, and check the **Saved Sessions** tab.
   It also shows up in Supabase under **Table Editor** → `sessions`.

### Tips

- Testing a lot? You can turn off email confirmation under **Authentication** → **Sign In / Providers** → **Email** → **Confirm email**. Turn it back on before real coaches use the site.
- Supabase's free email sender only sends a few emails per hour. That's fine for testing, but you'll want a custom email provider (SMTP) before launch.
- Free projects pause after a week with no activity. Click **Restore** in the dashboard to wake one up.
