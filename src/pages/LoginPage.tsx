import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";

const S: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(124,77,255,0.4)",
  borderRadius: 16,
  padding: "14px 16px",
  color: "white",
  width: "100%",
  outline: "none",
  fontSize: 16,
};
const B: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg,#7C4DFF,#E040FB)",
  color: "white",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const COUNTRIES = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
];

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [countryCode, setCountryCode] = useState("+92");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [auth, setAuth] = useState<{ fakeEmail: string; tempPassword: string; userId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const fullPhone = countryCode + phone.replace(/^0/, "");
  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const send = async () => {
    if (!phone.trim()) return toast.error("Enter your phone number");
    setBusy(true);
    try {
      // Try Supabase edge function first
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone: fullPhone },
      });
      if (error) throw error;
      if (data?.devOtp) {
        setDevOtp(data.devOtp);
        toast.success("Dev mode — OTP shown below");
      } else {
        toast.success("OTP sent to " + fullPhone);
      }
      setStep(2);
    } catch {
      // Fallback to netlify function
      try {
        const r = await fetch("/.netlify/functions/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to send OTP");
        if (d.devOtp) {
          setDevOtp(d.devOtp);
          toast.success("Dev mode — OTP shown below");
        } else {
          toast.success("OTP sent to " + fullPhone);
        }
        setStep(2);
      } catch (err2: any) {
        toast.error(err2.message || "Failed to send OTP");
      }
    }
    setBusy(false);
  };

  const verify = async () => {
    if (otp.length < 4) return toast.error("Enter the OTP");
    setBusy(true);
    try {
      // Try Supabase edge function first
      let result: any = null;
      try {
        const { data, error } = await supabase.functions.invoke("verify-otp", {
          body: { phone: fullPhone, otp },
        });
        if (error) throw error;
        result = data;
      } catch {
        // Fallback to netlify function
        const r = await fetch("/.netlify/functions/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone, otp }),
        });
        result = await r.json();
        if (!r.ok) throw new Error(result.error || "Verification failed");
      }

      if (!result?.verified) throw new Error(result?.error || "Invalid OTP");

      setAuth({
        fakeEmail: result.fakeEmail,
        tempPassword: result.tempPassword,
        userId: result.userId,
      });
      toast.success("Phone verified!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    }
    setBusy(false);
  };

  const saveProfile = async () => {
    if (!name.trim()) return toast.error("Enter your name");
    if (!auth) return toast.error("Session error, please restart");
    setBusy(true);
    try {
      // Sign in with the credentials from verify step
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: auth.fakeEmail,
        password: auth.tempPassword,
      });

      if (signInError || !signInData.user) {
        throw new Error(signInError?.message || "Sign in failed");
      }

      let avatarUrl = "";
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${auth.userId}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("itsme-media")
          .upload(path, avatarFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      await supabase.from("user_profiles").upsert(
        {
          id: auth.userId,
          email: auth.fakeEmail,
          phone: fullPhone,
          phone_verified: true,
          username: name.trim().toLowerCase().replace(/\s+/g, "_"),
          display_name: name.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl || null,
          is_online: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      // Update auth metadata
      await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          avatar_url: avatarUrl || null,
          phone: fullPhone,
        },
      });

      saveUser({
        id: auth.userId,
        phone: fullPhone,
        name: name.trim(),
        avatar: avatarUrl || "",
        email: auth.fakeEmail,
      });

      toast.success("Welcome to It's Me!");
      onLogin();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
    setBusy(false);
  };

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0015 0%,#1a0035 50%,#0d001a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowCountryPicker(false)}
        >
          <div
            style={{
              background: "#1a0035",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 380,
              maxHeight: "70vh",
              overflowY: "auto",
              border: "1.5px solid rgba(124,77,255,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "white", marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
              Select Country
            </h3>
            {COUNTRIES.map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: c.code === countryCode ? "rgba(124,77,255,0.2)" : "transparent",
                  marginBottom: 4,
                }}
                onClick={() => {
                  setCountryCode(c.code);
                  setShowCountryPicker(false);
                }}
              >
                <span style={{ fontSize: 24 }}>{c.flag}</span>
                <span style={{ color: "white", flex: 1 }}>{c.name}</span>
                <span style={{ color: "#7C4DFF", fontWeight: 700 }}>{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          borderRadius: 28,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 420,
          border: "1.5px solid rgba(124,77,255,0.3)",
          boxShadow: "0 24px 64px rgba(124,77,255,0.2)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7C4DFF,#E040FB)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              marginBottom: 12,
              boxShadow: "0 8px 32px rgba(124,77,255,0.4)",
            }}
          >
            💬
          </div>
          <h1
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg,#7C4DFF,#E040FB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            It&apos;s Me
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "4px 0 0", fontSize: 14 }}>
            آنس می
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 32 : 10,
                height: 10,
                borderRadius: 5,
                background:
                  s === step
                    ? "linear-gradient(135deg,#7C4DFF,#E040FB)"
                    : s < step
                    ? "#7C4DFF"
                    : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* STEP 1 — Phone */}
        {step === 1 && (
          <div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Enter your number
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
              We will send you a verification code
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setShowCountryPicker(true)}
                style={{
                  ...S,
                  width: "auto",
                  minWidth: 90,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{selectedCountry.flag}</span>
                <span>{countryCode}</span>
              </button>
              <input
                style={{ ...S, flex: 1 }}
                placeholder="3001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && send()}
                type="tel"
                inputMode="numeric"
                maxLength={15}
              />
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 24 }}>
              {fullPhone}
            </p>
            <button style={B} onClick={send} disabled={busy}>
              {busy ? "Sending…" : "Send OTP →"}
            </button>
          </div>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Verify your number
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
              Enter the 6-digit code sent to {fullPhone}
            </p>

            {devOtp && (
              <div
                style={{
                  background: "rgba(255,193,7,0.15)",
                  border: "1px solid rgba(255,193,7,0.4)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#FFC107", fontWeight: 700, margin: 0, fontSize: 13 }}>
                  Dev Mode — Your OTP:
                </p>
                <p
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: 28,
                    margin: "4px 0 0",
                    letterSpacing: 8,
                  }}
                >
                  {devOtp}
                </p>
              </div>
            )}

            <input
              style={{ ...S, textAlign: "center", fontSize: 28, letterSpacing: 12, marginBottom: 16 }}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
            <button style={B} onClick={verify} disabled={busy}>
              {busy ? "Verifying…" : "Verify Code →"}
            </button>
            <button
              style={{
                ...B,
                background: "transparent",
                border: "1.5px solid rgba(124,77,255,0.4)",
                marginTop: 10,
              }}
              onClick={() => {
                setStep(1);
                setOtp("");
                setDevOtp("");
              }}
            >
              ← Change Number
            </button>
          </div>
        )}

        {/* STEP 3 — Profile */}
        {step === 3 && (
          <div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Set up your profile
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
              Tell others a bit about yourself
            </p>

            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <label htmlFor="avatar-input" style={{ cursor: "pointer" }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#7C4DFF,#E040FB)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "3px solid rgba(124,77,255,0.5)",
                    boxShadow: "0 8px 32px rgba(124,77,255,0.3)",
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 36 }}>📷</span>
                  )}
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 6 }}>
                  Tap to add photo
                </p>
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={pickAvatar}
              />
            </div>

            <input
              style={{ ...S, marginBottom: 12 }}
              placeholder="Your name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              style={{ ...S, marginBottom: 20, resize: "none", height: 80 }}
              placeholder="Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <button style={B} onClick={saveProfile} disabled={busy}>
              {busy ? "Saving…" : "Get Started 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
