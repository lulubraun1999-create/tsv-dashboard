import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const serviceKey  = Deno.env.get("SERVICE_ROLE_KEY");
    const codewordSecret = Deno.env.get("REGISTER_CODEWORD");

    const missing: string[] = [];
    if (!supabaseUrl)    missing.push("PROJECT_URL");
    if (!serviceKey)     missing.push("SERVICE_ROLE_KEY");
    if (!codewordSecret) missing.push("REGISTER_CODEWORD");
    if (missing.length) {
      console.error("Missing env:", missing);
      return new Response(JSON.stringify({ error: "Missing env", missing }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    let payload: any;
    try { payload = await req.json(); }
    catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
    }); }

    const { email, password, firstname, lastname, codeword } = payload;
    if (!email || !password || !firstname || !lastname || !codeword) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (String(codeword) !== String(codewordSecret)) {
      return new Response(JSON.stringify({ error: "Invalid codeword" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: false,
      user_metadata: { firstname, lastname },
      app_metadata: { role: "member" }
    });

    if (error) {
      console.error("createUser error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ ok: true, userId: data.user?.id }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
