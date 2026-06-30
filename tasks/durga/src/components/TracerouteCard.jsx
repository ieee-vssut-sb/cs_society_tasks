import { useState } from 'react';
import { FiTerminal, FiPlay, FiCpu } from 'react-icons/fi';

export default function TracerouteCard({ friend1, friend2 }) {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!friend1 || !friend2) return null;

  const getOceanLink = (c1, c2) => {
    if (!c1 || !c2 || c1 === c2) return 'Intra-National Fiber Ring';
    const oceans = ['TAT-14 Atlantic Fiber', 'Unity Pacific Submarine Cable', 'FLAG European-Asian System'];
    const index = Math.abs(c1.charCodeAt(0) - c2.charCodeAt(0)) % oceans.length;
    return oceans[index];
  };

  const calculateSimulatedRTT = (f1, f2) => {
    const R = 6371;
    const dLat = (f2.lat - f1.lat) * Math.PI / 180;
    const dLon = (f2.lon - f1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(f1.lat * Math.PI / 180) * Math.cos(f2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return (2 * d / 200) + 15;
  };

  const runSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    
    const rtt = Math.floor(calculateSimulatedRTT(friend1, friend2));
    const hops = [
      { ip: '192.168.1.1', name: 'Local Router (LAN Gateway)', delay: 1 },
      { ip: friend1.isp ? 'ISP Gateway' : '10.0.0.1', name: `${friend1.isp || 'Regional'} Node`, delay: Math.max(2, Math.floor(rtt * 0.15)) },
      { ip: '82.112.96.1', name: getOceanLink(friend1.countryCode, friend2.countryCode), delay: Math.max(10, Math.floor(rtt * 0.55)) },
      { ip: friend2.isp ? 'Destination ISP' : '172.16.0.1', name: `${friend2.isp || 'Remote'} Backbone`, delay: Math.max(12, Math.floor(rtt * 0.85)) },
      { ip: friend2.query, name: `Target Host (${friend2.city || 'Remote'})`, delay: rtt },
    ];

    let currentHop = 0;
    const interval = setInterval(() => {
      if (currentHop < hops.length) {
        const h = hops[currentHop];
        setLogs((prev) => [
          ...prev,
          `Hop ${currentHop + 1}: ${h.ip.padEnd(15)} [${h.name.padEnd(35)}] ──── ${h.delay} ms`
        ]);
        currentHop++;
      } else {
        setLogs((prev) => [...prev, `\nTraceroute complete. RTT: ${rtt} ms. Packet loss: 0%.`]);
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 600);
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-6 text-zinc-100 flex items-center gap-2">
        <FiTerminal className="w-5 h-5 text-orange-500" />
        Submarine Cable & Route Simulation
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-zinc-400">
            Simulate the routing hops and undersea fiber cables connecting <span className="text-orange-400 font-mono">{friend1.query}</span> to <span className="text-amber-400 font-mono">{friend2.query}</span>.
          </p>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-orange-500/10 hover:bg-orange-500/20 disabled:bg-zinc-800 disabled:text-zinc-500 border border-orange-500/20 hover:border-orange-500/40 disabled:border-zinc-700 text-orange-400 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FiPlay className="w-3.5 h-3.5" />
            {isRunning ? 'Tracing...' : 'Run Traceroute'}
          </button>
        </div>

        <div className="bg-zinc-950/90 border border-white/5 p-4 rounded-xl font-mono text-[10px] text-zinc-300 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="text-zinc-600 flex items-center gap-2 h-[100px] justify-center text-xs">
              <FiCpu className="w-4 h-4 text-zinc-700 animate-spin-slow" />
              Console ready. Click "Run Traceroute" to start transmission trace.
            </div>
          ) : (
            logs.map((log, index) => (
              <pre key={index} className="whitespace-pre-wrap font-mono leading-relaxed">{log}</pre>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
