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
    const { phone } = JSON.parse(event.body || "{}");
    if (!phone) return { statusCode: 400, headers, body: JSON.stringify({ error: "Phone number is required" }) };

    const normalizedPhone = normalizePhone(phone);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    await supabase.from("phone_otps").delete().eq("phone", normalizedPhone);

    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone: normalizedPhone,
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
    });

    if (insertError) return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed: " + insertError.message }) };

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    let smsSent = false;
    let smsError = "";

    if (sid && token && from) {
      try {
        const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(`${sid}:${token}`).toString("base64")
          },
          body: new URLSearchParams({
            From: from,
            To: normalizedPhone,
            Body: `Your Unifeel verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share with anyone.`
          }).toString(),
        });
        
        const result = await r.json();
        if (r.ok) {
          smsSent = true;
        } else {
          smsError = `Twilio: ${result.message}`;
        }
      } catch (err) {
        smsError = String(err);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        phone: normalizedPhone,
        smsSent,
        ...(!smsSent && !sid ? { devOtp: otp } : {}),
        ...(smsError ? { warning: smsError } : {}),
        message: smsSent ? `Verification code sent to ${normalizedPhone}` : `OTP generated (dev mode)`
      })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
}
