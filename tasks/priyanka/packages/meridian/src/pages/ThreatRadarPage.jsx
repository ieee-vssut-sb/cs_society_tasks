import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  ShieldAlert, ShieldCheck, ShieldOff, ShieldX,
  Wifi, Globe, Building2, Server, Smartphone,
  MapPin, Clock, Search, Trash2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Info, Zap, Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import cityVideoPath from "@assets/272318_medium_1782326045457.mp4";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function analyzeIP(ip) {
  // ip-api.com free tier — returns proxy, hosting, mobile, ASN, etc.
  const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`;
  const { data } = await axios.get(url, { timeout: 8000 });
  if (data.status !== "success") throw new Error(data.message || "IP lookup failed");
  return data;
}

function computeThrustScore(data) {
  let score = 100;
  const flags = [];

  if (data.proxy) {
    score -= 35;
    flags.push({ label: "Proxy / VPN Detected", severity: "high", icon: "🔒" });
  }
  if (data.hosting) {
    score -= 25;
    flags.push({ label: "Datacenter / Hosting IP", severity: "medium", icon: "🖥️" });
  }
  if (data.mobile) {
    score -= 5;
    flags.push({ label: "Mobile Network", severity: "low", icon: "📱" });
  }

  // Heuristic: well-known anonymous ASNs
  const asnStr = (data.as || "").toUpperCase();
  const suspectASNs = ["AS9009", "AS60068", "AS14061", "AS16276", "AS24940", "AS20473", "AS12876"];
  if (suspectASNs.some((a) => asnStr.startsWith(a))) {
    score -= 15;
    flags.push({ label: "Known Hosting/VPN ASN", severity: "medium", icon: "⚠️" });
  }

  if (!data.reverse || data.reverse === data.query) {
    score -= 5;
    flags.push({ label: "No Reverse DNS (PTR)", severity: "low", icon: "🔍" });
  }

  if (flags.length === 0) {
    flags.push({ label: "No Threats Detected", severity: "safe", icon: "✅" });
  }

  return { score: Math.max(0, score), flags };
}

function ScoreRing({ score }) {
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 80 ? "#00FF88" : score >= 50 ? "#FFD700" : "#FF4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1), stroke 0.5s", filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="font-mono text-[9px] text-[#888880] uppercase tracking-widest mt-0.5">Trust Score</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg = {
    high:   { bg: "bg-red-500/15",    border: "border-red-500/30",    text: "text-red-400",    label: "HIGH" },
    medium: { bg: "bg-amber-500/15",  border: "border-amber-500/30",  text: "text-amber-400",  label: "MED"  },
    low:    { bg: "bg-blue-500/15",   border: "border-blue-500/30",   text: "text-blue-400",   label: "LOW"  },
    safe:   { bg: "bg-green-500/15",  border: "border-green-500/30",  text: "text-green-400",  label: "SAFE" },
  }[severity] || {};
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function ShieldIcon({ score }) {
  if (score >= 80) return <ShieldCheck className="w-6 h-6 text-[#00FF88]" style={{ filter: "drop-shadow(0 0 6px #00FF8888)" }} />;
  if (score >= 50) return <ShieldAlert className="w-6 h-6 text-[#FFD700]" style={{ filter: "drop-shadow(0 0 6px #FFD70088)" }} />;
  return <ShieldX className="w-6 h-6 text-red-400" style={{ filter: "drop-shadow(0 0 6px #FF444488)" }} />;
}

const HISTORY_KEY = "meridian_threat_history";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ThreatRadarPage() {
  const { toast } = useToast();

  const [ip, setIp]           = useState("");
  const [result, setResult]   = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  });
  const [expanded, setExpanded] = useState({});
  const inputRef = useRef(null);

  const saveHistory = (entries) => {
    setHistory(entries);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  };

  const handleScan = async (overrideIp) => {
    const target = (overrideIp || ip).trim();
    if (!target) { toast({ title: "Enter an IP address", variant: "destructive" }); return; }

    setLoading(true);
    setResult(null);
    setAnalysis(null);

    try {
      const data     = await analyzeIP(target);
      const { score, flags } = computeThrustScore(data);

      setResult(data);
      setAnalysis({ score, flags });

      const entry = {
        id:        Date.now(),
        ip:        data.query,
        city:      data.city,
        country:   data.country,
        countryCode: data.countryCode,
        score,
        proxy:     data.proxy,
        hosting:   data.hosting,
        mobile:    data.mobile,
        isp:       data.isp,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...history.filter((h) => h.ip !== data.query)].slice(0, 20);
      saveHistory(updated);
    } catch (err) {
      toast({ title: "Scan Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const countryFlag = (code) => {
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 127397));
  };

  const scoreColor = (s) => s >= 80 ? "#00FF88" : s >= 50 ? "#FFD700" : "#FF4444";

  return (
    <div className="page-enter min-h-screen w-full bg-black text-[#F5F5F0] font-sans relative">
      {/* BG video */}
      <video src={cityVideoPath} autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 z-10 bg-black/70" />
      <div className="fixed inset-0 z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,68,68,0.05) 0%, transparent 60%)" }} />

      <div className="relative z-20 max-w-5xl mx-auto px-4 pt-6 pb-32">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldOff className="w-5 h-5 text-red-400" style={{ filter: "drop-shadow(0 0 6px #FF444488)" }} />
              <h1 className="font-serif italic text-3xl font-medium tracking-wide">Threat Radar</h1>
            </div>
            <p className="text-[#888880] text-xs font-mono tracking-widest uppercase">IP Reputation · VPN · Proxy · Hosting Detection</p>
          </div>
          {history.length > 0 && (
            <button onClick={() => saveHistory([])}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl font-mono text-xs tracking-widest uppercase transition-all cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {/* ── Search bar ── */}
        <div className="glass-card p-6 mb-8">
          <label className="block font-mono text-[9px] text-[#888880] uppercase tracking-widest mb-3">Target IP Address</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                ref={inputRef}
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="e.g. 8.8.8.8 or 1.1.1.1"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00FFD8]/50 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-white placeholder-[#555] outline-none transition-all duration-300"
              />
            </div>
            <button onClick={() => handleScan()} disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs tracking-widest uppercase font-bold bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,68,68,0.08)] hover:shadow-[0_0_30px_rgba(255,68,68,0.35)] cursor-pointer disabled:opacity-50">
              {loading ? <span className="animate-spin">◌</span> : <Search className="w-4 h-4" />}
              {loading ? "Scanning…" : "Scan IP"}
            </button>
          </div>
          <p className="font-mono text-[10px] text-[#555] mt-3 flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Detection powered by ip-api.com · Proxy · VPN · Hosting · ASN · Reverse DNS analysis
          </p>
        </div>

        {/* ── Result panel ── */}
        {result && analysis && (
          <div className="glass-card p-6 mb-8 animate-[pageEnter_0.5s_ease_forwards]">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-white/5 mb-6">
              <ScoreRing score={analysis.score} />

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldIcon score={analysis.score} />
                  <div>
                    <p className="font-mono text-xs text-[#888880] uppercase tracking-widest">Scanned IP</p>
                    <p className="font-mono text-2xl text-white font-bold">{result.query}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-mono text-xs text-[#888880]">
                      {countryFlag(result.countryCode)} {result.city}, {result.country}
                    </p>
                    <p className="font-mono text-[10px] text-[#555] mt-0.5">{result.timezone}</p>
                  </div>
                </div>

                {/* Threat flags */}
                <div className="flex flex-wrap gap-2">
                  {analysis.flags.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span>{f.icon}</span>
                      <span className="font-mono text-xs text-[#F5F5F0]">{f.label}</span>
                      <SeverityBadge severity={f.severity} />
                    </div>
                  ))}
                </div>

                {/* Quick indicators */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { icon: Wifi,        label: "Proxy/VPN",  val: result.proxy   ? "YES" : "NO",  danger: result.proxy   },
                    { icon: Server,      label: "Hosting",    val: result.hosting ? "YES" : "NO",  danger: result.hosting },
                    { icon: Smartphone,  label: "Mobile",     val: result.mobile  ? "YES" : "NO",  danger: false          },
                  ].map(({ icon: Icon, label, val, danger }) => (
                    <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono ${danger ? "bg-red-500/8 border-red-500/25 text-red-400" : "bg-white/[0.03] border-white/5 text-[#888880]"}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}:</span>
                      <span className={`font-bold ${danger ? "text-red-400" : "text-[#00FF88]"}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {[
                { icon: Building2, label: "ISP",           val: result.isp       },
                { icon: Building2, label: "Organisation",  val: result.org       },
                { icon: Zap,       label: "ASN",           val: result.as        },
                { icon: Globe,     label: "ASN Name",      val: result.asname    },
                { icon: Eye,       label: "Reverse DNS",   val: result.reverse || "—" },
                { icon: MapPin,    label: "Region",        val: result.regionName },
                { icon: Clock,     label: "Timezone",      val: result.timezone  },
                { icon: MapPin,    label: "Postal",        val: result.zip || "—" },
                { icon: Globe,     label: "Coordinates",   val: `${result.lat?.toFixed(3)}, ${result.lon?.toFixed(3)}` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="space-y-1">
                  <p className="font-mono text-[9px] text-[#888880] uppercase tracking-widest flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />{label}
                  </p>
                  <p className="font-mono text-[#F5F5F0] truncate" title={val}>{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scan history ── */}
        {history.length > 0 && (
          <div>
            <h2 className="font-mono text-xs text-[#888880] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Scans
            </h2>
            <div className="space-y-3">
              {history.map((entry) => {
                const isOpen = expanded[entry.id];
                const sc     = entry.score;
                const color  = scoreColor(sc);
                return (
                  <div key={entry.id} className="glass-card overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [entry.id]: !p[entry.id] }))}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={{ background: `${color}14`, borderColor: `${color}30` }}>
                        <span className="font-mono text-xs font-bold" style={{ color }}>{sc}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-mono text-sm text-white">{entry.ip}</p>
                        <p className="font-mono text-[10px] text-[#888880] mt-0.5">
                          {countryFlag(entry.countryCode)} {entry.city}, {entry.country} · {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.proxy   && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400">PROXY</span>}
                        {entry.hosting && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400">HOSTING</span>}
                        {entry.mobile  && <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400">MOBILE</span>}
                        <button onClick={(e) => { e.stopPropagation(); handleScan(entry.ip); }}
                          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 transition-all cursor-pointer">
                          <Search className="w-3 h-3" /> Re-scan
                        </button>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 border-t border-white/5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs font-mono">
                          <div><span className="text-[#555] block mb-0.5 text-[9px] uppercase tracking-wider">ISP</span><span className="text-[#F5F5F0]">{entry.isp}</span></div>
                          <div><span className="text-[#555] block mb-0.5 text-[9px] uppercase tracking-wider">Trust Score</span><span style={{ color: scoreColor(entry.score) }} className="font-bold">{entry.score}/100</span></div>
                          <div><span className="text-[#555] block mb-0.5 text-[9px] uppercase tracking-wider">Scanned At</span><span className="text-[#F5F5F0]">{new Date(entry.timestamp).toLocaleTimeString()}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && !result && !loading && (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/5 border border-red-500/15 flex items-center justify-center">
              <ShieldOff className="w-8 h-8 text-red-400/50 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-sans font-bold">No Scans Yet</h2>
              <p className="text-[#888880] text-sm max-w-md mx-auto">
                Enter any IPv4 address above and hit Scan to check for proxies, VPNs, hosting providers,
                ASN reputation, and more — all in seconds.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
              {["8.8.8.8", "1.1.1.1", "185.220.101.1"].map((ex) => (
                <button key={ex} onClick={() => { setIp(ex); setTimeout(() => handleScan(ex), 50); }}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-red-500/30 text-[#888880] hover:text-red-400 bg-white/[0.02] hover:bg-red-500/5 transition-all cursor-pointer">
                  Try {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
