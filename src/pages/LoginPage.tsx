import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";
import { Camera, Check, ChevronLeft, ChevronRight, Mail, Phone, User, X } from "lucide-react";

interface LoginPageProps { onLogin: () => void; }

const COUNTRIES = [
  { flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan", code: "+92", iso: "PK" },
  { flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia", code: "+966", iso: "SA" },
  { flag: "\u{1F1E6}\u{1F1EA}", name: "UAE", code: "+971", iso: "AE" },
  { flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom", code: "+44", iso: "GB" },
  { flag: "\u{1F1FA}\u{1F1F8}", name: "United States", code: "+1", iso: "US" },
  { flag: "\u{1F1EE}\u{1F1F3}", name: "India", code: "+91", iso: "IN" },
  { flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladesh", code: "+880", iso: "BD" },
  { flag: "\u{1F1E6}\u{1F1EB}", name: "Afghanistan", code: "+93", iso: "AF" },
  { flag: "\u{1F1EE}\u{1F1F7}", name: "Iran", code: "+98", iso: "IR" },
  { flag: "\u{1F1F9}\u{1F1F7}", name: "Turkey", code: "+90", iso: "TR" },
  { flag: "\u{1F1E9}\u{1F1EA}", name: "Germany", code: "+49", iso: "DE" },
  { flag: "\u{1F1EB}\u{1F1F7}", name: "France", code: "+33", iso: "FR" },
  { flag: "\u{1F1E8}\u{1F1E6}", name: "Canada", code: "+1", iso: "CA" },
  { flag: "\u{1F1E6}\u{1F1FA}", name: "Australia", code: "+61", iso: "AU" },
  { flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia", code: "+60", iso: "MY" },
  { flag: "\u{1F1F6}\u{1F1E6}", name: "Qatar", code: "+974", iso: "QA" },
  { flag: "\u{1F1F0}\u{1F1FC}", name: "Kuwait", code: "+965", iso: "KW" },
  { flag: "\u{1F1E7}\u{1F1ED}", name: "Bahrain", code: "+973", iso: "BH" },
  { flag: "\u{1F1F4}\u{1F1F2}", name: "Oman", code: "+968", iso: "OM" },
  { flag: "\u{1F1EF}\u{1F1F4}", name: "Jordan", code: "+962", iso: "JO" },
];

const StepDot = ({ step, current, label }: { step: number; current: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
      style={{
        background:
          current > step
            ? "linear-gradient(135deg,#4CAF50,#2E7D32)"
            : current === step
            ? "linear-gradient(135deg,#7C4DFF,#E040FB)"
            : "rgba(255,255,255,0.15)",
        color: current >= step ? "white" : "rgba(255,255,255,0.5)",
        boxShadow: current === step ? "0 4px 15px rgba(124,77,255,0.5)" : "none",
        transform: current === step ? "scale(1.15)" : "scale(1)",
      }}
    >
      {current > step ? <Check size={14} /> : step}
    </div>
    <span
      className="text-[9px] font-medium"
      style={{ color: current === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}
    >
      {label}
    </span>
  </div>
);

const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = (i: number, v: string) => {
    const only = v.replace(/\D/g, "").slice(0, 1);
    onChange(digits.map((d, idx) => (idx === i ? only : d)).join("").replace(/ /g, ""));
    if (only && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      onChange(digits.map((d, idx) => (idx === i - 1 ? "" : d)).join("").replace(/ /g, ""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text);
    inputs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200"
          style={{
            background: digits[i] ? "rgba(124,77,255,0.15)" : "rgba(255,255,255,0.08)",
            border: digits[i] ? "2px solid #7C4DFF" : "2px solid rgba(255,255,255,0.2)",
            color: "white",
            fontSize: "22px",
            caretColor: "#7C4DFF",
          }}
        />
      ))}
    </div>
  );
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("Hey there! I am using unifeel.");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{ fakeEmail: string; tempPassword: string; userId: string } | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fullPhone = `${country.code}${phoneNumber.replace(/^0/, "")}`;

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (phoneNumber.length < 7) { toast.error("Please enter a valid phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) { toast.error(data?.error || "Failed to send OTP"); setLoading(false); return; }
      setNormalizedPhone(data.phone || fullPhone);
      if (data.devOtp) setDevOtp(data.devOtp);
      toast.success(`OTP sent to ${data.phone || fullPhone} 📱`);
      setResendTimer(60);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone || fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) { toast.error(data?.error || "Verification failed"); setLoading(false); return; }
      setAuthData({ fakeEmail: data.fakeEmail, tempPassword: data.tempPassword, userId: data.userId });
      toast.success("Phone verified! ✅");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Verification error");
    } finally {
      setLoading(false);
    }
  };

  // ── Avatar helper ─────────────────────────────────────────────────────────
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Step 3: Save Profile ──────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    try {
      let avatarUrl = "";

      // Upload avatar if selected
      if (avatarFile && authData?.userId) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${authData.userId}/avatar.${ext}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from("itsme-media")
          .upload(path, avatarFile, { upsert: true });
        if (!upErr && upData) {
          const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Sign in to Supabase with the fake email / temp password from verify step
      if (authData?.fakeEmail && authData?.tempPassword) {
        const { data: si, error: siErr } = await supabase.auth.signInWithPassword({
          email: authData.fakeEmail,
          password: authData.tempPassword,
        });
        if (siErr || !si?.user) {
          toast.error("Authentication error — please restart registration");
          setLoading(false);
          return;
        }

        // Update user_profiles row
        await supabase.from("user_profiles").upsert(
          {
            id: si.user.id,
            email: authData.fakeEmail,
            phone: normalizedPhone || fullPhone,
            phone_verified: true,
            display_name: displayName.trim(),
            username: displayName.trim().toLowerCase().replace(/\s+/g, "_"),
            bio: bio.trim(),
            avatar_url: avatarUrl,
            is_online: true,
            last_seen: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        // Persist in localStorage
        saveUser({
          id: si.user.id,
          name: displayName.trim(),
          phone: normalizedPhone || fullPhone,
          email: authData.fakeEmail,
          avatar: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName.trim())}`,
          bio: bio.trim(),
        });
      }

      toast.success("Profile saved! 🎉");
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Link Email (optional) ─────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error("Enter a valid email address"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
      if (error) { toast.error(error.message); setLoading(false); return; }
      setEmailOtpSent(true);
      toast.success("Verification email sent! Check your inbox 📧");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length < 4) { toast.error("Enter the verification code"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: emailOtp.trim(),
        type: "email",
      });
      if (error || !data?.user) { toast.error(error?.message || "Invalid code"); setLoading(false); return; }

      // Update email in user_profiles
      await supabase.from("user_profiles").update({ email: email.trim() }).eq("id", data.user.id);

      toast.success("Email linked successfully! ✅");
      finishLogin();
    } catch (err: any) {
      toast.error(err.message || "Email verification error");
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = () => {
    toast.success("Welcome to Unifeel! 🚀");
    onLogin();
  };

  // ── Filtered country list ─────────────────────────────────────────────────
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0015 0%, #1a0035 40%, #0d001a 100%)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7C4DFF 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #E040FB 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00BCD4 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-6 z-10"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "linear-gradient(135deg, #7C4DFF, #E040FB)", boxShadow: "0 8px 30px rgba(124,77,255,0.4)" }}
          >
            <span className="text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Unifeel</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>آنس می — Connect &amp; Share</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[
            { n: 1, label: "Phone" },
            { n: 2, label: "OTP" },
            { n: 3, label: "Profile" },
            { n: 4, label: "Email" },
          ].map(({ n, label }, idx, arr) => (
            <React.Fragment key={n}>
              <StepDot step={n} current={step} label={label} />
              {idx < arr.length - 1 && (
                <div className="flex-1 h-px" style={{ background: step > n ? "rgba(124,77,255,0.6)" : "rgba(255,255,255,0.12)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Phone ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Enter Your Phone</h2>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>We'll send a verification code</p>
            </div>

            {/* Country picker trigger */}
            <button
              onClick={() => setShowCountryPicker(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-2xl">{country.flag}</span>
              <span className="text-white font-medium">{country.name}</span>
              <span className="ml-auto font-mono text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{country.code}</span>
              <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
            </button>

            {/* Phone number input */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Phone size={16} style={{ color: "#7C4DFF" }} />
              <span className="text-white font-mono text-sm">{country.code}</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="3001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phoneNumber.length < 7}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.4)" }}
            >
              {loading ? "Sending…" : "Send OTP →"}
            </button>

            <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              By continuing you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Verify Code</h2>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                Sent to <span className="text-purple-300 font-mono">{normalizedPhone || fullPhone}</span>
              </p>
            </div>

            {/* Dev-mode OTP display */}
            {devOtp && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(255,193,7,0.12)", border: "1px solid rgba(255,193,7,0.4)" }}>
                <span className="text-yellow-400 text-xs font-mono">DEV OTP: <strong>{devOtp}</strong></span>
              </div>
            )}

            <OtpInput value={otp} onChange={setOtp} />

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.4)" }}
            >
              {loading ? "Verifying…" : "Verify Code ✓"}
            </button>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                <ChevronLeft size={14} /> Back
              </button>
              {resendTimer > 0 ? (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Resend in {resendTimer}s</span>
              ) : (
                <button onClick={handleSendOtp} className="text-xs font-medium" style={{ color: "#A78BFA" }}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Profile ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Set Up Profile</h2>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Add your name and photo</p>
            </div>

            {/* Avatar upload */}
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden group"
                style={{ border: "3px solid rgba(124,77,255,0.5)" }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1"
                    style={{ background: "rgba(124,77,255,0.15)" }}>
                    <User size={28} style={{ color: "rgba(255,255,255,0.5)" }} />
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Add Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  <Camera size={20} className="text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
            </div>

            {/* Name input */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <User size={16} style={{ color: "#7C4DFF" }} />
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              />
            </div>

            {/* Bio input */}
            <textarea
              placeholder="About / Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-transparent outline-none text-white placeholder:text-white/30 text-sm resize-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
            />

            <button
              onClick={handleProfileSave}
              disabled={loading || !displayName.trim()}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.4)" }}
            >
              {loading ? "Saving…" : "Save Profile →"}
            </button>
          </div>
        )}

        {/* ── STEP 4: Email (optional) ──────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Link Email</h2>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Optional — for account recovery &amp; backup</p>
            </div>

            {!emailOtpSent ? (
              <>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <Mail size={16} style={{ color: "#7C4DFF" }} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
                  />
                </div>

                <button
                  onClick={handleSendEmailOtp}
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 6px 20px rgba(124,77,255,0.4)" }}
                >
                  {loading ? "Sending…" : "Send Verification Email"}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Enter the code sent to <span className="text-purple-300">{email}</span>
                </p>

                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <Mail size={16} style={{ color: "#7C4DFF" }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Verification code"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
                  />
                </div>

                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={loading || !emailOtp.trim()}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#4CAF50,#2E7D32)", boxShadow: "0 6px 20px rgba(76,175,80,0.4)" }}
                >
                  {loading ? "Verifying…" : "Verify Email ✓"}
                </button>
              </>
            )}

            {/* Skip */}
            <button
              onClick={finishLogin}
              className="w-full py-3 rounded-2xl font-medium transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
            >
              Skip for now →
            </button>
          </div>
        )}
      </div>

      {/* ── Country Picker Modal ────────────────────────────────────────── */}
      {showCountryPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowCountryPicker(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-5 max-h-[70vh] flex flex-col"
            style={{ background: "#1a0035", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Select Country</h3>
              <button onClick={() => setShowCountryPicker(false)}>
                <X size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <input
                type="text"
                placeholder="Search country…"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.iso}
                  onClick={() => { setCountry(c); setShowCountryPicker(false); setCountrySearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: country.iso === c.iso ? "rgba(124,77,255,0.2)" : "transparent",
                    border: country.iso === c.iso ? "1px solid rgba(124,77,255,0.4)" : "1px solid transparent",
                  }}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-white text-sm flex-1">{c.name}</span>
                  <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
