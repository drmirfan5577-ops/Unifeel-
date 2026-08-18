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
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
      style={{
        background: current > step ? "linear-gradient(135deg,#4CAF50,#2E7D32)" : current === step ? "linear-gradient(135deg,#7C4DFF,#E040FB)" : "rgba(255,255,255,0.15)",
        color: current >= step ? "white" : "rgba(255,255,255,0.5)",
        boxShadow: current === step ? "0 4px 15px rgba(124,77,255,0.5)" : "none",
        transform: current === step ? "scale(1.15)" : "scale(1)",
      }}>
      {current > step ? <Check size={14} /> : step}
    </div>
    <span className="text-[9px] font-medium" style={{ color: current === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>{label}</span>
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
        <input key={i} ref={(el) => { inputs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200"
          style={{ background: digits[i] ? "rgba(124,77,255,0.15)" : "rgba(255,255,255,0.08)", border: digits[i] ? "2px solid #7C4DFF" : "2px solid rgba(255,255,255,0.2)", color: "white", fontSize: "22px", caretColor: "#7C4DFF" }} />
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

  const showDev = new URLSearchParams(window.location.search).has("dev");
  const fullPhone = `${country.code}${phoneNumber.replace(/^0/, "")}`;

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

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
      if (!res.ok || data.error) { toast.error(data.error || "Failed to send OTP"); return; }
      setNormalizedPhone(data.phone || fullPhone);
      if (data.devOtp) { setDevOtp(data.devOtp); toast.info(`Dev mode OTP: ${data.devOtp}`, { duration: 30000 }); }
      else { setDevOtp(null); toast.success("OTP sent to your phone!"); }
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone || fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error || "Invalid OTP"); return; }
      setAuthData({ fakeEmail: data.fakeEmail, tempPassword: data.tempPassword, userId: data.userId });
      toast.success("Phone verified!");
      setStep(3);
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    if (!authData) { toast.error("Session expired. Please restart."); setStep(1); return; }
    setLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: authData.fakeEmail,
        password: authData.tempPassword,
      });
      if (signInError || !signInData?.user) { toast.error("Auth failed: " + (signInError?.message || "unknown")); return; }
      const userId = signInData.user.id;

      let avatarUrl = "";
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("itsme-media").upload(path, avatarFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
          avatarUrl = urlData?.publicUrl || "";
        }
      }

      const phone = normalizedPhone || fullPhone;
      const username = displayName.toLowerCase().replace(/\s+/g, "_") + "_" + phone.slice(-4);

      const { error: profileError } = await supabase.from("user_profiles").upsert({
        id: userId,
        email: authData.fakeEmail,
        phone,
        phone_verified: true,
        display_name: displayName.trim(),
        username,
        bio: bio.trim(),
        avatar_url: avatarUrl,
        is_online: true,
        last_seen: new Date().toISOString(),
      }, { onConflict: "id" });

      if (profileError) { toast.error("Profile save failed: " + profileError.message); return; }

      saveUser({
        id: userId,
        name: displayName.trim(),
        phone,
        email: authData.fakeEmail,
        avatar: avatarUrl,
        bio: bio.trim(),
      });

      toast.success("Profile saved!");
      setStep(4);
    } catch (err) {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.trim() || !email.includes("@")) { toast.error("Enter a valid email address"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setEmailOtpSent(true);
    toast.success("OTP sent to your email!");
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length < 4) { toast.error("Enter the email OTP"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: emailOtp, type: "email" });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (authData) {
      await supabase.from("user_profiles").update({ email }).eq("id", authData.userId);
    }
    toast.success("Email linked successfully!");
    onLogin();
  };

  const handleSkipEmail = () => { onLogin(); };

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
  );

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    border: "2px solid rgba(255,255,255,0.15)",
    color: "white",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "16px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    background: loading ? "rgba(124,77,255,0.5)" : "linear-gradient(135deg,#7C4DFF,#E040FB)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "16px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: loading ? "none" : "0 6px 20px rgba(124,77,255,0.4)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0a0015 0%,#1a0035 50%,#0d001a 100%)" }}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { w: 300, h: 300, top: "10%", left: "10%", color: "rgba(124,77,255,0.15)", dur: "8s" },
          { w: 200, h: 200, top: "60%", right: "15%", color: "rgba(224,64,251,0.12)", dur: "12s" },
          { w: 150, h: 150, top: "40%", left: "5%", color: "rgba(0,188,212,0.1)", dur: "6s" },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full blur-3xl"
            style={{ width: b.w, height: b.h, top: b.top, left: (b as any).left, right: (b as any).right, background: b.color, animation: `pulse ${b.dur} ease-in-out infinite alternate` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 32px rgba(124,77,255,0.5)" }}>
            🌙
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">unifeel</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>آنس می — Connect with Love</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[{ s: 1, l: "Phone" }, { s: 2, l: "OTP" }, { s: 3, l: "Profile" }, { s: 4, l: "Email" }].map(({ s, l }, idx, arr) => (
            <React.Fragment key={s}>
              <StepDot step={s} current={step} label={l} />
              {idx < arr.length - 1 && (
                <div className="flex-1 h-0.5 rounded-full" style={{ background: step > s ? "rgba(124,77,255,0.6)" : "rgba(255,255,255,0.1)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>

          {/* Step 1: Phone */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <Phone size={32} className="mx-auto mb-2" style={{ color: "#7C4DFF" }} />
                <h2 className="text-xl font-bold text-white">Enter your phone</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>We will send a verification code</p>
              </div>

              <button onClick={() => setShowCountryPicker(true)}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.12)", color: "white" }}>
                <span className="text-2xl">{country.flag}</span>
                <span className="font-semibold">{country.name}</span>
                <span className="ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>{country.code} ▾</span>
              </button>

              <div className="flex gap-2">
                <div className="flex items-center px-4 rounded-2xl font-bold text-white"
                  style={{ background: "rgba(124,77,255,0.2)", border: "2px solid rgba(124,77,255,0.4)", whiteSpace: "nowrap" }}>
                  {country.code}
                </div>
                <input type="tel" placeholder="Phone number" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  style={{ ...inputStyle, flex: 1 }} />
              </div>

              <button onClick={handleSendOtp} disabled={loading} style={btnStyle}>
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📲</div>
                <h2 className="text-xl font-bold text-white">Verify OTP</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Sent to {normalizedPhone || fullPhone}</p>
              </div>

              {(devOtp || showDev) && devOtp && (
                <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,193,7,0.15)", border: "1px solid rgba(255,193,7,0.3)" }}>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Dev mode OTP:</p>
                  <p className="text-2xl font-black tracking-widest" style={{ color: "#FFD54F" }}>{devOtp}</p>
                </div>
              )}

              <OtpInput value={otp} onChange={setOtp} />

              <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{ ...btnStyle, opacity: otp.length < 6 ? 0.5 : 1 }}>
                {loading ? "Verifying..." : "Verify →"}
              </button>

              <div className="flex items-center justify-between">
                <button onClick={() => { setStep(1); setOtp(""); }} className="text-xs" style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                  ← Change number
                </button>
                {resendTimer > 0 ? (
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={handleSendOtp} disabled={loading} className="text-xs font-semibold" style={{ color: "#7C4DFF", background: "none", border: "none", cursor: "pointer" }}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <User size={32} className="mx-auto mb-2" style={{ color: "#7C4DFF" }} />
                <h2 className="text-xl font-bold text-white">Your Profile</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Tell us about yourself</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <button onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-all"
                  style={{ background: avatarPreview ? "transparent" : "rgba(124,77,255,0.2)", border: "3px solid rgba(124,77,255,0.5)" }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} style={{ color: "#7C4DFF" }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Camera size={20} className="text-white" />
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <input type="text" placeholder="Your name *" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle} />

              <textarea placeholder="Bio (optional)" value={bio}
                onChange={(e) => setBio(e.target.value)} rows={2}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />

              <button onClick={handleProfileSave} disabled={loading || !displayName.trim()} style={{ ...btnStyle, opacity: !displayName.trim() ? 0.5 : 1 }}>
                {loading ? "Saving..." : "Continue →"}
              </button>
            </div>
          )}

          {/* Step 4: Email (optional) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <Mail size={32} className="mx-auto mb-2" style={{ color: "#7C4DFF" }} />
                <h2 className="text-xl font-bold text-white">Link Email</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Optional — for account recovery</p>
              </div>

              {!emailOtpSent ? (
                <>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendEmailOtp()}
                    style={inputStyle} />

                  <button onClick={handleSendEmailOtp} disabled={loading || !email.includes("@")} style={{ ...btnStyle, opacity: !email.includes("@") ? 0.5 : 1 }}>
                    {loading ? "Sending..." : "Send Email OTP →"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Enter OTP sent to <span style={{ color: "#7C4DFF" }}>{email}</span>
                  </p>
                  <OtpInput value={emailOtp} onChange={setEmailOtp} />
                  <button onClick={handleVerifyEmailOtp} disabled={loading || emailOtp.length < 4} style={{ ...btnStyle, opacity: emailOtp.length < 4 ? 0.5 : 1 }}>
                    {loading ? "Verifying..." : "Verify & Finish →"}
                  </button>
                </>
              )}

              <button onClick={handleSkipEmail} className="w-full py-3 text-sm font-medium rounded-2xl transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                Skip for now
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowCountryPicker(false)}>
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 max-h-[70vh] flex flex-col"
            style={{ background: "linear-gradient(135deg,#1a0035,#0d001a)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select Country</h3>
              <button onClick={() => setShowCountryPicker(false)} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <X size={16} className="text-white" />
              </button>
            </div>
            <input type="text" placeholder="Search country..." value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="mb-3" style={inputStyle} />
            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {filteredCountries.map((c) => (
                <button key={c.iso} onClick={() => { setCountry(c); setShowCountryPicker(false); setCountrySearch(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                  style={{ background: country.iso === c.iso ? "rgba(124,77,255,0.2)" : "rgba(255,255,255,0.04)", border: country.iso === c.iso ? "1px solid rgba(124,77,255,0.5)" : "1px solid transparent", color: "white" }}>
                  <span className="text-2xl">{c.flag}</span>
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <span className="text-sm font-bold" style={{ color: "#7C4DFF" }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
