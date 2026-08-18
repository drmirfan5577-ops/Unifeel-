import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "+92" + digits.slice(1);
  }
  if (!phone.startsWith("+")) return "+" + digits;
  return phone.replace(/\s|-/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find matching OTP
    const { data: otpRecord, error: findError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("otp_code", otp.trim())
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP code. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as verified
    await supabase.from("phone_otps").update({ verified: true }).eq("id", otpRecord.id);

    // Generate a secure token for this verified phone (used for Supabase auth)
    // We'll use the phone as email: phone@itsme.internal
    const fakeEmail = `${normalizedPhone.replace("+", "")}@itsme.phone`;
    const tempPassword = `itsme_${otpRecord.id.replace(/-/g, "").slice(0, 16)}`;

    // Try to sign up or sign in with this phone-based email
    let userId: string | null = null;
    let authToken: string | null = null;

    // First try to sign in (existing user)
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: tempPassword,
    });

    if (signInData?.user) {
      userId = signInData.user.id;
      authToken = signInData.session?.access_token ?? null;
    } else {
      // New user — sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          phone: normalizedPhone,
          phone_verified: true,
          auth_method: "phone_otp",
        },
      });

      if (signUpError || !signUpData?.user) {
        console.error("Auth create error:", signUpError);
        return new Response(
          JSON.stringify({ error: "Account creation failed. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = signUpData.user.id;

      // Sign in to get session
      const { data: newSession } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: tempPassword,
      });
      authToken = newSession?.session?.access_token ?? null;
    }

    // Update user_profiles with phone
    if (userId) {
      await supabase.from("user_profiles").upsert({
        id: userId,
        email: fakeEmail,
        phone: normalizedPhone,
        phone_verified: true,
        username: normalizedPhone,
      }, { onConflict: "id" });
    }

    console.log(`Phone ${normalizedPhone} verified, userId: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        phone: normalizedPhone,
        userId,
        authToken,
        fakeEmail,
        tempPassword,
        isNewUser: !signInData?.user,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
