import { FiMapPin, FiCompass, FiCpu, FiDownload, FiActivity } from 'react-icons/fi';
import { calculateHaversineDistance } from '../services/api';

export default function StatsOverview({ friend1, friend2 }) {
  if (!friend1 || !friend2) return null;

  const distance = calculateHaversineDistance(
    friend1.lat,
    friend1.lon,
    friend2.lat,
    friend2.lon
  );

  const R = 6371; // Earth radius in km
  const angularDist = distance / R; // in radians

  // 1. Lithospheric Chord Path (Straight line through Earth)
  const chordLength = 2 * R * Math.sin(angularDist / 2);
  const mantleDepth = R * (1 - Math.cos(angularDist / 2));
  
  let earthLayer = 'Earth\'s Crust';
  if (mantleDepth > 2890) {
    earthLayer = 'Outer/Inner Core (Magma & Iron)';
  } else if (mantleDepth > 35) {
    earthLayer = 'Earth\'s Mantle (Solid Silicate Rock)';
  }

  // 2. Space-Link Propagation Delay (GPS Satellite Orbit at 20,200 km)
  const H = 20200; // GPS altitude in km
  const satDist = Math.sqrt(R * R + (R + H) * (R + H) - 2 * R * (R + H) * Math.cos(angularDist / 2));
  const totalSpacePath = satDist * 2;
  const gpsLatencyMs = (totalSpacePath / 299792) * 1000;

  // 3. Geostationary Orbit Elevation Angles (GEO satellite altitude 35,786 km)
  const geoAltitude = 35786;
  const friend2GeoDist = Math.sqrt(R * R + (R + geoAltitude) * (R + geoAltitude) - 2 * R * (R + geoAltitude) * Math.cos(angularDist));
  const elevationRad = Math.acos((R * R + friend2GeoDist * friend2GeoDist - (R + geoAltitude) * (R + geoAltitude)) / (2 * R * friend2GeoDist));
  const elevationDeg = 180 - (elevationRad * 180 / Math.PI);
  const airMass = 1 / Math.sin(elevationDeg * Math.PI / 180);

  const handleExportText = () => {
    const reportText = `==================================================
              GEOORBIT GEODATA COMPARISON REPORT
==================================================
Generated: ${new Date().toLocaleString()}
Haversine Distance: ${distance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km

--------------------------------------------------
LITHOSPHERIC PATH ANALYSIS (DIRECT EARTH TUNNEL)
--------------------------------------------------
Direct Chord Tunnel:       ${chordLength.toFixed(2)} km
Mantle Penetration Depth:  ${mantleDepth.toFixed(2)} km
Deepest Earth Layer:       ${earthLayer}

--------------------------------------------------
GPS SPACE-LINK PROPAGATION
--------------------------------------------------
GPS Orbit Altitude:        20,200 km
Total Signal Path:         ${totalSpacePath.toFixed(2)} km
Light Propagation Delay:   ${gpsLatencyMs.toFixed(3)} ms

--------------------------------------------------
ORBITAL ELEVATION ANGLES
--------------------------------------------------
Geostationary Ring:        35,786 km
F2 Elevation to F1 GEO:    ${isNaN(elevationDeg) ? 'No Line of Sight' : elevationDeg.toFixed(2) + ' degrees'}
Atmospheric Air Mass:      ${isNaN(elevationDeg) ? 'N/A' : airMass.toFixed(2) + 'x standard thickness'}

--------------------------------------------------
FRIEND 1 DETAILED METRICS
--------------------------------------------------
IP Address:  ${friend1.query}
Location:    ${friend1.city}, ${friend1.regionName || ''}, ${friend1.country}
Zip Code:    ${friend1.zip || 'N/A'}
Coordinates: Lat ${friend1.lat.toFixed(6)}, Lon ${friend1.lon.toFixed(6)}
ISP/Org:     ${friend1.isp} (${friend1.org || 'N/A'})
Timezone:    ${friend1.timezone}

--------------------------------------------------
FRIEND 2 DETAILED METRICS
--------------------------------------------------
IP Address:  ${friend2.query}
Location:    ${friend2.city}, ${friend2.regionName || ''}, ${friend2.country}
Zip Code:    ${friend2.zip || 'N/A'}
Coordinates: Lat ${friend2.lat.toFixed(6)}, Lon ${friend2.lon.toFixed(6)}
ISP/Org:     ${friend2.isp} (${friend2.org || 'N/A'})
Timezone:    ${friend2.timezone}

==================================================
Thank you for using GeoOrbit.
==================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `GeoOrbit_Report_${friend1.query}_vs_${friend2.query}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="relative glass-panel overflow-hidden p-6 md:p-8 text-center flex flex-col items-center justify-center">
        <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-amber-600/5 blur-3xl pointer-events-none" />
        
        <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Calculated Great-Circle Distance (Haversine)
        </p>
        <div className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.25)] animate-pulse">
          {distance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km
        </div>
        <p className="text-[11px] text-zinc-500 mt-2 font-mono">
          Radius Vector ~6371km • Coordinates: ({friend1.lat.toFixed(4)}, {friend1.lon.toFixed(4)}) ── ({friend2.lat.toFixed(4)}, {friend2.lon.toFixed(4)})
        </p>

        <button
          onClick={handleExportText}
          className="mt-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 rounded-full transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(249,115,22,0.15)]"
        >
          <FiDownload className="w-3.5 h-3.5" />
          Export Comparison Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 border-b border-orange-500/10 pb-4 mb-4">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_8px_#ff6b00]" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Friend 1 Host</h3>
              <p className="text-xl font-bold font-mono text-white">{friend1.query}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Geographical Location</div>
                <div className="text-sm font-medium text-white">
                  {friend1.city}, {friend1.regionName && `${friend1.regionName}, `}{friend1.country}
                </div>
                <div className="text-xs text-zinc-400">Zip: {friend1.zip || 'N/A'} • Code: {friend1.countryCode}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCompass className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Spatial Coordinates</div>
                <div className="text-sm font-mono text-white">
                  Lat: {friend1.lat.toFixed(6)} • Lon: {friend1.lon.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCpu className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Network & ISP</div>
                <div className="text-sm font-medium text-white truncate max-w-[280px]">
                  {friend1.isp}
                </div>
                <div className="text-xs text-zinc-400 truncate max-w-[280px]">{friend1.org || friend1.as}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4 mb-4">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#d4af37]" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Friend 2 Host</h3>
              <p className="text-xl font-bold font-mono text-white">{friend2.query}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Geographical Location</div>
                <div className="text-sm font-medium text-white">
                  {friend2.city}, {friend2.regionName && `${friend2.regionName}, `}{friend2.country}
                </div>
                <div className="text-xs text-zinc-400">Zip: {friend2.zip || 'N/A'} • Code: {friend2.countryCode}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCompass className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Spatial Coordinates</div>
                <div className="text-sm font-mono text-white">
                  Lat: {friend2.lat.toFixed(6)} • Lon: {friend2.lon.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCpu className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Network & ISP</div>
                <div className="text-sm font-medium text-white truncate max-w-[280px]">
                  {friend2.isp}
                </div>
                <div className="text-xs text-zinc-400 truncate max-w-[280px]">{friend2.org || friend2.as}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/[0.02] to-transparent pointer-events-none" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-300 mb-5 flex items-center gap-2 border-b border-orange-500/10 pb-3">
          <FiActivity className="w-5 h-5 text-orange-500" />
          Orbital Telemetry & Lithospheric Path Analysis
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-400">
          <div className="space-y-3">
            <h4 className="font-bold text-orange-400/90 uppercase tracking-wider">Lithospheric Path</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Chord Line (Direct Tunnel)</span>
                <span className="text-zinc-200">{chordLength.toLocaleString(undefined, { maximumFractionDigits: 2 })} km</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Maximum Mantle Penetration</span>
                <span className="text-zinc-200">{mantleDepth.toLocaleString(undefined, { maximumFractionDigits: 2 })} km</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Deepest Penetrated Layer</span>
                <span className="text-orange-400/80 font-semibold">{earthLayer}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-orange-400/90 uppercase tracking-wider">GPS Space-Link Telemetry</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">GPS Orbit Altitude</span>
                <span className="text-zinc-200">20,200 km (MEO)</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Total Signal Path (Dual-Hop)</span>
                <span className="text-zinc-200">{totalSpacePath.toLocaleString(undefined, { maximumFractionDigits: 2 })} km</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Speed-of-Light Propagation Delay</span>
                <span className="text-zinc-200">{gpsLatencyMs.toFixed(3)} ms</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-orange-400/90 uppercase tracking-wider">Orbital Elevation Angles</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Geostationary Ring Altitude</span>
                <span className="text-zinc-200">35,786 km (GEO)</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Friend 2 Elevation to Friend 1's Zenith GEO</span>
                <span className="text-zinc-200">
                  {isNaN(elevationDeg) ? 'No Line of Sight' : `${elevationDeg.toFixed(2)}° above horizon`}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Atmospheric Path Multiplier</span>
                <span className="text-zinc-200">
                  {isNaN(elevationDeg) || !isFinite(airMass) ? 'N/A' : `${airMass.toFixed(2)}x Air Mass`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
