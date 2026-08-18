import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";
import { Camera, Check, ChevronLeft, ChevronRight, Mail, Phone, User, X } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

// ── Country codes list ──────────────────────────────────────────────────────
const COUNTRIES = [
  { flag: "🇵🇰", name: "Pakistan", code: "+92", iso: "PK" },
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966", iso: "SA" },
  { flag: "🇦🇪", name: "UAE", code: "+971", iso: "AE" },
  { flag: "🇬🇧", name: "United Kingdom", code: "+44", iso: "GB" },
  { flag: "🇺🇸", name: "United States", code: "+1", iso: "US" },
  { flag: "🇮🇳", name: "India", code: "+91", iso: "IN" },
  { flag: "🇧🇩", name: "Bangladesh", code: "+880", iso: "BD" },
  { flag: "🇦🇫", name: "Afghanistan", code: "+93", iso: "AF" },
  { flag: "🇮🇷", name: "Iran", code: "+98", iso: "IR" },
  { flag: "🇹🇷", name: "Turkey", code: "+90", iso: "TR" },
  { flag: "🇩🇪", name: "Germany", code: "+49", iso: "DE" },
  { flag: "🇫🇷", name: "France", code: "+33", iso: "FR" },
  { flag: "🇨🇦", name: "Canada", code: "+1", iso: "CA" },
  { flag: "🇦🇺", name: "Australia", code: "+61", iso: "AU" },
  { flag: "🇲🇾", name: "Malaysia", code: "+60", iso: "MY" },
  { flag: "🇶🇦", name: "Qatar", code: "+974", iso: "QA" },
  { flag: "🇰🇼", name: "Kuwait", code: "+965", iso: "KW" },
  { flag: "🇧🇭", name: "Bahrain", code: "+973", iso: "BH" },
  { flag: "🇴🇲", name: "Oman", code: "+968", iso: "OM" },
  { flag: "🇯🇴", name: "Jordan", code: "+962", iso: "JO" },
];

// ── Step indicator ──────────────────────────────────────────────────────────
const StepDot: React.FC<{ step: number; current: number; label: string }> = ({ step, current, label }) => {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={{
          background: done
            ? "linear-gradient(135deg,#4CAF50,#2E7D32)"
            : active
            ? "linear-gradient(135deg,#7C4DFF,#E040FB)"
            : "rgba(255,255,255,0.15)",
          color: done || active ? "white" : "rgba(255,255,255,0.5)",
          boxShadow: active ? "0 4px 15px rgba(124,77,255,0.5)" : "none",
          transform: active ? "scale(1.15)" : "scale(1)",
        }}
      >
        {done ? <Check size={14} /> : step}
      </div>
      <span className="text-[9px] font-medium" style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
    </div>
  );
};

