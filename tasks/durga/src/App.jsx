import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import IPForm from './components/IPForm';
import Globe3D from './components/Globe3D';
import StatsOverview from './components/StatsOverview';
import WeatherCard from './components/WeatherCard';
import TimezoneCard from './components/TimezoneCard';
import MapViewer from './components/MapViewer';
import ISSOverpassCard from './components/ISSOverpassCard';
import TracerouteCard from './components/TracerouteCard';
import { fetchIPDetails } from './services/api';
import { FiGlobe, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function App() {
  const [friend1, setFriend1] = useState(null);
  const [friend2, setFriend2] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Initial comparative geolocation on mount
  useEffect(() => {
    handleCompare('8.8.8.8', '1.1.1.1', true);
  }, []);

  const handleCompare = async (ip1Address, ip2Address, isDemo = false) => {
    setIsLoading(true);
    setError('');
    if (!isDemo) {
      setNotification('');
    }
    
    try {
      const [data1, data2] = await Promise.all([
        fetchIPDetails(ip1Address),
        fetchIPDetails(ip2Address)
      ]);

      setFriend1(data1);
      setFriend2(data2);

      if (!isDemo) {
        setNotification('Locations updated successfully.');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Geographical lookup failed. Please verify the IP addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] grid-bg py-8 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-600/5 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <Navbar />

        <div className="grid grid-cols-1 gap-6">
          <IPForm onCompare={handleCompare} isLoading={isLoading} />
          
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl flex items-center gap-3 animate-pulse">
              <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          {notification && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-sm font-semibold">{notification}</div>
            </div>
          )}
        </div>

        <div id="globe-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 glass-panel min-h-[450px] lg:min-h-0 flex flex-col relative overflow-hidden bg-radial-at-c from-orange-950/10 to-transparent">
            <div className="absolute top-4 left-6 z-20 pointer-events-none">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-orange-400/80 flex items-center gap-1.5">
                <FiGlobe className="w-4 h-4 text-orange-500 animate-spin-slow" />
                3D globe visualizer
              </h3>
              <p className="text-[10px] text-orange-400/40 font-mono mt-0.5">Orbital View</p>
            </div>
            
            <div className="flex-1 w-full h-full min-h-[350px] relative">
              <Globe3D friend1={friend1} friend2={friend2} />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <StatsOverview friend1={friend1} friend2={friend2} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeatherCard friend1={friend1} friend2={friend2} />
          <TimezoneCard friend1={friend1} friend2={friend2} />
        </div>

        <ISSOverpassCard friend1={friend1} friend2={friend2} />

        <TracerouteCard friend1={friend1} friend2={friend2} />

        <MapViewer friend1={friend1} friend2={friend2} />
        
        <footer className="text-center py-6 text-xs text-orange-500/40 font-mono">
          Made by Durga Prasad mahapatra • GeoOrbit &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
