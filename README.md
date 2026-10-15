# Alamir website

Install Node.js 24 and [set up and start the backend](../alamir-payload-backend/README.md) first.

1. Open a terminal in this project folder and install dependencies:

   ```sh
   npm ci --include=dev
   ```

2. On the first installation, create the settings file:

   ```sh
   cp .env.example .env
   ```

   Edit `.env` with your settings. Keep an existing `.env` when updating.

   | Setting | Value |
   | --- | --- |
   | `PORT` | Website port, usually `3000` |
   | `NEXT_PUBLIC_BACKEND_URL` | Backend URL, without `/api` or `/admin` |
   | `NEXT_PUBLIC_SITE_URL` | Website URL; match the backend’s `FRONTEND_URL` |
   | `NEXT_PUBLIC_APP_NAME` | Website name |
   | `NEXT_PUBLIC_MEDIA_URL` | Public media URL; match the backend’s `R2_PUBLIC_URL` |
   | `CMS_REVALIDATION_SECRET` | Same value as the backend’s `CMS_REVALIDATION_SECRET` |
   | `NEXT_PUBLIC_APP_TIMEZONE` | Leave empty, or match the backend’s `APP_TIMEZONE` |

3. Build and start the website:

   ```sh
   npm run build
   npm run start
   ```

Open your website URL, or [localhost:3000](http://localhost:3000) for a local installation. Keep the backend and website running.

After an update or a change to `.env`, rebuild with `npm run build` and restart the website.
