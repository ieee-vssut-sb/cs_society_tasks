import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoto } from "@/App";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Compass, History, LogOut, ShieldAlert, User, Pencil, Check, X } from "lucide-react";

export default function Navbar() {
  const { user, logout, updateDisplayName } = useAuth();
  const goto       = useGoto();
  const [location] = useLocation();
  const { toast }  = useToast();

  const [dropOpen, setDropOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName]   = useState("");
  const dropRef   = useRef(null);
  const renameRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const navItems = [
    { name: "Compare",      path: "/compare",      icon: Compass     },
    { name: "History",      path: "/history",      icon: History     },
    { name: "Threat Radar", path: "/threat-radar", icon: ShieldAlert },
  ];

  const startRename = () => {
    setNewName(user.name || "");
    setRenaming(true);
    setDropOpen(false);
    setTimeout(() => renameRef.current?.focus(), 50);
  };

  const commitRename = () => {
    if (!newName.trim()) return;
    updateDisplayName(newName.trim());
    toast({ title: "Name updated ✅", description: `Now signed in as "${newName.trim()}"` });
    setRenaming(false);
  };

  const cancelRename = () => setRenaming(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">

        {/* Logo */}
        <div onClick={() => goto("/")} className="flex items-center gap-2 cursor-pointer font-serif italic text-2xl text-white font-medium hover:opacity-80 transition-opacity">
          <span style={{
            background: "linear-gradient(to bottom, #ffffff 40%, #FFEFC6 85%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Meridian</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive = location === path;
            return (
              <button key={path} onClick={() => goto(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? "bg-[#00FFD8]/10 text-[#00FFD8] border border-[#00FFD8]/20 shadow-[0_0_15px_rgba(0,255,216,0.08)]"
                    : "text-[#888880] hover:text-white border border-transparent hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {name}
              </button>
            );
          })}
        </nav>

        {/* Right: user area */}
        <div className="flex items-center gap-3">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input
                ref={renameRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") cancelRename(); }}
                className="bg-white/[0.06] border border-[#00FFD8]/40 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none w-32"
                maxLength={30}
              />
              <button onClick={commitRename} className="text-[#00FFD8] hover:text-green-400 transition-colors" title="Save"><Check className="w-4 h-4" /></button>
              <button onClick={cancelRename} className="text-[#888880] hover:text-red-400 transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00FFD8]/30 transition-all duration-300 cursor-pointer">
                <div className="w-5 h-5 rounded-md bg-[#00FFD8]/15 border border-[#00FFD8]/30 flex items-center justify-center">
                  <User className="w-3 h-3 text-[#00FFD8]" />
                </div>
                <span className="font-mono text-xs text-[#F5F5F0] max-w-[100px] truncate">{user.name}</span>
                <span className={`text-[#555] text-[10px] transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-black/90 border border-white/10 rounded-2xl p-2 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] z-[200]">
                  <div className="px-3 py-2.5 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-mono text-[#F5F5F0] truncate mt-0.5">{user.email}</p>
                    {user.provider && (
                      <span className="inline-block mt-1.5 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FFD8]/10 text-[#00FFD8] border border-[#00FFD8]/20">
                        via {user.provider}
                      </span>
                    )}
                  </div>

                  <button onClick={startRename}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#888880] hover:text-[#00FFD8] hover:bg-[#00FFD8]/5 transition-all duration-200">
                    <Pencil className="w-3.5 h-3.5" />
                    Rename Profile
                  </button>

                  <button onClick={() => { logout(); goto("/"); setDropOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#888880] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 mt-2 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {navItems.map(({ name, path, icon: Icon }) => {
          const isActive = location === path;
          return (
            <button key={path} onClick={() => goto(path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ${
                isActive ? "text-[#00FFD8]" : "text-[#888880]"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {name.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </header>
  );
}
