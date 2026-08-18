import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";
import { Camera, Check, ChevronLeft, ChevronRight, Mail, Phone, User, X, Globe } from "lucide-react";

interface LoginPageProps { onLogin: () => void; }

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

const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = (i: number, v: string) => {
    const only = v.replace(/\D/g, "").slice(0, 1);
    const arr = digits.map((d, idx) => (idx === i ? only : d));
    onChange(arr.join(""));
    if (only && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const arr = digits.map((d, idx) => (idx === i - 1 ? "" : d));
      onChange(arr.join(""));
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
          className="w-11 h-14 text-center font-bold rounded-2xl outline-none transition-all duration-200"
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
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [verifyData, setVerifyData] = useState<{ fakeEmail: string; tempPassword: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("Hey there! I am using Unifeel.");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const fullPhone = `${country.code}${phoneNumber.replace(/^0+/, "")}`;

  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      // Try OnSpace edge function first, fallback to netlify function
      let data: any = null;
      let err: any = null;

      try {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone }),
        });
        if (res.ok) data = await res.json();
        else err = await res.json();
      } catch {
        // Try supabase edge function
        const { data: d, error: e } = await supabase.functions.invoke("send-otp", {
          body: { phone: fullPhone },
        });
        data = d; err = e;
      }

      if (err && !data) throw new Error(err?.message || "Failed to send OTP");

      if (data?.devOtp) {
        setDevOtp(data.devOtp);
        toast.success(`Dev mode — OTP: ${data.devOtp}`, { duration: 30000 });
      } else if (data?.smsSent) {
        toast.success(`OTP sent to ${fullPhone}`);
      } else {
        const otp = data?.devOtp || "";
        if (otp) setDevOtp(otp);
        toast.info(data?.message || "OTP generated");
      }
      startResendTimer();
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      let data: any = null;
      let err: any = null;

      try {
        const res = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: fullPhone, otp }),
        });
        if (res.ok) data = await res.json();
        else err = await res.json();
      } catch {
        const { data: d, error: e } = await supabase.functions.invoke("verify-otp", {
          body: { phone: fullPhone, otp },
        });
        data = d; err = e;
      }

      if (err && !data) throw new Error(err?.message || "Verification failed");
      if (!data?.verified) throw new Error(data?.error || "Invalid OTP");

      // Sign in with the returned credentials
      if (data.fakeEmail && data.tempPassword) {
        setVerifyData({ fakeEmail: data.fakeEmail, tempPassword: data.tempPassword });
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.fakeEmail,
          password: data.tempPassword,
        });
        if (signInErr) console.warn("Auto sign-in:", signInErr.message);
      }

      toast.success("Phone verified!");
      if (data.isNewUser) {
        setStep(3);
      } else {
        // Existing user — skip profile setup
        completeLogin(data);
      }
    } catch (e: any) {
      toast.error(e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data?: any) => {
    saveUser({
      id: data?.userId || "user",
      name: displayName || data?.phone || fullPhone,
      phone: fullPhone,
      avatar: avatarPreview || "",
    });
    localStorage.setItem("itsme_logged_in", "true");
    onLogin();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let avatarUrl = avatarPreview;

        // Upload avatar if selected
        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop();
          const path = `${user.id}/avatar.${ext}`;
          const { data: upData } = await supabase.storage
            .from("itsme-media")
            .upload(path, avatarFile, { upsert: true });
          if (upData) {
            const { data: urlData } = supabase.storage.from("itsme-media").getPublicUrl(path);
            avatarUrl = urlData.publicUrl;
          }
        }

        await supabase.from("user_profiles").upsert({
          id: user.id,
          display_name: displayName,
          username: displayName.toLowerCase().replace(/\s+/g, "_"),
          bio,
          avatar_url: avatarUrl,
          phone: fullPhone,
          phone_verified: true,
        }, { onConflict: "id" });

        await supabase.auth.updateUser({ data: { display_name: displayName, avatar_url: avatarUrl } });
      }
      toast.success("Profile saved!");
      setStep(4);
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEmail = async () => {
    if (!emailSent) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { toast.error("Enter a valid email"); return; }
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        if (error) throw error;
        setEmailSent(true);
        toast.success(`Verification sent to ${email}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to send email OTP");
      } finally {
        setLoading(false);
      }
    } else {
      if (emailOtp.length < 6) { toast.error("Enter the 6-digit code"); return; }
      setLoading(true);
      try {
        const { error } = await supabase.auth.verifyOtp({ email, token: emailOtp, type: "email" });
        if (error) throw error;
        toast.success("Email linked successfully!");
        completeLogin();
      } catch (e: any) {
        toast.error(e.message || "Invalid email OTP");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #1a0533 0%, #0d1b3e 40%, #0a2a1f 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={bgStyle}>
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 300, height: 300, top: "-80px", left: "-80px", background: "radial-gradient(circle, rgba(124,77,255,0.3), transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ width: 250, height: 250, bottom: "10%", right: "-60px", background: "radial-gradient(circle, rgba(0,150,136,0.25), transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ width: 200, height: 200, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(224,64,251,0.15), transparent 70%)" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-3 shadow-2xl"
          style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB,#00BCD4)" }}>
          <span className="text-4xl">💬</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Unifeel</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>یونی فیل — Connect & Communicate</p>
      </div>

      {/* Step indicators */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        {[
          { s: 1, l: "Phone" },
          { s: 2, l: "OTP" },
          { s: 3, l: "Profile" },
          { s: 4, l: "Email" },
        ].map(({ s, l }, i) => (
          <React.Fragment key={s}>
            <StepDot step={s} current={step} label={l} />
            {i < 3 && (
              <div className="w-8 h-px" style={{ background: step > s ? "rgba(124,77,255,0.8)" : "rgba(255,255,255,0.2)" }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
        style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>

        {/* Step 1: Phone number */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Enter Phone Number</h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                We'll send a 6-digit verification code via SMS
              </p>
            </div>

            {/* Country selector */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "white" }}
                onClick={() => setShowCountryList(!showCountryList)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-medium text-sm">{country.name}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{country.code}</span>
                </span>
                <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.5)", transform: showCountryList ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {showCountryList && (
                <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: "rgba(20,10,50,0.98)", border: "1.5px solid rgba(124,77,255,0.3)", maxHeight: "220px", overflowY: "auto" }}>
                  <div className="px-3 py-2 sticky top-0" style={{ background: "rgba(20,10,50,0.98)" }}>
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl outline-none text-sm text-white"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                    />
                  </div>
                  {filteredCountries.map((c) => (
                    <button
                      key={c.iso}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
                      onClick={() => { setCountry(c); setShowCountryList(false); setCountrySearch(""); }}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span className="text-sm text-white flex-1">{c.name}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone input */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
              <Phone size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              <span className="text-white font-medium text-sm">{country.code}</span>
              <input
                type="tel"
                placeholder="300 1234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s-]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="flex-1 bg-transparent outline-none text-white text-sm"
                style={{ caretColor: "#7C4DFF" }}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{ background: loading ? "rgba(124,77,255,0.5)" : "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 25px rgba(124,77,255,0.4)" }}
            >
              {loading ? "Sending..." : "Send Verification Code →"}
            </button>
          </div>
        )}

        {/* Step 2: OTP verification */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-xl font-bold text-white mb-1">Verify Code</h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Sent to <span className="text-purple-400">{fullPhone}</span>
              </p>
            </div>

            {devOtp && (
              <div className="px-4 py-2 rounded-xl text-center text-sm font-bold" style={{ background: "rgba(255,193,7,0.15)", border: "1px solid rgba(255,193,7,0.4)", color: "#FFC107" }}>
                Dev Mode OTP: {devOtp}
              </div>
            )}

            <OtpInput value={otp} onChange={setOtp} />

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{ background: otp.length === 6 && !loading ? "linear-gradient(135deg,#7C4DFF,#E040FB)" : "rgba(124,77,255,0.3)", boxShadow: otp.length === 6 ? "0 8px 25px rgba(124,77,255,0.4)" : "none" }}
            >
              {loading ? "Verifying..." : "Verify & Continue →"}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Resend in {resendTimer}s</p>
              ) : (
                <button
                  onClick={() => { setOtp(""); handleSendOtp(); }}
                  className="text-xs font-medium"
                  style={{ color: "#7C4DFF" }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Profile setup */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Set Up Profile</h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Tell your contacts who you are</p>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden"
                style={{ background: avatarPreview ? "transparent" : "rgba(124,77,255,0.2)", border: "3px solid rgba(124,77,255,0.5)" }}
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} style={{ color: "rgba(124,77,255,0.8)" }} />
                )}
                <div className="absolute bottom-0 inset-x-0 py-1 text-center text-xs font-medium"
                  style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.9)" }}>
                  {avatarPreview ? "Change" : "Add Photo"}
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
              <User size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-sm"
                style={{ caretColor: "#7C4DFF" }}
              />
            </div>

            {/* Bio */}
            <textarea
              placeholder="About / Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-transparent outline-none text-white text-sm resize-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", caretColor: "#7C4DFF" }}
            />

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{ background: loading ? "rgba(76,175,80,0.5)" : "linear-gradient(135deg,#4CAF50,#00BCD4)", boxShadow: "0 8px 25px rgba(76,175,80,0.35)" }}
            >
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          </div>
        )}

        {/* Step 4: Email link (optional) */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Link Email <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>(Optional)</span></h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Add email for account recovery and extra security</p>
            </div>

            {!emailSent ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                  <Mail size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white text-sm"
                    style={{ caretColor: "#7C4DFF" }}
                  />
                </div>
                <button
                  onClick={handleLinkEmail}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 25px rgba(124,77,255,0.4)" }}
                >
                  {loading ? "Sending..." : "Send Verification →"}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Code sent to <span className="text-purple-400">{email}</span>
                </p>
                <OtpInput value={emailOtp} onChange={setEmailOtp} />
                <button
                  onClick={handleLinkEmail}
                  disabled={loading || emailOtp.length < 6}
                  className="w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#7C4DFF,#E040FB)", boxShadow: "0 8px 25px rgba(124,77,255,0.4)" }}
                >
                  {loading ? "Verifying..." : "Verify Email →"}
                </button>
              </>
            )}

            {/* Skip */}
            <button
              onClick={() => completeLogin()}
              className="w-full py-3 rounded-2xl font-medium text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Skip for now
            </button>

            <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              You can add email later from Settings
            </p>
          </div>
        )}
      </div>

      {/* Terms */}
      <p className="relative z-10 mt-6 text-center text-xs px-4" style={{ color: "rgba(255,255,255,0.3)" }}>
        By continuing, you agree to our{" "}
        <span className="text-purple-400 cursor-pointer">Terms of Service</span> &{" "}
        <span className="text-purple-400 cursor-pointer">Privacy Policy</span>
      </p>
    </div>
  );
};

export default LoginPage;
