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

const StepDot: React.FC<{ step: number; current: number; label: string }> = ({ step, current, label }) => {
  const done = current > step; const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={{ background: done ? "linear-gradient(135deg,#4CAF50,#2E7D32)" : active ? "linear-gradient(135deg,#7C4DFF,#E040FB)" : "rgba(255,255,255,0.15)",
          color: done || active ? "white" : "rgba(255,255,255,0.5)", boxShadow: active ? "0 4px 15px rgba(124,77,255,0.5)" : "none", transform: active ? "scale(1.15)" : "scale(1)" }}>
        {done ? <Check size={14} /> : step}
      </div>
      <span className="text-[9px] font-medium" style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
};

const OtpInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
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
        <input key={i} ref={(el) => { inputs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200"
          style={{ background: digits[i] ? "rgba(124,77,255,0.15)" : "rgba(255,255,255,0.08)", border: digits[i] ? "2px solid #7C4DFF" : "2px solid rgba(255,255,255,0.2)",
            color: "white", fontSize: "22px", caretColor: "#7C4DFF" }} />
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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");