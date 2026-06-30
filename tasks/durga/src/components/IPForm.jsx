import { useState } from 'react';
import { FiSearch, FiTarget, FiUser, FiActivity } from 'react-icons/fi';
import { fetchUserIP } from '../services/api';

export default function IPForm({ onCompare, isLoading }) {
  const [ip1, setIp1] = useState('');
  const [ip2, setIp2] = useState('');
  const [ip1Error, setIp1Error] = useState('');
  const [ip2Error, setIp2Error] = useState('');
  const [loadingMyIP1, setLoadingMyIP1] = useState(false);
  const [loadingMyIP2, setLoadingMyIP2] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateIP = (ip) => {
    if (!ip.trim()) return '';
    
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      const isValid = parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
      if (!isValid) return 'Each octet must be between 0 and 255.';
      return '';
    }
    
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;
    if (ip.includes(':')) {
      if (ipv6Regex.test(ip) || ip === '::1') return '';
      return 'Invalid IPv6 format.';
    }
    
    return 'Must be a valid IPv4 or IPv6 address.';
  };

  const handleIp1Change = (val) => {
    setIp1(val);
    setIp1Error(validateIP(val));
  };

  const handleIp2Change = (val) => {
    setIp2(val);
    setIp2Error(validateIP(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanIP1 = ip1.trim();
    const cleanIP2 = ip2.trim();

    if (!cleanIP1 || !cleanIP2) {
      setValidationError('Please specify IP addresses for both Friend 1 and Friend 2.');
      return;
    }

    const err1 = validateIP(cleanIP1);
    const err2 = validateIP(cleanIP2);

    if (err1 || err2) {
      setIp1Error(err1);
      setIp2Error(err2);
      setValidationError('Please resolve validation errors before comparing.');
      return;
    }

    onCompare(cleanIP1, cleanIP2);
  };

  const handleDetectIP = async (targetField) => {
    setValidationError('');
    try {
      if (targetField === 1) {
        setLoadingMyIP1(true);
        const ip = await fetchUserIP();
        setIp1(ip);
        setIp1Error('');
      } else {
        setLoadingMyIP2(true);
        const ip = await fetchUserIP();
        setIp2(ip);
        setIp2Error('');
      }
    } catch (err) {
      setValidationError(err.message || 'Could not auto-detect public IP.');
    } finally {
      setLoadingMyIP1(false);
      setLoadingMyIP2(false);
    }
  };

  return (
    <div className="w-full glass-panel p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-100">
        <FiActivity className="w-5 h-5 text-orange-500" />
        Geographical Connection Parameters
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-orange-500" />
              Friend 1 IP Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={ip1}
                onChange={(e) => handleIp1Change(e.target.value)}
                placeholder="e.g. 8.8.8.8 (US)"
                className={`w-full px-4 py-3 pl-11 pr-24 text-sm glass-input font-mono transition-all ${ip1Error ? 'border-rose-500/50 focus:border-rose-500/80 focus:shadow-[0_0_8px_rgba(244,63,94,0.2)]' : ''}`}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className={`w-2 h-2 rounded-full transition-all ${ip1Error ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-orange-500 shadow-[0_0_8px_#ff6b00]'}`} />
              </div>
              <button
                type="button"
                onClick={() => handleDetectIP(1)}
                disabled={loadingMyIP1 || isLoading}
                className="absolute inset-y-1.5 right-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 rounded-md transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {loadingMyIP1 ? (
                  <span className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTarget className="w-3.5 h-3.5" />
                )}
                Self IP
              </button>
            </div>
            {ip1Error && (
              <p className="text-[11px] text-rose-400 font-mono pl-1 animate-pulse">{ip1Error}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-amber-500" />
              Friend 2 IP Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={ip2}
                onChange={(e) => handleIp2Change(e.target.value)}
                placeholder="e.g. 1.1.1.1 (AU)"
                className={`w-full px-4 py-3 pl-11 pr-24 text-sm glass-input font-mono transition-all ${ip2Error ? 'border-rose-500/50 focus:border-rose-500/80 focus:shadow-[0_0_8px_rgba(244,63,94,0.2)]' : ''}`}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className={`w-2 h-2 rounded-full transition-all ${ip2Error ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-amber-500 shadow-[0_0_8px_#d4af37]'}`} />
              </div>
              <button
                type="button"
                onClick={() => handleDetectIP(2)}
                disabled={loadingMyIP2 || isLoading}
                className="absolute inset-y-1.5 right-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 rounded-md transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {loadingMyIP2 ? (
                  <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTarget className="w-3.5 h-3.5" />
                )}
                Self IP
              </button>
            </div>
            {ip2Error && (
              <p className="text-[11px] text-rose-400 font-mono pl-1 animate-pulse">{ip2Error}</p>
            )}
          </div>
        </div>

        {validationError && (
          <div className="p-3.5 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            {validationError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all bg-white hover:bg-zinc-100 text-zinc-950 shadow-[0_1px_15px_rgba(255,255,255,0.1)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              Tracing Geo Coordinates...
            </>
          ) : (
            <>
              <FiSearch className="w-5 h-5" />
              Compare Locations
            </>
          )}
        </button>
      </form>
    </div>
  );
}
