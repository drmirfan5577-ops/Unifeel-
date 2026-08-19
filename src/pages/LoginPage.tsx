import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LockKeyhole, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { saveUser } from "@/lib/store";

type LoginPageProps = {
  onLogin: () => void;
};

type AuthCredentials = {
  fakeEmail: string;
  tempPassword: string;
  userId: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

type SendOtpResponse = ApiError & {
  success?: boolean;
  phone?: string;
  devOtp?: string;
};

type VerifyOtpResponse = ApiError &
  Partial<AuthCredentials> & {
    success?: boolean;
  };

const steps = ["Phone", "Code", "Profile"];

async function postJson<T>(url: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong. Please try again.");
  }

  return data;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanPhone = phone.trim();

    if (cleanPhone.replace(/\D/g, "").length < 7) {
      toast.error("Enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const data = await postJson<SendOtpResponse>("/.netlify/functions/send-otp", {
        phone: cleanPhone,
      });
      const normalizedPhone = data.phone || cleanPhone;

      setVerifiedPhone(normalizedPhone);
      setDevOtp(data.devOtp || "");
      setOtp("");
      setStep(2);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to send the verification code."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otp.trim().length < 4) {
      toast.error("Enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const data = await postJson<VerifyOtpResponse>("/.netlify/functions/verify-otp", {
        phone: verifiedPhone,
        otp: otp.trim(),
      });

      if (!data.fakeEmail || !data.tempPassword || !data.userId) {
        throw new Error("The verification response was incomplete. Please try again.");
      }

      setCredentials({
        fakeEmail: data.fakeEmail,
        tempPassword: data.tempPassword,
        userId: data.userId,
      });
      setStep(3);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to verify the code."));
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const displayName = name.trim();

    if (!displayName) {
      toast.error("Enter your name.");
      return;
    }

    if (!credentials) {
      toast.error("Your verification session expired. Start again.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.fakeEmail,
        password: credentials.tempPassword,
      });
      if (signInError) throw signInError;

      const userId = signInData.user?.id || credentials.userId;
      const profile = {
        id: userId,
        email: credentials.fakeEmail,
        phone: verifiedPhone,
        username: verifiedPhone,
        display_name: displayName,
        phone_verified: true,
      };
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert(profile, { onConflict: "id" });
      if (profileError) throw profileError;

      saveUser({
        id: userId,
        name: displayName,
        phone: verifiedPhone,
        email: credentials.fakeEmail,
        username: verifiedPhone,
        status: "Hey there! I am using It's Me.",
      });
      localStorage.setItem("itsme_logged_in", "true");
      onLogin();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to finish signing in."));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setOtp("");
      setDevOtp("");
      setStep(1);
      return;
    }

    setCredentials(null);
    setStep(2);
  };

  return (
    <main className="login-page">
      <div className="login-page__orb login-page__orb--one" />
      <div className="login-page__orb login-page__orb--two" />

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__eyebrow">
          <span className="login-card__mark" aria-hidden="true">i</span>
          <span>It&apos;s Me</span>
        </div>

        <div className="stepper" aria-label={`Step ${step} of 3`}>
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < step;
            const isActive = stepNumber === step;
            return (
              <div className="stepper__item" key={label}>
                <span className={`stepper__dot${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}>
                  {isComplete ? <Check size={13} strokeWidth={3} /> : stepNumber}
                </span>
                <span className={isActive ? "stepper__label is-active" : "stepper__label"}>{label}</span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <form className="login-form" onSubmit={sendOtp}>
            <div>
              <p className="login-form__kicker">Private by design</p>
              <h1 id="login-title">Start with your phone.</h1>
              <p className="login-form__copy">We&apos;ll send a one-time code to confirm it&apos;s really you.</p>
            </div>

            <label className="field">
              <span>Phone number</span>
              <div className="field__control">
                <Phone size={18} />
                <input
                  autoComplete="tel"
                  autoFocus
                  inputMode="tel"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+1 555 012 3456"
                  type="tel"
                  value={phone}
                />
              </div>
            </label>

            <SubmitButton loading={loading} label="Send code" />
          </form>
        )}

        {step === 2 && (
          <form className="login-form" onSubmit={verifyOtp}>
            <div>
              <p className="login-form__kicker">Check your messages</p>
              <h1 id="login-title">Enter the code.</h1>
              <p className="login-form__copy">Sent to <strong>{verifiedPhone}</strong></p>
            </div>

            {devOtp && (
              <div className="dev-code" role="status">
                <span>Development code</span>
                <strong>{devOtp}</strong>
              </div>
            )}

            <label className="field">
              <span>One-time code</span>
              <div className="field__control field__control--code">
                <LockKeyhole size={18} />
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  type="text"
                  value={otp}
                />
              </div>
            </label>

            <SubmitButton loading={loading} label="Verify code" />
            <BackButton disabled={loading} onClick={goBack} label="Use another number" />
          </form>
        )}

        {step === 3 && (
          <form className="login-form" onSubmit={finishLogin}>
            <div>
              <p className="login-form__kicker">One last detail</p>
              <h1 id="login-title">What should we call you?</h1>
              <p className="login-form__copy">This name appears on your profile and can be changed later.</p>
            </div>

            <label className="field">
              <span>Your name</span>
              <div className="field__control">
                <UserRound size={18} />
                <input
                  autoComplete="name"
                  autoFocus
                  maxLength={60}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  type="text"
                  value={name}
                />
              </div>
            </label>

            <SubmitButton loading={loading} label="Enter It's Me" />
            <BackButton disabled={loading} onClick={goBack} label="Back to verification" />
          </form>
        )}
      </section>

      <style>{`
        .login-page {
          --ink: #f8f5ff;
          --muted: #a99ebc;
          --violet: #9e75ff;
          --violet-bright: #c2a8ff;
          min-height: 100%;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          padding: 28px 18px;
          color: var(--ink);
          background:
            radial-gradient(circle at 12% 18%, rgba(111, 65, 181, .34), transparent 34%),
            radial-gradient(circle at 92% 82%, rgba(75, 42, 130, .28), transparent 31%),
            #100b18;
          font-family: "Avenir Next", "Segoe UI", sans-serif;
        }

        .login-page::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .2;
          background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }

        .login-page__orb {
          position: absolute;
          border: 1px solid rgba(194, 168, 255, .15);
          border-radius: 999px;
          pointer-events: none;
        }

        .login-page__orb--one { width: 280px; height: 280px; top: -135px; right: -65px; }
        .login-page__orb--two { width: 190px; height: 190px; bottom: -105px; left: -55px; }

        .login-card {
          width: min(100%, 430px);
          position: relative;
          z-index: 1;
          padding: 30px;
          border: 1px solid rgba(225, 213, 255, .13);
          border-radius: 28px;
          background: rgba(25, 17, 37, .88);
          box-shadow: 0 28px 80px rgba(5, 2, 10, .48);
          backdrop-filter: blur(22px);
          animation: login-card-in .45s ease-out both;
        }

        .login-card__eyebrow { display: flex; align-items: center; gap: 10px; color: var(--violet-bright); font-size: 13px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
        .login-card__mark { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 9px; color: #170d24; background: var(--violet-bright); font: 900 18px/1 Georgia, serif; text-transform: lowercase; transform: rotate(-5deg); }

        .stepper { display: grid; grid-template-columns: repeat(3, 1fr); margin: 28px 0 38px; }
        .stepper__item { display: flex; align-items: center; gap: 8px; color: #71677f; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
        .stepper__dot { display: grid; place-items: center; width: 25px; height: 25px; border: 1px solid #493d58; border-radius: 50%; font-size: 10px; transition: .25s ease; }
        .stepper__dot.is-active { color: #1a1026; border-color: var(--violet-bright); background: var(--violet-bright); box-shadow: 0 0 0 5px rgba(194, 168, 255, .08); }
        .stepper__dot.is-complete { color: var(--violet-bright); border-color: rgba(194,168,255,.42); background: rgba(158,117,255,.12); }
        .stepper__label.is-active { color: var(--ink); }

        .login-form { display: grid; gap: 20px; animation: login-step-in .3s ease-out both; }
        .login-form__kicker { margin: 0 0 8px; color: var(--violet-bright); font: 700 11px/1.2 "Avenir Next", sans-serif; letter-spacing: .14em; text-transform: uppercase; }
        .login-form h1 { margin: 0; max-width: 340px; font: 600 clamp(30px, 8vw, 42px)/1.05 Georgia, serif; letter-spacing: -.035em; }
        .login-form__copy { margin: 13px 0 0; max-width: 350px; color: var(--muted); font-size: 14px; line-height: 1.65; }
        .login-form__copy strong { color: #ded4ed; font-weight: 700; }

        .field { display: grid; gap: 8px; color: #c9bed7; font-size: 12px; font-weight: 700; }
        .field__control { display: flex; align-items: center; gap: 11px; padding: 0 15px; border: 1px solid #433650; border-radius: 14px; color: #8b7c9d; background: rgba(12, 8, 18, .62); transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
        .field__control:focus-within { border-color: var(--violet); box-shadow: 0 0 0 4px rgba(158, 117, 255, .1); transform: translateY(-1px); }
        .field__control input { width: 100%; min-width: 0; padding: 15px 0; border: 0; outline: 0; color: var(--ink); background: transparent; font: inherit; font-size: 16px; }
        .field__control input::placeholder { color: #665b73; }
        .field__control--code input { font-size: 23px; font-weight: 800; letter-spacing: .28em; }

        .dev-code { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 15px; border: 1px dashed rgba(194,168,255,.38); border-radius: 14px; color: #ac9cbd; background: rgba(158,117,255,.08); }
        .dev-code span { font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        .dev-code strong { color: var(--violet-bright); font-size: 20px; letter-spacing: .18em; }

        .login-button { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 50px; padding: 0 18px; border: 0; border-radius: 14px; color: #180e24; background: var(--violet-bright); font: 800 14px/1 "Avenir Next", sans-serif; cursor: pointer; transition: transform .2s ease, background .2s ease, opacity .2s ease; }
        .login-button:hover:not(:disabled) { transform: translateY(-2px); background: #d0bcff; }
        .login-button:active:not(:disabled) { transform: translateY(0); }
        .login-button:disabled { cursor: wait; opacity: .62; }
        .login-button--back { min-height: auto; padding: 5px; color: #9f93ae; background: transparent; font-size: 12px; cursor: pointer; }
        .login-button--back:hover:not(:disabled) { color: var(--ink); background: transparent; transform: none; }
        .login-button svg { flex: 0 0 auto; }
        .login-button .is-spinning { animation: login-spin .8s linear infinite; }

        @keyframes login-card-in { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes login-step-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes login-spin { to { transform: rotate(360deg); } }

        @media (max-width: 460px) {
          .login-page { place-items: end center; padding: 16px 12px; }
          .login-card { padding: 25px 21px; border-radius: 24px; }
          .stepper { margin: 25px 0 34px; }
          .stepper__item { gap: 6px; }
          .stepper__label { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-card, .login-form, .login-button, .field__control { animation: none; transition: none; }
        }
      `}</style>
    </main>
  );
};

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button className="login-button" disabled={loading} type="submit">
      {loading ? <LoaderCircle className="is-spinning" size={18} /> : <ArrowRight size={18} />}
      {loading ? "Please wait" : label}
    </button>
  );
}

function BackButton({ disabled, label, onClick }: { disabled: boolean; label: string; onClick: () => void }) {
  return (
    <button className="login-button login-button--back" disabled={disabled} onClick={onClick} type="button">
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}

export default LoginPage;
