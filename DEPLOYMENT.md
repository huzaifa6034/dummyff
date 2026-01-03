# Deployment Step-by-Step (Hinglish)

Agar blank page aa rahi hai, toh ensure karein ki `index.html` update ho gaya hai.

### 1. Database Setup (D1)
Terminal mein ye commands run karein:
1. `npx wrangler d1 create fire_tourney_db`
   * Output mein ek `database_id` milega. 
   * Usko copy karein aur `wrangler.toml` file mein `database_id = "..."` ki jagah paste karein.

2. `npx wrangler d1 execute fire_tourney_db --remote --file=schema.sql`
   * Isse saare tables (users, tournaments, etc.) ban jayenge.

### 2. Session Setup (KV)
1. `npx wrangler kv:namespace create SESSIONS`
   * Output mein ek `id` milega.
   * Usko `wrangler.toml` mein `id = "..."` (under `[[kv_namespaces]]`) mein paste karein.

### 3. Deploy Backend
1. `npx wrangler deploy`
   * Ye aapko ek URL dega (e.g., `https://fire-tourney-api.your-subdomain.workers.dev`).
   * Is URL ko note kar lein.

### 4. Deploy Frontend
Agar aap Cloudflare Pages use kar rahe hain:
1. Dashboard mein **Pages** par jayein.
2. Build settings mein:
   * **Build command**: `npm run build`
   * **Output directory**: `dist`
3. **Environment Variables** mein `VITE_API_URL` add karein aur usme Step 3 wala URL dal dein.

### 5. Troubleshooting (Blank Page)
* Agar abhi bhi blank page hai, toh browser console (F12) check karein.
* Check karein ki `index.tsx` sahi folder mein hai.
* `npm install` zaroor karein agar local machine par hain.