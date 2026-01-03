# Deployment Guide: FireTourney Pro

Follow these steps to deploy your complete tournament system to Cloudflare.

## 1. Prerequisites
- Install [Node.js](https://nodejs.org/)
- Create a [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- Install Wrangler CLI:
  ```bash
  npm install -g wrangler
  ```

## 2. Initialize Resources

### Create D1 Database
Run this command to create your SQL database:
```bash
npx wrangler d1 create fire_tourney_db
```
**Important:** Copy the `database_id` from the output and paste it into `backend/wrangler.toml`.

### Create KV Namespace
Run this command for session storage:
```bash
npx wrangler kv:namespace create SESSIONS
```
**Important:** Copy the `id` from the output and paste it into `backend/wrangler.toml` under `[[kv_namespaces]]`.

## 3. Setup Database Schema
Apply the SQL schema to your production database:
```bash
npx wrangler d1 execute fire_tourney_db --remote --file=./backend/schema.sql
```

## 4. Deploy Backend Worker
Navigate to the `backend` folder and deploy:
```bash
cd backend
npx wrangler deploy
```
This will give you a URL like `https://fire-tourney-api.your-subdomain.workers.dev`.

## 5. Deploy Frontend (Cloudflare Pages)
The easiest way is to use the Cloudflare Dashboard:
1. Go to **Workers & Pages** > **Pages** > **Connect to Git**.
2. Select your repository.
3. **Build settings**:
   - Framework preset: `Vite` (or `None` if just static)
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add an **Environment Variable** named `VITE_API_URL` with your Worker URL from Step 4.

## 6. Local Development
To run the backend locally:
```bash
npx wrangler dev
```
To run the frontend locally:
```bash
npm run dev
```

---
**Note:** The current frontend code uses `mockDb.ts` for demo purposes. To use the real backend, replace the calls in `mockDb.ts` with `fetch()` calls to your Worker API URL.