// ── OTP digit boxes ─────────────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const only = v.replace(/\D/g, "").slice(0, 1);
    const arr = digits.map((d, idx) => (idx === i ? only : d));
    onChange(arr.join("").replace(/ /g, ""));
    if (only && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const arr = digits.map((d, idx) => (idx === i - 1 ? "" : d));
      onChange(arr.join("").replace(/ /g, ""));
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

// ── Main LoginPage ──────────────────────────────────────────────────────────
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("Hey there! I am using unifeel.");
  const [avatarUrl, setAvatarUrl] = useState("");
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

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

  // ── Step 1: Send SMS OTP ────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (phoneNumber.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone: fullPhone },
      });
      if (error) {
        const msg = error instanceof Error ? error.message : "Failed to send OTP";
        toast.error(msg);
        return;
      }
      if (data?.error) { toast.error(data.error); return; }

      setNormalizedPhone(data.phone || fullPhone);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        toast.success(`Dev mode — OTP: ${data.devOtp}`, { duration: 15000 });
      } else {
        toast.success(`OTP sent to ${data.phone || fullPhone} 📱`);
      }
      setResendTimer(60);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone: normalizedPhone || fullPhone, otp },
      });
      if (error) { toast.error("Verification failed. Try again."); return; }
      if (data?.error) { toast.error(data.error); return; }

      setAuthData({ fakeEmail: data.fakeEmail, tempPassword: data.tempPassword, userId: data.userId });
      toast.success("Phone verified! ✅");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Verification error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Profile setup ────────────────────────────────────────────────
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    try {
      // Sign in to get session
      if (authData) {
        const { data: sess } = await supabase.auth.signInWithPassword({
          email: authData.fakeEmail,
          password: authData.tempPassword,
        });

        if (sess?.session) {
          let finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7C4DFF&color=fff&size=200`;

          // Upload avatar if selected
          if (avatarFile && sess.user) {
            const ext = avatarFile.name.split(".").pop();
            const path = `${sess.user.id}/avatar.${ext}`;
            const { error: uploadErr } = await supabase.storage
              .from("itsme-media")
              .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
            if (!uploadErr) {
              const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
              finalAvatar = urlData.publicUrl;
            }
          }

          setAvatarUrl(finalAvatar);

          // Update profile in Supabase
          await supabase.from("user_profiles").upsert({
            id: sess.user.id,
            email: authData.fakeEmail,
            username: displayName.trim(),
            display_name: displayName.trim(),
            bio: bio.trim() || "Hey there! I am using unifeel.",
            phone: normalizedPhone,
            phone_verified: true,
            avatar_url: finalAvatar,
          }, { onConflict: "id" });

          // Update auth metadata
          await supabase.auth.updateUser({
            data: {
              username: displayName.trim(),
              full_name: displayName.trim(),
              avatar_url: finalAvatar,
              phone: normalizedPhone,
            },
          });

          // Save to local store
          saveUser({
            name: displayName.trim(),
            phone: normalizedPhone,
            email: email || authData.fakeEmail,
            avatar: finalAvatar,
            status: bio.trim() || "Hey there! I am using unifeel.",
          });

          toast.success("Profile saved! 🎉");
          setStep(4);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Profile save failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Email attachment (optional) ──────────────────────────────────
  const handleSendEmailOtp = async () => {
    if (!email || !email.includes("@")) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) { toast.error("Could not send email OTP: " + error.message); setLoading(false); return; }
    setEmailOtpSent(true);
    toast.success(`Verification sent to ${email} 📧`);
    setLoading(false);
  };

  const handleFinish = async (withEmail = false) => {
    setLoading(true);
    try {
      if (withEmail && emailOtp && emailOtpSent) {
        // Verify email OTP
        const { error } = await supabase.auth.verifyOtp({ email, token: emailOtp, type: "email" });
        if (error) { toast.error("Email verification failed: " + error.message); setLoading(false); return; }
        await supabase.from("user_profiles").update({ email: email }).eq("id", authData?.userId ?? "");
        saveUser({ ...JSON.parse(localStorage.getItem("itsme_user") || "{}"), email });
        toast.success("Email linked successfully! ✅");
      }
      localStorage.setItem("itsme_logged_in", "true");
      onLogin();
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
  );

  // ── Gradient background wrapper ──────────────────────────────────────────
  const bg = "linear-gradient(160deg, #1a0533 0%, #2d0a52 35%, #4527A0 65%, #7B1FA2 100%)";

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden select-none" style={{ background: bg }}>
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { size: 340, x: -80, y: -60, color: "rgba(124,77,255,0.18)" },
          { size: 260, x: "60%", y: "10%", color: "rgba(224,64,251,0.14)" },
          { size: 300, x: "20%", y: "55%", color: "rgba(63,20,140,0.2)" },
          { size: 200, x: "75%", y: "70%", color: "rgba(194,24,91,0.12)" },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ width: b.size, height: b.size, left: b.x, top: b.y, background: b.color, filter: "blur(60px)", animation: `float ${8 + i * 2}s ease-in-out ${i}s infinite` }} />
        ))}
      </div>

      {/* Header logo */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-4 px-6">
        <div className="w-20 h-20 rounded-[28px] mb-3 flex items-center justify-center shadow-2xl"
          style={{ background: "linear-gradient(135deg,#4527A0,#7C4DFF,#E040FB)", boxShadow: "0 20px 50px rgba(124,77,255,0.5)" }}>
          <span className="text-4xl">💬</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">unifeel</h1>
        <p className="text-purple-300 text-sm mt-0.5" style={{ fontFamily: "'Amiri',serif" }}>unifeel · Social & Digital Platform</p>
      </div>

      {/* Step indicators */}
      <div className="relative z-10 flex items-center justify-center gap-1 px-8 mb-4">
        {[{ n: 1, l: "Number" }, { n: 2, l: "OTP" }, { n: 3, l: "Profile" }, { n: 4, l: "Email" }].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <StepDot step={s.n} current={step} label={s.l} />
            {i < arr.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full mx-1" style={{ background: step > s.n ? "linear-gradient(90deg,#4CAF50,#7C4DFF)" : "rgba(255,255,255,0.15)" }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 px-5 pb-8">
        <div className="w-full max-w-sm mx-auto rounded-3xl p-6 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}>

          {/* ── STEP 1: Phone number ───────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                  style={{ background: "rgba(124,77,255,0.25)", border: "1.5px solid rgba(124,77,255,0.4)" }}>📱</div>
                <h2 className="text-white text-xl font-bold">Enter Your Number</h2>
                <p className="text-purple-300 text-sm mt-1">We'll send a verification code via SMS</p>
                <p className="text-purple-400/70 text-xs mt-0.5">اپنا موبائل نمبر درج کریں</p>
              </div>

              {/* Country + phone input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Country / ملک</label>
                <button
                  onClick={() => setShowCountryPicker(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-sm">{country.name}</p>
                    <p className="text-purple-300 text-xs">{country.code}</p>
                  </div>
                  <ChevronRight size={16} className="text-purple-400" />
                </button>

                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Phone Number / نمبر</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,77,255,0.4)" }}>
                  <Phone size={16} className="text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300 font-bold text-sm flex-shrink-0">{country.code}</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="3001234567"
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base font-semibold"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <p className="text-xs text-purple-400/60 text-center">e.g. 3001234567 for Pakistan</p>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length < 7}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 25px rgba(124,77,255,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending OTP…
                  </span>
                ) : "Send Verification Code →"}
              </button>

              {/* Demo guest button */}
              <button
                onClick={() => {
                  saveUser({ name: "Demo User", phone: "+92300000000", email: "demo@itsme.app", avatar: "https://ui-avatars.com/api/?name=Demo+User&background=7C4DFF&color=fff&size=200", status: "Hey there! I am using unifeel." });
                  localStorage.setItem("itsme_logged_in", "true");
                  onLogin();
                }}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                👤 Continue as Guest (Demo)
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP Verification ────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                  style={{ background: "rgba(76,175,80,0.2)", border: "1.5px solid rgba(76,175,80,0.4)" }}>🔐</div>
                <h2 className="text-white text-xl font-bold">Verify Code</h2>
                <p className="text-purple-300 text-sm mt-1">6-digit code sent to</p>
                <p className="text-white font-bold text-base">{normalizedPhone || fullPhone}</p>
              </div>

              {devOtp && (
                <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,193,7,0.15)", border: "1px solid rgba(255,193,7,0.3)" }}>
                  <p className="text-yellow-300 text-xs font-semibold">🧪 Dev Mode — Your OTP:</p>
                  <p className="text-yellow-200 text-2xl font-extrabold tracking-widest mt-1">{devOtp}</p>
                  <p className="text-yellow-400/60 text-[10px] mt-1">Twilio not configured · SMS not sent</p>
                </div>
              )}

              <OtpInput value={otp} onChange={setOtp} />

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#4CAF50,#1B5E20)", boxShadow: "0 8px 25px rgba(76,175,80,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : "Verify & Continue ✓"}
              </button>

              <div className="flex items-center justify-between">
                <button onClick={() => { setStep(1); setOtp(""); setDevOtp(null); }}
                  className="flex items-center gap-1 text-purple-300 text-sm hover:text-white transition-colors">
                  <ChevronLeft size={14} /> Change Number
                </button>
                {resendTimer > 0 ? (
                  <span className="text-purple-400 text-sm">Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-purple-300 text-sm hover:text-white transition-colors">
                    Resend OTP ↻
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Profile Setup ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-white text-xl font-bold">Set Up Profile</h2>
                <p className="text-purple-300 text-sm mt-1">Tell others who you are</p>
              </div>

              {/* Avatar picker */}
              <div className="flex flex-col items-center">
                <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl"
                    style={{ border: "3px solid rgba(124,77,255,0.6)", background: "rgba(124,77,255,0.2)" }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={36} className="text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>
                    <Camera size={14} color="white" />
                  </div>
                </div>
                <p className="text-purple-400 text-xs mt-2">Tap to add photo</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
              </div>

              {/* Name input */}
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1 block">Full Name *</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,77,255,0.4)" }}>
                  <User size={16} className="text-purple-400 flex-shrink-0" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name / پورا نام"
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm font-medium" />
                </div>
              </div>

              {/* Bio input */}
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1 block">About / Bio</label>
                <div className="px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="What are you about?"
                    rows={2}
                    className="w-full bg-transparent text-white/80 placeholder-white/30 outline-none text-sm resize-none" />
                </div>
              </div>

              <button
                onClick={handleProfileSave}
                disabled={loading || !displayName.trim()}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 25px rgba(124,77,255,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : "Save Profile & Continue →"}
              </button>
            </div>
          )}

          {/* ── STEP 4: Email Attachment ──────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-4xl shadow-xl"
                  style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)" }}>🎉</div>
                <h2 className="text-white text-xl font-bold">Welcome, {displayName}!</h2>
                <p className="text-purple-300 text-sm mt-1">You're all set. Optionally link your email for recovery.</p>
              </div>

              {/* Profile preview card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.3)" }}>
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7C4DFF&color=fff&size=100`}
                  alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-purple-400/50 flex-shrink-0"
                />
                <div>
                  <p className="text-white font-bold">{displayName}</p>
                  <p className="text-purple-300 text-xs">{normalizedPhone}</p>
                  <p className="text-purple-400 text-xs mt-0.5 truncate max-w-[160px]">{bio}</p>
                </div>
              </div>

              {/* Email section */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-purple-400" />
                  <p className="text-white font-semibold text-sm">Link Email (Optional)</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm" />
                  {!emailOtpSent ? (
                    <button onClick={handleSendEmailOtp} disabled={loading}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", color: "white" }}>
                      {loading ? "..." : "Send"}
                    </button>
                  ) : (
                    <Check size={16} className="text-green-400 flex-shrink-0" />
                  )}
                </div>

                {emailOtpSent && (
                  <div>
                    <p className="text-purple-300 text-xs mb-2">Enter code sent to {email}</p>
                    <OtpInput value={emailOtp} onChange={setEmailOtp} />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {emailOtpSent && emailOtp.length === 6 && (
                  <button
                    onClick={() => handleFinish(true)}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#4CAF50,#1B5E20)", boxShadow: "0 8px 25px rgba(76,175,80,0.4)" }}
                  >
                    {loading ? "Verifying…" : "Verify Email & Start →"}
                  </button>
                )}
                <button
                  onClick={() => handleFinish(false)}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: emailOtpSent && emailOtp.length === 6 ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: emailOtpSent && emailOtp.length === 6 ? "none" : "0 8px 25px rgba(124,77,255,0.4)" }}
                >
                  {loading ? "Please wait…" : emailOtpSent && emailOtp.length === 6 ? "Skip Email →" : "🚀 Start Using unifeel →"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/25 text-xs mt-5">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>

      {/* ── Country Picker Modal ────────────────────────────────────────────── */}
      {showCountryPicker && (
        <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="flex-1 flex flex-col max-h-screen bg-[#1a0533] pt-safe">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
              <button onClick={() => setShowCountryPicker(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <X size={18} color="white" />
              </button>
              <h2 className="text-white font-bold text-lg flex-1">Select Country</h2>
            </div>
            {/* Search */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-purple-400">🔍</span>
                <input autoFocus value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..." className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm" />
              </div>
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {filteredCountries.map((c) => (
                <button key={c.iso + c.code} onClick={() => { setCountry(c); setShowCountryPicker(false); setCountrySearch(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 transition-all active:scale-95"
                  style={{ background: country.iso === c.iso ? "rgba(124,77,255,0.2)" : "rgba(255,255,255,0.04)", border: country.iso === c.iso ? "1px solid rgba(124,77,255,0.5)" : "1px solid transparent" }}>
                  <span className="text-2xl">{c.flag}</span>
                  <span className="flex-1 text-white font-medium text-sm text-left">{c.name}</span>
                  <span className="text-purple-300 font-bold text-sm">{c.code}</span>
                  {country.iso === c.iso && <Check size={16} className="text-purple-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
