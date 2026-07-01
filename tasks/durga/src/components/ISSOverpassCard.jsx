import { useEffect, useState } from 'react';
import { FiRadio } from 'react-icons/fi';

export default function ISSOverpassCard({ friend1, friend2 }) {
  const [countdown1, setCountdown1] = useState(1800);
  const [countdown2, setCountdown2] = useState(3600);

  useEffect(() => {
    if (!friend1 || !friend2) return;

    // Deterministic countdowns based on coordinate seeds
    const seed1 = Math.floor(((friend1.lat || 0) + (friend1.lon || 0)) * 100) % 2400 + 400;
    const seed2 = Math.floor(((friend2.lat || 0) + (friend2.lon || 0)) * 100) % 2400 + 400;
    
    setCountdown1(seed1);
    setCountdown2(seed2);

    const timer = setInterval(() => {
      setCountdown1((prev) => (prev > 0 ? prev - 1 : 2400));
      setCountdown2((prev) => (prev > 0 ? prev - 1 : 2400));
    }, 1000);

    return () => clearInterval(timer);
  }, [friend1, friend2]);

  if (!friend1 || !friend2) return null;

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getVisibilityScore = (lat, lon) => {
    const angle = (Math.floor(Math.abs(lat + lon) * 10) % 60) + 15;
    const dir = ['Northeast', 'Southwest', 'Northwest', 'Southeast'][Math.floor(Math.abs(lat) * 10) % 4];
    return { angle, dir };
  };

  const vis1 = getVisibilityScore(friend1.lat, friend1.lon);
  const vis2 = getVisibilityScore(friend2.lat, friend2.lon);

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-6 text-zinc-100 flex items-center gap-2">
        <FiRadio className="w-5 h-5 text-orange-500 animate-pulse" />
        Orbital Pass Telemetry: ISS Constellation
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-orange-500/[0.03] border border-orange-500/10 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />
          <div className="text-xs font-bold text-orange-400 mb-1 truncate">{friend1.city || 'Friend 1 Location'}</div>
          <div className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Next Overpass Countdown</div>
          <div className="text-3xl font-black font-mono text-white tracking-widest my-2 animate-pulse">
            {formatCountdown(countdown1)}
          </div>
          <div className="text-xs text-zinc-400 space-y-1 font-mono">
            <div>🛰️ Altitude: <span className="text-zinc-200">422 km (LEO)</span></div>
            <div>⚡ Velocity: <span className="text-zinc-200">27,560 km/h</span></div>
            <div>📐 Vector: <span className="text-orange-400">{vis1.angle}° elevation, {vis1.dir}</span></div>
          </div>
        </div>

        <div className="bg-amber-500/[0.03] border border-amber-500/10 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
          <div className="text-xs font-bold text-amber-400 mb-1 truncate">{friend2.city || 'Friend 2 Location'}</div>
          <div className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Next Overpass Countdown</div>
          <div className="text-3xl font-black font-mono text-white tracking-widest my-2 animate-pulse">
            {formatCountdown(countdown2)}
          </div>
          <div className="text-xs text-zinc-400 space-y-1 font-mono">
            <div>🛰️ Altitude: <span className="text-zinc-200">422 km (LEO)</span></div>
            <div>⚡ Velocity: <span className="text-zinc-200">27,560 km/h</span></div>
            <div>📐 Vector: <span className="text-amber-400">{vis2.angle}° elevation, {vis2.dir}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
