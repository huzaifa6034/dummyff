
/**
 * FireTourney Pro Backend Worker
 * 
 * This file contains the logic for the REST API endpoints.
 * It assumes bindings for D1 (DB) and KV (SESSIONS).
 */

interface Env {
  DB: any; // Cloudflare D1
  SESSIONS: any; // Cloudflare KV
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET Tournaments
      if (path === "/api/tournaments" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM tournaments ORDER BY created_at DESC").all();
        return Response.json(results, { headers: corsHeaders });
      }

      // 2. JOIN Tournament
      if (path.endsWith("/join") && request.method === "POST") {
        const tournamentId = path.split("/")[3];
        const { userId } = await request.json() as any;
        
        // Use a transaction for joining
        await env.DB.batch([
          env.DB.prepare("INSERT INTO participants (id, user_id, tournament_id) VALUES (?, ?, ?)")
            .bind(crypto.randomUUID(), userId, tournamentId),
          env.DB.prepare("UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = ?")
            .bind(tournamentId)
        ]);

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 3. AUTH (KV Session Example)
      if (path === "/api/login" && request.method === "POST") {
        const { email, password } = await request.json() as any;
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
        
        if (user) {
          const sessionToken = crypto.randomUUID();
          // Store in KV for 24 hours
          await env.SESSIONS.put(sessionToken, JSON.stringify(user), { expirationTtl: 86400 });
          return Response.json({ token: sessionToken, user }, { headers: corsHeaders });
        }
      }

      return new Response("Not Found", { status: 404 });
    } catch (err: any) {
      return new Response(err.message, { status: 500, headers: corsHeaders });
    }
  }
};
