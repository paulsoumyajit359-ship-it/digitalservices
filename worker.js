async function hashValue(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function incrementVisitorCount(env) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/increment_visitor_count`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: "{}"
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return response.json();
}

async function getVisitorCount(env) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/site_statistics?id=eq.1&select=visitor_count`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  const rows = await response.json();
  return rows[0]?.visitor_count ?? 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/visitor-count") {
      try {
        const ip =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("X-Forwarded-For") ||
          "unknown";

        const userAgent = request.headers.get("User-Agent") || "unknown";
        const fingerprint = await hashValue(`${ip}|${userAgent}`);

        const key = `visitor:${fingerprint}`;
        const alreadyCounted = await env.VISITOR_KV.get(key);

        if (!alreadyCounted) {
          await incrementVisitorCount(env);
          await env.VISITOR_KV.put(key, "1", {
            expirationTtl: 86400
          });
        }

        const visitorCount = await getVisitorCount(env);

        return new Response(
          JSON.stringify({
            success: true,
            visitorCount: Number(visitorCount)
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Visitor counter temporarily unavailable."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
