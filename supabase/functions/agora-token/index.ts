import { corsHeaders } from "../_shared/cors.ts";

// Agora token generation using RtcTokenBuilder
// For development without App Certificate, returns null token with App ID
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appId = Deno.env.get("AGORA_APP_ID");
    if (!appId) {
      return new Response(
        JSON.stringify({ error: "Agora App ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { channelName, uid, role } = await req.json();
    if (!channelName) {
      return new Response(
        JSON.stringify({ error: "channelName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return App ID and channel info - token will be null for testing mode
    // In production, generate a proper RTC token using App Certificate
    const response = {
      appId,
      channelName,
      uid: uid || Math.floor(Math.random() * 100000),
      token: null, // null = testing mode (no certificate required)
      expireTime: 3600,
    };

    console.log(`Agora token requested for channel: ${channelName}`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Agora token error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
