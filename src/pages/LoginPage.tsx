import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { saveUser } from "@/lib/store";

const inp: React.CSSProperties = { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,77,255,0.4)", borderRadius: 16, padding: "14px 16px", color: "white", width: "100%", outline: "none", fontSize: 16, boxSizing: "border-box" };
const btn: React.CSSProperties = { width: "100%", padding: 16, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#7C4DFF,#E040FB)", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" };

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [normPhone, setNormPhone] = useState("");
  const [name, setName] = useState("");
  const [auth, setAuth] = useState<{ fakeEmail: string; tempPassword: string; userId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const showDev = new URLSearchParams(window.location.search).has("dev");
  const fullPhone = "+92" + phone.replace(/^0/, "");

  const send