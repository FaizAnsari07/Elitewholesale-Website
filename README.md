# Elite Wholesale

Next.js website + PHP API + MariaDB, all run with Docker.

## Run everything (one command)

    cp .env.example .env        # first time only: set real passwords / secrets
    docker compose up --build

| What | URL |
|------|-----|
| Website | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin/login |
| PHP API | http://localhost:8080 |

The first start creates the database and loads the catalog from `backend/db/init/`.
Stop with `docker compose down`. **Do not add `-v`** unless you want to delete the database
(all products edited in the admin panel).

## Development without Docker for the website

Start only the backend, then run Next.js locally with hot reload:

    docker compose up -d db api
    cp .env.example .env.local   # set CATALOG_API_URL=http://localhost:8080 and the same keys
    npm run dev

## Deploying

- Website on Vercel: set `CATALOG_API_URL` (public API address) and `CATALOG_API_KEY`.
- API + database on a server with HTTPS: see `backend/README.md`.
- Everything on one server: `docker compose up -d --build` with a proxy/HTTPS in front of port 3000.

## Layout

- `src/` Next.js app (site + `/admin`), `public/uploads` migrated product images
- `backend/` PHP API, database seed, production compose (`docker-compose.prod.yml`)
