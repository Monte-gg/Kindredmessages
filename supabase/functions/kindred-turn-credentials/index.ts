const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Sign in to request call relay credentials." }, 401);
  }

  let authResponse: Response;
  try {
    authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: authorization,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("Supabase could not verify the signed-in user.", error);
    return jsonResponse({ error: "Your sign-in could not be verified. Try again." }, 502);
  }
  if (!authResponse.ok) {
    return jsonResponse({ error: "Your sign-in has expired. Sign in again to make a call." }, 401);
  }

  let user: { id?: unknown };
  try {
    user = await authResponse.json();
  } catch (error) {
    console.error("Supabase returned invalid authenticated-user data.", error);
    return jsonResponse({ error: "Your sign-in could not be verified. Try again." }, 502);
  }
  if (typeof user.id !== "string" || !/^[0-9a-f-]{36}$/i.test(user.id)) {
    console.error("Supabase authenticated-user response did not include a valid user ID.");
    return jsonResponse({ error: "Your sign-in could not be verified. Try again." }, 502);
  }

  const turnHost = Deno.env.get("TURN_HOST")?.trim().toLowerCase();
  const sharedSecret = Deno.env.get("TURN_SHARED_SECRET");
  if (
    !turnHost
    || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/.test(turnHost)
    || !sharedSecret
  ) {
    console.error("Self-hosted TURN relay settings are missing or invalid in Supabase secrets.");
    return jsonResponse({ error: "The call relay has not been configured yet." }, 503);
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 86400;
  const username = `${expiresAt}:${user.id}`;
  let credential: string;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(sharedSecret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(username));
    credential = btoa(String.fromCharCode(...new Uint8Array(signature)));
  } catch (error) {
    console.error("Temporary TURN credentials could not be signed.", error);
    return jsonResponse({ error: "The call relay credentials could not be created." }, 500);
  }

  return jsonResponse({
    iceServers: [{
      urls: [
        `turn:${turnHost}:3478?transport=udp`,
        `turn:${turnHost}:3478?transport=tcp`,
        `turns:${turnHost}:443?transport=tcp`,
      ],
      username,
      credential,
    }],
  });
});
