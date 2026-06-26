import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoto } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Lock, LogIn, UserPlus, ShieldCheck, ShieldOff } from "lucide-react";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, register, isFirebaseConfigured } = useAuth();
  const goto      = useGoto();
  const { toast } = useToast();

  const [tab, setTab]           = useState("signin"); // "signin" | "register"
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // form fields
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");

  const success = (msg) => { toast({ title: msg }); goto("/compare"); };
  const fail    = (msg) => toast({ title: "Error", description: msg, variant: "destructive" });

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      success("Signed in with Google 🚀");
    } catch (e) { fail(e.message); }
    finally { setLoading(false); }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return fail("Please fill in all fields.");
    setLoading(true);
    try {
      await loginWithEmail({ email, password });
      success("Welcome back! 🌟");
    } catch (e) { fail(e.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return fail("Please fill in all fields.");
    if (password !== confirm) return fail("Passwords do not match.");
    if (password.length < 6) return fail("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register({ name, email, password });
      success("Account created! Welcome to Meridian 🎉");
    } catch (e) { fail(e.message); }
    finally { setLoading(false); }
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 focus:border-[#00FFD8]/50 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[#555] outline-none transition-all duration-300";

  return (
    <div className="page-enter min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden px-4">

      {/* Ambient glows */}
      <div className="absolute w-[700px] h-[700px] rounded-full z-0 opacity-20 blur-[140px] pointer-events-none"
        style={{ top: "-15%", left: "-15%", background: "radial-gradient(circle, #8a2be2 0%, transparent 80%)" }} />
      <div className="absolute w-[700px] h-[700px] rounded-full z-0 opacity-15 blur-[140px] pointer-events-none"
        style={{ bottom: "-15%", right: "-15%", background: "radial-gradient(circle, #00FFD8 0%, transparent 80%)" }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 onClick={() => goto("/")} className="font-serif italic font-medium text-5xl text-center text-white cursor-pointer select-none mb-2"
            style={{
              background: "linear-gradient(to bottom, #ffffff 30%, #FFEFC6 85%, #FFD700 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 12px rgba(255,215,0,0.18))",
            }}>
            Meridian
          </h1>
          <p className="text-[#888880] text-xs font-mono tracking-[0.22em] uppercase">IP Geolocation Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.025] border border-white/10 hover:border-[#00FFD8]/20 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,255,216,0.04)] transition-all duration-500">

          {/* Tab switcher */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 gap-1">
            {[["signin", "Sign In", LogIn], ["register", "Register", UserPlus]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs tracking-widest uppercase font-bold transition-all duration-300 ${
                  tab === key
                    ? "bg-[#00FFD8]/15 text-[#00FFD8] border border-[#00FFD8]/30 shadow-[0_0_15px_rgba(0,255,216,0.1)]"
                    : "text-[#888880] hover:text-white"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ─── Sign In tab ─────────────────────────────────────── */}
          {tab === "signin" && (
            <>
              {/* Google button — only on Sign In */}
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-bold transition-all duration-300 bg-white/[0.05] hover:bg-white/[0.10] border border-white/15 hover:border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] cursor-pointer mb-2 disabled:opacity-50">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ height: "18px" }} />
                Continue with Google
              </button>

              {/* Firebase status badge */}
              <div className={`flex items-center justify-center gap-1.5 mb-4 text-[10px] font-mono ${isFirebaseConfigured ? "text-[#00FF88]" : "text-[#888880]"}`}>
                {isFirebaseConfigured
                  ? <><ShieldCheck className="w-3 h-3" /> Real Google OAuth active</>
                  : <><ShieldOff className="w-3 h-3" /> Demo mode — <span className="text-[#00FFD8] underline cursor-pointer" onClick={() => window.open("https://console.firebase.google.com", "_blank")}>add Firebase config</span> to enable real login</>
                }
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="font-mono text-[10px] text-[#555] tracking-widest uppercase">or sign in with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00FFD8] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-bold transition-all duration-300 bg-[#00FFD8]/10 hover:bg-[#00FFD8] border border-[#00FFD8]/30 hover:border-[#00FFD8] text-[#00FFD8] hover:text-black shadow-[0_0_20px_rgba(0,255,216,0.08)] hover:shadow-[0_0_30px_rgba(0,255,216,0.35)] cursor-pointer disabled:opacity-50">
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
                <p className="text-center text-xs text-[#888880] font-mono">
                  No account?{" "}
                  <button type="button" onClick={() => setTab("register")} className="text-[#00FFD8] hover:underline cursor-pointer">Register here</button>
                </p>
              </form>
            </>
          )}

          {/* ─── Register tab (email only, no Google) ────────────── */}
          {tab === "register" && (
            <>
              <div className="mb-5 p-3.5 bg-[#00FFD8]/5 border border-[#00FFD8]/15 rounded-xl">
                <p className="text-[#00FFD8] text-[10px] font-mono tracking-wider">
                  ✦ Registration creates a local account stored on this device.
                  For Google login, use the Sign In tab.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type="text" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type={showPass ? "text" : "password"} placeholder="Password (min. 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#00FFD8] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                  <input type={showPass ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-bold transition-all duration-300 bg-[#00FFD8]/10 hover:bg-[#00FFD8] border border-[#00FFD8]/30 hover:border-[#00FFD8] text-[#00FFD8] hover:text-black shadow-[0_0_20px_rgba(0,255,216,0.08)] hover:shadow-[0_0_30px_rgba(0,255,216,0.35)] cursor-pointer disabled:opacity-50">
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
                <p className="text-center text-xs text-[#888880] font-mono">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("signin")} className="text-[#00FFD8] hover:underline cursor-pointer">Sign in</button>
                </p>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[#555] text-[10px] font-mono mt-4 tracking-wider">
          Your data stays on this device · No external servers · No tracking
        </p>
      </div>
    </div>
  );
}
