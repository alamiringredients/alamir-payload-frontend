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

For development, run `npm test`, `npm run typecheck`, and `npm run lint`.
After changing Section definitions or Owner form policy in the backend, run
`npm run content:sync` there and commit the generated frontend metadata with the backend change.
`npm run content:check` in the backend checks that the two repositories agree.

Page Section presenters live in `lib/cms/`: Home, managed pages, editorial pages,
and Sustainability have their own presenters; Careers, News, and Downloads share
`page-content.ts`. Records use `lib/payload/record-presentation.ts` and Catalog
uses `lib/catalog/presentation.ts`. They read owned fields directly; historical
Section and record templates have been removed.

Renderers in `components/pages/sections/` load supporting content only when the
selected Section uses it. `lib/payload/read-plan.ts` batches those resources using
the enabled `sectionTypes` in the public page summary. Run `npm run refresh:public`
in the backend after deploying this change to refresh existing summaries; older
summaries remain compatible with on-demand reads.

Public resource metadata is generated from the backend's
`src/services/publicContentPolicy.ts`. Deploy the backend before the frontend when
changing the public content contract, including search projections.
