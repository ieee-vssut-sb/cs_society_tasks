import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoto } from "@/App";
import {
  Compass,
  Trash2,
  Calendar,
  ArrowRight,
  TrendingUp,
  CloudSun,
  MapPin,
  RefreshCw,
} from "lucide-react";
import cityVideoPath from "@assets/272318_medium_1782326045457.mp4";

export default function HistoryPage() {
  const { user } = useAuth();
  const goto = useGoto();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      const records = JSON.parse(
        localStorage.getItem(`meridian_history_${user.email.toLowerCase()}`) || "[]"
      );
      // Sort by newest first
      records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(records);
    }
  }, [user]);

  const handleDelete = (id) => {
    const updated = history.filter((r) => r.id !== id);
    setHistory(updated);
    localStorage.setItem(
      `meridian_history_${user.email.toLowerCase()}`,
      JSON.stringify(updated)
    );
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire comparison history?")) {
      setHistory([]);
      localStorage.removeItem(`meridian_history_${user.email.toLowerCase()}`);
    }
  };

  const countryFlag = (code) => {
    if (!code) return "";
    return String.fromCodePoint(
      ...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 127397)
    );
  };

  return (
    <div className="page-enter min-h-screen w-full bg-black text-[#F5F5F0] font-sans selection:bg-[#00FFD8] selection:text-black relative">
      {/* Background Video */}
      <video
        src={cityVideoPath}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div className="fixed inset-0 z-10 bg-black/65" />
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,216,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-20 max-w-4xl mx-auto px-4 pt-6 pb-32">
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="font-serif italic text-3xl font-medium tracking-wide">
              Analysis History
            </h1>
            <p className="text-[#888880] text-xs font-mono mt-1">
              REVIEW AND LOG PREVIOUS CORRELATIONS
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl font-mono text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.05)] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.02)]">
              <Compass className="w-8 h-8 text-[#888880] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-sans font-bold">No Records Logged</h2>
              <p className="text-[#888880] text-sm max-w-md mx-auto">
                You haven't run any geospatial comparisons yet. Compute the distance between two IP locations to register your first record.
              </p>
            </div>
            <button
              onClick={() => goto("/compare")}
              className="px-8 py-3 rounded-full font-mono text-xs tracking-widest uppercase font-bold bg-[#00FFD8]/10 hover:bg-[#00FFD8] border border-[#00FFD8]/30 hover:border-[#00FFD8] text-[#00FFD8] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,216,0.1)] cursor-pointer"
            >
              Start Analysis →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((record) => (
              <div
                key={record.id}
                className="glass-card p-6 flex flex-col space-y-5 hover:border-[#00FFD8]/30 transition-all duration-300"
              >
                {/* Record Header */}
              <div className="text-lg font-semibold text-[#00FFD8]">{record.name || 'Unnamed Record'}</div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-[#888880] text-xs font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newName = window.prompt('Enter a name for this record:', record.name || '');
                          if (newName !== null) {
                            const updated = history.map(r => r.id === record.id ? { ...r, name: newName } : r);
                            setHistory(updated);
                            localStorage.setItem(`meridian_history_${user.email.toLowerCase()}`, JSON.stringify(updated));
                          }
                        }}
                        className="text-[#00FFD8] hover:text-[#00FF88] p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                        title="Rename Entry"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-[#888880] hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </div>

                {/* Compare Layout */}
                <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                  {/* Origin */}
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-[10px] text-[#00FF88] font-mono tracking-widest uppercase">
                      Origin Point
                    </p>
                    <h3 className="text-xl font-bold flex items-center gap-2 truncate">
                      <span>{countryFlag(record.loc1.countryCode)}</span>
                      <span className="truncate">{record.loc1.city}</span>
                    </h3>
                    <p className="font-mono text-xs text-[#888880] truncate">{record.ip1}</p>
                  </div>

                  {/* Distance Path */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center py-2 md:py-0">
                    <span className="font-serif italic text-2xl text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.2)]">
                      {Math.round(record.distance).toLocaleString()} km
                    </span>
                    <div className="w-full flex items-center gap-2 mt-1 px-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                      <div className="flex-1 h-px border-t border-dashed border-white/20" />
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
                      <div className="flex-1 h-px border-t border-dashed border-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                    </div>
                    <span className="font-mono text-[9px] text-[#888880] tracking-wider mt-1">
                      {Math.round(record.distance * 0.621371).toLocaleString()} miles
                    </span>
                  </div>

                  {/* Remote */}
                  <div className="md:col-span-2 space-y-1 text-left md:text-right">
                    <p className="text-[10px] text-[#FF6B00] font-mono tracking-widest uppercase">
                      Remote Point
                    </p>
                    <h3 className="text-xl font-bold flex items-center justify-start md:justify-end gap-2 truncate">
                      <span className="md:order-last">{countryFlag(record.loc2.countryCode)}</span>
                      <span className="truncate">{record.loc2.city}</span>
                    </h3>
                    <p className="font-mono text-xs text-[#888880] truncate">{record.ip2}</p>
                  </div>
                </div>

                {/* Localized Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/5 text-xs text-[#888880]">
                  <div>
                    <span className="block font-mono text-[9px] tracking-wider uppercase">Origin ISP</span>
                    <span className="text-[#F5F5F0] truncate block font-mono mt-0.5" title={record.loc1.isp}>
                      {record.loc1.isp || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] tracking-wider uppercase">Remote ISP</span>
                    <span className="text-[#F5F5F0] truncate block font-mono mt-0.5" title={record.loc2.isp}>
                      {record.loc2.isp || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] tracking-wider uppercase">Origin Weather</span>
                    <span className="text-[#F5F5F0] flex items-center gap-1.5 mt-0.5">
                      <CloudSun className="w-3.5 h-3.5 text-[#00FF88]" />
                      {record.weather1?.current?.temperature_2m !== undefined ? `${record.weather1.current.temperature_2m}°C` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] tracking-wider uppercase">Remote Weather</span>
                    <span className="text-[#F5F5F0] flex items-center gap-1.5 mt-0.5">
                      <CloudSun className="w-3.5 h-3.5 text-[#FF6B00]" />
                      {record.weather2?.current?.temperature_2m !== undefined ? `${record.weather2.current.temperature_2m}°C` : "—"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => goto(`/compare?ip1=${record.ip1}&ip2=${record.ip2}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-[#00FFD8]/10 border border-white/10 hover:border-[#00FFD8]/30 text-white hover:text-[#00FFD8] rounded-xl font-mono text-[10px] tracking-wider uppercase transition-all duration-300 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Re-run Comparison
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
