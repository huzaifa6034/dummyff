
/**
 * FireTourney Pro Backend Worker
 */

// Fix: Define missing Cloudflare Workers types (D1Database and KVNamespace) to resolve compilation errors
interface D1Result<T = any> {
  results?: T[];
  success?: boolean;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = any>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface KVNamespace {
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<void>;
}

interface Env {
  // Fix: Use the locally defined D1Database interface
  DB: D1Database;
  // Fix: Use the locally defined KVNamespace interface
  SESSIONS: KVNamespace;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET All Tournaments
      if (path === "/api/tournaments" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM tournaments ORDER BY created_at DESC").all();
        return Response.json(results, { headers: corsHeaders });
      }

      // 2. CREATE Tournament (Admin Only - simplified for now)
      if (path === "/api/tournaments" && request.method === "POST") {
        const body: any = await request.json();
        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO tournaments (id, name, description, type, prize_pool, max_participants, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, body.name, body.description, body.type, body.prizePool, body.maxParticipants, body.startDate).run();
        return Response.json({ id, success: true }, { headers: corsHeaders });
      }

      // 3. REGISTER User
      if (path === "/api/register" && request.method === "POST") {
        const { username, email, password } = await request.json() as any;
        const id = crypto.randomUUID();
        await env.DB.prepare("INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)")
          .bind(id, username, email, password).run();
        return Response.json({ id, success: true }, { headers: corsHeaders });
      }

      // 4. JOIN Tournament
      if (path.match(/\/api\/tournament\/.*\/join/) && request.method === "POST") {
        const parts = path.split("/");
        const tournamentId = parts[3];
        const { userId } = await request.json() as any;

        // Atomic update: add participant and increment counter
        await env.DB.batch([
          env.DB.prepare("INSERT INTO participants (id, user_id, tournament_id) VALUES (?, ?, ?)").bind(crypto.randomUUID(), userId, tournamentId),
          env.DB.prepare("UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = ?").bind(tournamentId)
        ]);

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  }
};
