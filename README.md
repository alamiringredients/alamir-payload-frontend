# Alamir Payload frontend

Use Node.js 24 LTS for development and deployment. The tooling also supports Node.js 22.13+ (22.x) and Node.js 26+.

This separate Next.js website preserves the existing Alamir design and reads content from Payload's generated REST API. English, Arabic, and French routes remain available.

Configure `.env` using `.env.example`. `NEXT_PUBLIC_BACKEND_URL` identifies the Payload API, and `NEXT_PUBLIC_MEDIA_URL` identifies the public R2 domain. Storage credentials belong only in the backend environment. `NEXT_PUBLIC_APP_TIMEZONE` configures date displays; leave it empty to use the runtime default. Set it to the same value as the backend’s `APP_TIMEZONE` when you need one consistent display timezone. Changes to public environment variables require rebuilding the frontend.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. The Payload admin runs at <http://localhost:8000/admin>.

## Production deployment

Complete the [backend production steps](../alamir-payload-backend/README.md#production-deployment) first: migrate and seed its PostgreSQL database, build it, and start it. The frontend build reads content from the backend, so the configured backend URL must be reachable from the build machine and the running frontend.

1. From the deployed `alamir-payload-frontend` folder, install the locked dependencies and build tools:

   ```sh
   npm ci --include=dev
   ```

2. On the first deployment only, create the environment file:

   ```sh
   cp .env.example .env
   ```

   If `.env` already exists, edit it instead of copying over it. Hosting-provided environment variables can replace the file. Configure these values before building:

   | Variable | Production value |
   | --- | --- |
   | `PORT` | Server listening port; default `3000` in `.env.example`, editable in `.env` |
   | `NEXT_PUBLIC_BACKEND_URL` | Backend HTTPS origin, for example `https://cms.example.com`, without `/api` or `/admin` |
   | `NEXT_PUBLIC_SITE_URL` | Frontend HTTPS origin, for example `https://www.example.com`; must match backend `FRONTEND_URL` |
   | `NEXT_PUBLIC_APP_NAME` | Website name, for example `Alamir Ingredients` |
   | `NEXT_PUBLIC_MEDIA_URL` | Public R2 media origin; must match backend `R2_PUBLIC_URL` |
   | `CMS_REVALIDATION_SECRET` | Copy the same secret generated for the backend; keep it server-only |
   | `NEXT_PUBLIC_APP_TIMEZONE` | Optional; leave empty unless an explicit display timezone is needed; when set, match backend `APP_TIMEZONE` |

   Do not put `PAYLOAD_SECRET`, `DATABASE_URL`, or R2 storage credentials in the frontend. Do not prefix `CMS_REVALIDATION_SECRET` with `NEXT_PUBLIC_`. The frontend has no database migration or seeding command; the backend owns both.

3. Build the frontend after the backend is seeded and running:

   ```sh
   npm run build
   ```

   Next.js uses production mode for this build. `NEXT_PUBLIC_*` values are embedded at build time; changing them requires another build. Production values must not retain the example localhost URLs.

4. Start the frontend in its own terminal or service:

   ```sh
   npm run start
   ```

   This runs the production server on the `PORT` configured in `.env` and stays in the foreground. The provided frontend default is `3000`. The start and development commands preload `.env` before Next.js reads the port; a hosting-provided `PORT` takes precedence. Changing only the listening port requires restarting the service. Changes to public URLs still require rebuilding. Under a process manager, configure `npm run start` as the service start command and use the manager's restart command for subsequent deployments. Route your frontend HTTPS domain to your configured listening port. Keep the backend service running separately.

5. Open the production frontend and check the three locale routes (`/`, `/ar`, `/fr`), product navigation, R2 images, and the Get in touch modal. Publishing a backend content change should refresh the frontend through the shared revalidation secret.

To change the listening port, edit `PORT` in this project's `.env`, then restart:

```env
PORT=3000
```

For local development, update the matching public URLs in both projects when their ports change. In production, public URLs should use your HTTPS domains and remain separate from the internal listening ports.

For later deployments, keep the existing environment values, run `npm ci --include=dev` and `npm run build`, then restart the frontend service. After seeding backend defaults, rebuild/restart the frontend so its output cache uses the seeded data.

Images and videos are served from R2. Next Image allows the configured public media origin, and image dimensions come from Payload metadata in one cached request. Components, CSS, responsive layouts, and animations remain in this frontend.

```sh
npm run typecheck
npm run lint
npm run build
```

Website pages are loaded from Payload’s Pages collection through the locale-aware catch-all route. Publishing a new page requires no frontend code change. Sections render with the existing brand components and CSS. The `/[locale]/preview/[id]` route requires an authenticated Payload session and reads draft data without caching. Use the same `CMS_REVALIDATION_SECRET` as the backend for publish-time cache invalidation.

Frontend forms are rendered from the owning Payload Form Builder definition with the existing brand classes. Definitions are loaded in one cached request per locale. Enquiries, CV applications and reservations submit to the official Form Submissions endpoint; search retains its GET query behavior.

Email delivery is owned by the backend. Complete its [SMTP and email worker setup](../alamir-payload-backend/README.md#smtp-and-queued-emails) when deploying. Keep SMTP credentials and the email worker out of the frontend. A successful submission saves and queues the email; it does not wait for SMTP delivery.

Translations load from Payload for English, Arabic and French. Shared interface text belongs to Shared translations; editorial copy belongs to its page or record, and form text belongs to Form Builder. There are no frontend translation JSON files or language overrides.
