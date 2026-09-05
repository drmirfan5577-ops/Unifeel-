import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(124,77,255,0.4)",
  borderRadius: 16,
  padding: "14px 16px",
  color: "white",
  width: "100%",
  outline: "none",
  fontSize: 16,
  boxSizing: "border-box",
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: 16,
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
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
];

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [countryCode, setCountryCode] = useState("+92");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [normPhone, setNormPhone] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [auth, setAuth] = useState<{ fakeEmail: string; tempPassword: string; userId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const showDev = new URLSearchParams(window.location.search).has("dev");
  const fullPhone = countryCode + phone.replace(/^0/, "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const sendOtp = async () => {
    if (!phone.trim() || phone.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setBusy(true);
    try {
      const normalized = fullPhone;
      setNormPhone(normalized);

      const response = await fetch("/.netlify/functions/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      
      const data = await response.json();
      const error = !response.ok ? new Error(data.error || "Failed to send OTP") : null;

      if (error) throw error;
      if (data?.devOtp) setDevOtp(data.devOtp);
      toast.success("OTP sent!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      toast.error("Please enter the OTP");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/.netlify/functions/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normPhone, otp }),
      });
      
      const data = await response.json();
      const error = !response.ok ? new Error(data.error || "OTP verification failed") : null;

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || "Invalid OTP");

      setAuth({ fakeEmail: data.fakeEmail, tempPassword: data.tempPassword, userId: data.userId });
      toast.success("Phone verified!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "OTP verification failed");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!auth) {
      toast.error("Session lost. Please restart.");
      return;
    }

    setBusy(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: auth.fakeEmail,
        password: auth.tempPassword,
      });

      if (signInError) throw signInError;

      let avatarUrl = "";
      if (avatarFile && signInData.user) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${signInData.user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("itsme-media")
          .upload(path, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ display_name: name, bio, avatar_url: avatarUrl || undefined })
        .eq("id", auth.userId);

      if (profileError) throw profileError;

      const userObj = {
        id: auth.userId,
        phone: normPhone,
        display_name: name,
        bio,
        avatar_url: avatarUrl,
        username: normPhone,
      };

      saveUser(userObj);
      toast.success("Welcome to It's Me!");
      onLogin();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0a0a0f 0%,#1a0a2e 50%,#0d1b2a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(124,77,255,0.3)",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: "linear-gradient(135deg,#7C4DFF,#E040FB)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: 32,
          }}>🌙</div>
          <h1 style={{ color: "white", fontSize: 26, fontWeight: 700, margin: 0 }}>It&apos;s Me</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "4px 0 0" }}>آنس می</p>
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Enter Phone Number</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>
              We will send you a verification code
            </p>

            <button
              onClick={() => setShowCountryPicker(true)}
              style={{ ...inp, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12, background: "rgba(255,255,255,0.06)" }}
            >
              <span style={{ fontSize: 20 }}>{COUNTRIES.find(c => c.code === countryCode)?.flag}</span>
              <span style={{ color: "white" }}>{COUNTRIES.find(c => c.code === countryCode)?.name}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{countryCode} ▾</span>
            </button>

            {showCountryPicker && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
                zIndex: 1000, display: "flex", alignItems: "flex-end",
              }} onClick={() => setShowCountryPicker(false)}>
                <div style={{
                  background: "#1a1a2e", borderRadius: "24px 24px 0 0",
                  width: "100%", maxHeight: "60vh", overflowY: "auto", padding: 16,
                }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ color: "white", margin: "0 0 12px", textAlign: "center" }}>Select Country</h3>
                  {COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => { setCountryCode(c.code); setShowCountryPicker(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        padding: "12px 8px", background: countryCode === c.code ? "rgba(124,77,255,0.2)" : "transparent",
                        border: "none", borderRadius: 10, cursor: "pointer", color: "white", fontSize: 15,
                      }}>
                      <span style={{ fontSize: 22 }}>{c.flag}</span>
                      <span style={{ flex: 1, textAlign: "left" }}>{c.name}</span>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              style={{ ...inp, marginBottom: 20 }}
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              type="tel"
              inputMode="numeric"
            />

            <button style={btn} onClick={sendOtp} disabled={busy}>
              {busy ? "Sending…" : "Send OTP →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Verify OTP</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>
              Code sent to {normPhone}
            </p>

            {devOtp && (
              <div style={{
                background: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.4)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16, textAlign: "center",
              }}>
                <span style={{ color: "#E040FB", fontSize: 12, display: "block", marginBottom: 4 }}>Dev Mode — OTP</span>
                <span style={{ color: "white", fontSize: 28, fontWeight: 700, letterSpacing: 8 }}>{devOtp}</span>
              </div>
            )}

            <input
              style={{ ...inp, marginBottom: 16, textAlign: "center", fontSize: 28, letterSpacing: 8, fontWeight: 700 }}
              placeholder="0 0 0 0"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="tel"
              inputMode="numeric"
              maxLength={6}
            />

            <button style={btn} onClick={verifyOtp} disabled={busy}>
              {busy ? "Verifying…" : "Verify OTP ✓"}
            </button>

            <button onClick={() => setStep(1)}
              style={{ ...btn, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", marginTop: 10 }}>
              ← Change Number
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Create Profile</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>
              Set up your It&apos;s Me profile
            </p>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <label htmlFor="avatar-upload" style={{ cursor: "pointer" }}>
                <div style={{
                  width: 88, height: 88, borderRadius: "50%",
                  background: avatarPreview ? "none" : "linear-gradient(135deg,#7C4DFF,#E040FB)",
                  margin: "0 auto 8px", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid rgba(124,77,255,0.6)",
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 32 }}>👤</span>
                  }
                </div>
                <span style={{ color: "#7C4DFF", fontSize: 13 }}>Tap to add photo</span>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>

            <input
              style={{ ...inp, marginBottom: 12 }}
              placeholder="Your Name *"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              style={{ ...inp, marginBottom: 20 }}
              placeholder="Bio (optional)"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />

            <button style={btn} onClick={saveProfile} disabled={busy}>
              {busy ? "Saving…" : "Get Started 🚀"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 8, borderRadius: 4,
              background: s === step ? "#7C4DFF" : s < step ? "#E040FB" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;