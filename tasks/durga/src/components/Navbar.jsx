import { FiCompass, FiRadio } from 'react-icons/fi';
import logo from '../assets/logo.png';

export default function Navbar() {
  return (
    <header className="w-full glass-panel border-b border-amber-500/10 mb-8 py-4 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)] overflow-hidden">
          <img src={logo} alt="GeoOrbit Logo" className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 animate-ping" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            GeoOrbit
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            3D Distance & Geolocation Comparator
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
        <a 
          href="#globe-section" 
          className="flex items-center gap-2 hover:text-orange-400 transition-colors"
        >
          <FiRadio className="w-4 h-4 text-orange-500 animate-pulse" />
          Live Globe
        </a>
        <a 
          href="#map-section" 
          className="flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <FiCompass className="w-4 h-4 text-amber-500" />
          2D Map
        </a>
        <div className="hidden md:flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-orange-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Secure API Stream Connected
        </div>
      </nav>
    </header>
  );
}
