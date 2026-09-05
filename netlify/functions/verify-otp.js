import { createClient } from "@supabase/supabase-js";

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return "+92" + digits.slice(1);
  if (!String(phone).startsWith("+")) return "+" + digits;
  return String(phone).replace(/[\s-]/g, "");
}

export async function handler(event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "{}" };

  try {
    const { phone, otp } = JSON.parse(event.body || "{}");
    if (!phone || !otp) return { statusCode: 400, headers, body: JSON.stringify({ error: "Phone and OTP required" }) };

    const normalizedPhone = normalizePhone(phone);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: rec, error: fe } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("otp_code", String(otp).trim())
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fe || !rec) return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid or expired OTP" }) };

    await supabase.from("phone_otps").update({ verified: true }).eq("id", rec.id);

    const fakeEmail = `${normalizedPhone.replace("+", "")}@unifeel.phone`;
    const tempPassword = `unifeel_${rec.id.replace(/-/g, "").slice(0, 16)}`;

    let userId = null;
    const { data: si } = await supabase.auth.signInWithPassword({ email: fakeEmail, password: tempPassword });

    if (si?.user) {
      userId = si.user.id;
    } else {
      const { data: su, error: se } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { phone: normalizedPhone, phone_verified: true },
      });

      if (se || !su?.user) return { statusCode: 500, headers, body: JSON.stringify({ error: "Auth failed: " + (se?.message || "unknown") }) };
      userId = su.user.id;
    }

    await supabase.from("user_profiles").upsert({
      id: userId,
      email: fakeEmail,
      phone: normalizedPhone,
      phone_verified: true,
      username: normalizedPhone
    }, { onConflict: "id" });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        verified: true,
        phone: normalizedPhone,
        userId,
        fakeEmail,
        tempPassword
      })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
}