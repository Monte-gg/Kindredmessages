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

  const turnKeyId = Deno.env.get("CLOUDFLARE_TURN_KEY_ID");
  const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
  if (!turnKeyId || !cloudflareApiToken) {
    console.error("Cloudflare TURN credentials are not configured in Supabase secrets.");
    return jsonResponse({ error: "The call relay has not been configured yet." }, 503);
  }

  let relayResponse: Response;
  try {
    relayResponse = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(turnKeyId)}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 86400 }),
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch (error) {
    console.error("Cloudflare TURN credential request failed.", error);
    return jsonResponse({ error: "The call relay could not be reached. Trying a direct call instead." }, 502);
  }

  if (!relayResponse.ok) {
    console.error(`Cloudflare TURN credential request returned HTTP ${relayResponse.status}.`);
    return jsonResponse({ error: "The call relay rejected its configuration. Check the TURN key and Calls Write token." }, 502);
  }

  let result: { iceServers?: unknown };
  try {
    result = await relayResponse.json();
  } catch (error) {
    console.error("Cloudflare returned invalid TURN credential JSON.", error);
    return jsonResponse({ error: "The call relay returned an invalid response." }, 502);
  }

  const iceServers = Array.isArray(result.iceServers)
    ? result.iceServers.flatMap((server) => {
      if (!server || typeof server !== "object" || !("urls" in server)) return [];
      const candidate = server as {
        urls: unknown;
        username?: unknown;
        credential?: unknown;
      };
      const urls = (Array.isArray(candidate.urls) ? candidate.urls : [candidate.urls])
        .filter((url): url is string => (
          typeof url === "string"
          && /^(?:stun|turn|turns):(?:turn|stun)\.cloudflare\.com(?::\d+)?(?:\?transport=(?:udp|tcp))?$/i.test(url)
        ));
      if (!urls.length) return [];

      const includesTurn = urls.some((url) => /^turns?:/i.test(url));
      if (includesTurn) {
        if (typeof candidate.username !== "string" || typeof candidate.credential !== "string") return [];
        return [{ urls, username: candidate.username, credential: candidate.credential }];
      }
      return [{ urls }];
    })
    : [];

  if (!iceServers.some((server) => server.urls.some((url) => /^turns?:/i.test(url)))) {
    console.error("Cloudflare TURN response contained no valid relay servers.");
    return jsonResponse({ error: "The call relay returned no usable TURN servers." }, 502);
  }

  return jsonResponse({ iceServers });
});
