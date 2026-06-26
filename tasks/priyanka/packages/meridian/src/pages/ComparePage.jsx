import { useState, useEffect } from "react";
import { useGoto } from "@/App";
import {
  ArrowLeft,
  Loader2,
  Navigation2,
  Clock,
  MapPin,
  Thermometer,
  Wind,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import cityVideoPath from "@assets/272318_medium_1782326045457.mp4";
import GeoMap from "@/components/Map";
import {
  getOwnIP,
  getGeo,
  getWeather,
  haversine,
  getBearing,
  getMidpoint,
  getAntipode,
  weatherCodeToEmoji,
  TRAVEL_MODES,
} from "@/lib/geo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function ComparePage() {
  const goto = useGoto();
  const { toast } = useToast();
  const { user } = useAuth();

  const [ip1, setIp1] = useState("");
  const [ip2, setIp2] = useState("");
  const [loc1, setLoc1] = useState(null);
  const [loc2, setLoc2] = useState(null);
  const [weather1, setWeather1] = useState(null);
  const [weather2, setWeather2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [distance, setDistance] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [midpoint, setMidpoint] = useState(null);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-populate and trigger comparisons from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paramIp1 = queryParams.get("ip1");
    const paramIp2 = queryParams.get("ip2");

    const autoLookup = async () => {
      let resolvedLoc1 = null;
      let resolvedWeather1 = null;
      let resolvedLoc2 = null;
      let resolvedWeather2 = null;

      if (paramIp1) {
        setIp1(paramIp1);
        setLoading1(true);
        try {
          const geo = await getGeo(paramIp1);
          setLoc1(geo);
          resolvedLoc1 = geo;
          const w = await getWeather(geo.lat, geo.lon);
          setWeather1(w);
          resolvedWeather1 = w;
        } catch (e) {
          toast({
            title: "Failed to locate IP1",
            description: e.message,
            variant: "destructive",
          });
        }
        setLoading1(false);
      }

      if (paramIp2) {
        setIp2(paramIp2);
        setLoading2(true);
        try {
          const geo = await getGeo(paramIp2);
          setLoc2(geo);
          resolvedLoc2 = geo;
          const w = await getWeather(geo.lat, geo.lon);
          setWeather2(w);
          resolvedWeather2 = w;
        } catch (e) {
          toast({
            title: "Failed to locate IP2",
            description: e.message,
            variant: "destructive",
          });
        }
        setLoading2(false);
      }

      if (resolvedLoc1 && resolvedLoc2) {
        const dist = haversine(resolvedLoc1.lat, resolvedLoc1.lon, resolvedLoc2.lat, resolvedLoc2.lon);
        setDistance(dist);
        setBearing(getBearing(resolvedLoc1.lat, resolvedLoc1.lon, resolvedLoc2.lat, resolvedLoc2.lon));
        setMidpoint(getMidpoint(resolvedLoc1.lat, resolvedLoc1.lon, resolvedLoc2.lat, resolvedLoc2.lon));
      }
    };

    if (paramIp1 || paramIp2) {
      autoLookup();
    }
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".animate-on-scroll, .section-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loc1, loc2, distance]);

  const handleDetectIP = async () => {
    setLoading1(true);
    try {
      const myIp = await getOwnIP();
      setIp1(myIp);
      const geo = await getGeo(myIp);
      setLoc1(geo);
      setWeather1(await getWeather(geo.lat, geo.lon));
      toast({ title: "Location acquired." });
    } catch (e) {
      toast({
        title: "Detection failed",
        description: e.message,
        variant: "destructive",
      });
    }
    setLoading1(false);
  };

  const handleLookupIP2 = async () => {
    if (!ip2) return;
    setLoading2(true);
    try {
      const geo = await getGeo(ip2);
      setLoc2(geo);
      setWeather2(await getWeather(geo.lat, geo.lon));
    } catch (e) {
      toast({
        title: "Invalid IP address",
        description: "Could not locate this IP.",
        variant: "destructive",
      });
      setLoc2(null);
      setWeather2(null);
    }
    setLoading2(false);
  };

  const calculateDistance = () => {
    if (!loc1 || !loc2) return;
    const dist = haversine(loc1.lat, loc1.lon, loc2.lat, loc2.lon);
    if (dist < 1)
      toast({
        title: "You're neighbors! 🏙️",
        description: "These IPs resolve to the same location.",
      });
    setDistance(dist);
    setBearing(getBearing(loc1.lat, loc1.lon, loc2.lat, loc2.lon));
    setMidpoint(getMidpoint(loc1.lat, loc1.lon, loc2.lat, loc2.lon));

    // Persist comparison to logged-in user history
    if (user) {
      const historyKey = `meridian_history_${user.email.toLowerCase()}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
      const record = {
        id: Date.now().toString(),
        ip1,
        ip2,
        loc1,
        loc2,
        distance: dist,
        weather1,
        weather2,
        timestamp: new Date().toISOString(),
      };
      history.push(record);
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  };

  const countryFlag = (code) =>
    String.fromCodePoint(
      ...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 127397),
    );

  const hemisphere = (lat, lon) =>
    `${lat >= 0 ? "Northern" : "Southern"} · ${lon >= 0 ? "Eastern" : "Western"}`;

  return (
    <div className="page-enter relative min-h-screen w-full bg-black text-[#F5F5F0] font-sans selection:bg-[#00FF88] selection:text-black">
      {/* City lights video — fixed background */}
      <video
        src={cityVideoPath}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      <div
        className="fixed inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.58) 100%)",
        }}
      />

      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,136,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 pt-8 pb-32 space-y-10">
        {/* Top bar — back button + title */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => goto("/")}
            data-testid="button-back"
            className="flex items-center gap-2 text-[#888880] hover:text-[#00FF88] transition-colors font-mono text-sm tracking-widest uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Meridian
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px w-20 bg-gradient-to-l from-[#00FF88]/40 to-transparent" />
            <span className="font-mono text-xs text-[#00FF88]/60 tracking-[0.4em] uppercase">
              Coordinate Analysis
            </span>
            <div className="h-px w-20 bg-gradient-to-r from-[#00FF88]/40 to-transparent" />
          </div>
        </div>

        {/* Section A — IP Inputs */}
        <div className="animate-on-scroll grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div className="glass-card p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_10px_#00FF88]" />
                Origin Point
              </h2>
              {loc1?.countryCode && (
                <span className="text-2xl">
                  {countryFlag(loc1.countryCode)}
                </span>
              )}
            </div>
            <input
              type="text"
              readOnly
              value={ip1}
              placeholder="Awaiting detection…"
              data-testid="input-ip1"
              className="bg-transparent border-b border-[#00FF88]/30 py-2 font-mono text-lg focus:outline-none text-[#F5F5F0] placeholder:text-[#444]"
            />
            <button
              onClick={handleDetectIP}
              disabled={loading1}
              data-testid="button-detect-ip"
              className="bg-white/5 hover:bg-[#00FF88]/10 border border-[#00FF88]/20 hover:border-[#00FF88]/50 rounded-lg py-2.5 transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading1 ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#00FF88]" />
              ) : (
                "Detect My IP"
              )}
            </button>
            {loc1 && (
              <div className="space-y-1 pt-1 border-t border-white/5 text-sm">
                <p className="text-[#F5F5F0]">
                  {loc1.city},{" "}
                  <span className="text-[#888880]">{loc1.regionName}</span>
                </p>
                <p className="font-mono text-xs text-[#00FF88]/70">
                  {loc1.isp}
                </p>
                <p className="text-xs text-[#888880]">
                  {hemisphere(loc1.lat, loc1.lon)} Hemisphere
                </p>
              </div>
            )}
          </div>

          {/* Remote */}
          <div className="glass-card p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]" />
                Remote Point
              </h2>
              {loc2?.countryCode && (
                <span className="text-2xl">
                  {countryFlag(loc2.countryCode)}
                </span>
              )}
            </div>
            <input
              type="text"
              value={ip2}
              onChange={(e) => setIp2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookupIP2()}
              placeholder="Enter IP address…"
              data-testid="input-ip2"
              className="bg-transparent border-b border-[#FFD700]/40 py-2 font-mono text-lg focus:outline-none focus:border-[#FFD700] text-[#F5F5F0] placeholder:text-[#444] transition-colors"
            />
            <button
              onClick={handleLookupIP2}
              disabled={loading2 || !ip2}
              data-testid="button-lookup-ip"
              className="bg-white/5 hover:bg-[#FFD700]/10 border border-[#FFD700]/20 hover:border-[#FFD700]/50 rounded-lg py-2.5 transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-40"
            >
              {loading2 ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
              ) : (
                "Look Up IP"
              )}
            </button>
            {loc2 && (
              <div className="space-y-1 pt-1 border-t border-white/5 text-sm">
                <p className="text-[#F5F5F0]">
                  {loc2.city},{" "}
                  <span className="text-[#888880]">{loc2.regionName}</span>
                </p>
                <p className="font-mono text-xs text-[#FF6B00]/70">
                  {loc2.isp}
                </p>
                <p className="text-xs text-[#888880]">
                  {hemisphere(loc2.lat, loc2.lon)} Hemisphere
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Calculate button */}
        <div className="animate-on-scroll flex justify-center py-2">
          <button
            onClick={calculateDistance}
            disabled={!loc1 || !loc2}
            data-testid="button-calculate"
            className="px-14 py-4 rounded-full font-bold tracking-widest uppercase text-sm bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-black hover:opacity-90 transition-opacity disabled:opacity-25 disabled:grayscale shadow-[0_0_40px_rgba(255,215,0,0.25)]"
          >
            Calculate Distance →
          </button>
        </div>

        {/* Map */}
        {(loc1 || loc2) && (
          <div className="section-reveal glass-card p-2 overflow-hidden">
            <GeoMap loc1={loc1} loc2={loc2} midpoint={midpoint ?? undefined} />
          </div>
        )}

        {/* Stats row */}
        {distance !== null && loc1 && loc2 && (
          <div className="section-reveal grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 flex flex-col gap-2">
              <p className="text-xs text-[#888880] uppercase tracking-widest">
                Distance
              </p>
              <p className="font-serif italic text-4xl text-[#FFD700] drop-shadow-[0_0_16px_rgba(255,215,0,0.4)]">
                {Math.round(distance).toLocaleString()}
                <span className="text-lg not-italic font-sans font-light ml-1">
                  km
                </span>
              </p>
              <p className="font-mono text-[#888880] text-xs">
                {Math.round(distance * 0.621371).toLocaleString()} mi
              </p>
            </div>

            <div className="glass-card p-5 flex flex-col gap-2">
              <p className="text-xs text-[#888880] uppercase tracking-widest">
                Bearing
              </p>
              <div className="flex items-center gap-2">
                <Navigation2 className="w-6 h-6 text-[#00FF88] drop-shadow-[0_0_6px_#00FF88]" />
                <span className="font-mono text-3xl">{bearing}</span>
              </div>
              <p className="text-xs text-[#888880]">Direction of travel</p>
            </div>

            {midpoint && (
              <div className="glass-card p-5 flex flex-col gap-2">
                <p className="text-xs text-[#888880] uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FFD700]" /> Midpoint
                </p>
                <p className="font-mono text-sm text-[#FFD700]">
                  {midpoint.lat.toFixed(3)}°{midpoint.lat >= 0 ? "N" : "S"}
                </p>
                <p className="font-mono text-sm text-[#FFD700]">
                  {Math.abs(midpoint.lon).toFixed(3)}°
                  {midpoint.lon >= 0 ? "E" : "W"}
                </p>
              </div>
            )}

            <div className="glass-card p-5 flex flex-col gap-2">
              <p className="text-xs text-[#888880] uppercase tracking-widest">
                Antipode (Origin)
              </p>
              {(() => {
                const a = getAntipode(loc1.lat, loc1.lon);
                return (
                  <>
                    <p className="font-mono text-sm">
                      {a.lat.toFixed(2)}°{a.lat >= 0 ? "N" : "S"}
                    </p>
                    <p className="font-mono text-sm">
                      {Math.abs(a.lon).toFixed(2)}°{a.lon >= 0 ? "E" : "W"}
                    </p>
                    <p className="text-xs text-[#888880]">
                      Opposite side of Earth
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Travel Times compact strip */}
        {distance !== null && distance > 0 && (
          <div className="section-reveal glass-card px-6 py-4">
            <p className="font-mono text-[10px] text-[#FFD700]/50 tracking-[0.4em] uppercase mb-3">
              Travel Times
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {TRAVEL_MODES(distance).map((mode) => (
                <div
                  key={mode.label}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  <span className="text-base leading-none">{mode.icon}</span>
                  <div>
                    <p className="font-mono text-sm text-[#FFD700] leading-tight">
                      {mode.time}
                    </p>
                    <p className="text-[10px] text-[#888880]">{mode.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Intelligence cards */}
        {(loc1 || loc2) && (
          <div className="section-reveal">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00FF88]/30" />
              <span className="font-mono text-xs text-[#00FF88]/60 tracking-[0.4em] uppercase">
                Location Intelligence
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00FF88]/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { loc: loc1, w: weather1, color: "#00FF88" },
                { loc: loc2, w: weather2, color: "#FF6B00" },
              ].map((item, idx) => {
                if (!item.loc)
                  return (
                    <div
                      key={idx}
                      className="glass-card p-8 flex items-center justify-center italic text-[#888880] opacity-40"
                    >
                      Awaiting data…
                    </div>
                  );
                const ltime = dayjs().tz(item.loc.timezone);
                return (
                  <div
                    key={idx}
                    className="glass-card p-6 flex flex-col space-y-5"
                  >
                    <div className="flex justify-between items-start pb-4 border-b border-white/8">
                      <div>
                        <h3
                          className="font-display italic text-3xl"
                          style={{
                            color: item.color,
                            textShadow: `0 0 20px ${item.color}55`,
                          }}
                        >
                          {item.loc.city}
                        </h3>
                        <p className="text-[#888880] text-sm mt-0.5">
                          {item.loc.regionName}, {item.loc.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          key={tick}
                          className="font-mono text-xl tabular-nums"
                        >
                          {ltime.format("HH:mm:ss")}
                        </p>
                        <p className="text-[#888880] text-xs mt-0.5 font-mono">
                          UTC {ltime.format("Z")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-[#888880] uppercase tracking-widest mb-1">
                          Coordinates
                        </p>
                        <p className="font-mono">
                          {item.loc.lat.toFixed(4)}, {item.loc.lon.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888880] uppercase tracking-widest mb-1">
                          Postal
                        </p>
                        <p className="font-mono">{item.loc.zip || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888880] uppercase tracking-widest mb-1">
                          Hemisphere
                        </p>
                        <p className="text-xs">
                          {hemisphere(item.loc.lat, item.loc.lon)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888880] uppercase tracking-widest mb-1">
                          Timezone
                        </p>
                        <p className="font-mono text-xs">{item.loc.timezone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-[#888880] uppercase tracking-widest mb-1">
                          ISP / Network
                        </p>
                        <p
                          className="font-mono text-xs truncate"
                          title={item.loc.org}
                        >
                          {item.loc.org || "—"}
                        </p>
                      </div>
                    </div>

                    {item.w && (
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: `${item.color}08`,
                          border: `1px solid ${item.color}25`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">
                              {weatherCodeToEmoji(item.w.current.weather_code)}
                            </span>
                            <div>
                              <p className="font-serif italic text-2xl">
                                {item.w.current.temperature_2m}°C
                              </p>
                              <p className="text-[#888880] text-xs">
                                Temperature
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-[#888880] space-y-1">
                            <p className="flex items-center gap-1 justify-end">
                              <Thermometer className="w-3 h-3" />
                              {item.w.current.relative_humidity_2m}% humidity
                            </p>
                            <p className="flex items-center gap-1 justify-end">
                              <Wind className="w-3 h-3" />
                              {item.w.current.wind_speed_10m} km/h
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timezone bar */}
        {loc1 && loc2 && (
          <div className="section-reveal glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Clock className="text-[#FFD700] w-5 h-5 drop-shadow-[0_0_6px_#FFD700]" />
              <span className="font-mono text-xs text-[#888880] tracking-[0.35em] uppercase">
                Time Delta
              </span>
            </div>
            <div className="flex-1 flex items-center gap-4 w-full">
              <div className="text-right shrink-0">
                <p
                  key={tick}
                  className="font-mono text-[#00FF88] text-sm tabular-nums"
                >
                  {dayjs().tz(loc1.timezone).format("hh:mm:ss A")}
                </p>
                <p className="text-[#888880] text-xs font-mono">{loc1.city}</p>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#00FF88]/60 via-white/10 to-[#FF6B00]/60" />
              <span className="shrink-0 bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                {Math.abs(
                  dayjs().tz(loc1.timezone).utcOffset() -
                    dayjs().tz(loc2.timezone).utcOffset(),
                ) / 60}
                h APART
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#FF6B00]/60 via-white/10 to-[#FF6B00]/20" />
              <div className="shrink-0">
                <p
                  key={tick + 1}
                  className="font-mono text-[#FF6B00] text-sm tabular-nums"
                >
                  {dayjs().tz(loc2.timezone).format("hh:mm:ss A")}
                </p>
                <p className="text-[#888880] text-xs font-mono text-right">
                  {loc2.city}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
