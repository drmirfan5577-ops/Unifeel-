import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone to E.164 (e.g. +923001234567)
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "+92" + digits.slice(1); // Pakistan default
  }
  if (!phone.startsWith("+")) return "+" + digits;
  return phone.replace(/\s|-/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete old OTPs for this phone
    await supabase.from("phone_otps").delete().eq("phone", normalizedPhone).eq("verified", false);

    // Insert new OTP
    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone: normalizedPhone,
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
    });

    if (insertError) {
      console.error("OTP insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try Twilio SMS if credentials are available
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    let smsSent = false;
    let smsError = "";

    if (twilioSid && twilioToken && twilioPhone) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const body = new URLSearchParams({
          From: twilioPhone,
          To: normalizedPhone,
          Body: `Your unifeel verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share with anyone.`,
        });

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${twilioSid}:${twilioToken}`),
          },
          body: body.toString(),
        });

        const result = await response.json();
        if (response.ok) {
          smsSent = true;
          console.log(`SMS sent to ${normalizedPhone}, SID: ${result.sid}`);
        } else {
          smsError = `Twilio: ${result.message}`;
          console.error("Twilio error:", result);
        }
      } catch (err) {
        smsError = String(err);
        console.error("SMS send error:", err);
      }
    } else {
      console.log("Twilio not configured — OTP in dev mode:", otp);
    }

    return new Response(
      JSON.stringify({
        success: true,
        phone: normalizedPhone,
        smsSent,
        // In dev mode (no Twilio), return OTP for testing
        ...((!smsSent && !twilioSid) ? { devOtp: otp } : {}),
        ...(smsError ? { warning: smsError } : {}),
        message: smsSent
          ? `Verification code sent to ${normalizedPhone}`
          : `OTP generated (dev mode)`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-otp error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
