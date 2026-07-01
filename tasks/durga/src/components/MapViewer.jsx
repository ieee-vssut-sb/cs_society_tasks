import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMap } from 'react-icons/fi';

function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapViewer({ friend1, friend2 }) {
  const hasCoordinates = 
    friend1 && friend1.lat !== undefined && friend1.lon !== undefined &&
    friend2 && friend2.lat !== undefined && friend2.lon !== undefined;

  const pos1 = hasCoordinates ? [friend1.lat, friend1.lon] : null;
  const pos2 = hasCoordinates ? [friend2.lat, friend2.lon] : null;
  const bounds = hasCoordinates ? [pos1, pos2] : null;

  const iconFriend1 = L.divIcon({
    className: 'custom-pin-friend1',
    html: `<div class="pulse-marker-friend1 w-5 h-5"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  const iconFriend2 = L.divIcon({
    className: 'custom-pin-friend2',
    html: `<div class="pulse-marker-friend2 w-5 h-5"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  return (
    <div id="map-section" className="glass-panel p-6 h-[500px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-zinc-100 flex items-center gap-2">
        <FiMap className="w-5 h-5 text-orange-500" />
        2D Spatial Topography Map
      </h2>

      <div className="flex-1 w-full relative overflow-hidden rounded-xl bg-[#050505] border border-orange-500/10 shadow-inner">
        {hasCoordinates ? (
          <MapContainer
            center={pos1}
            zoom={4}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={pos1} icon={iconFriend1}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-orange-400 block mb-0.5">Friend 1</strong>
                  <span className="block font-mono text-[10px] text-zinc-400 mb-1">{friend1.query}</span>
                  <span className="text-zinc-200">{friend1.city}, {friend1.country}</span>
                </div>
              </Popup>
            </Marker>

            <Marker position={pos2} icon={iconFriend2}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-amber-400 block mb-0.5">Friend 2</strong>
                  <span className="block font-mono text-[10px] text-zinc-400 mb-1">{friend2.query}</span>
                  <span className="text-zinc-200">{friend2.city}, {friend2.country}</span>
                </div>
              </Popup>
            </Marker>

            <Polyline 
              positions={[pos1, pos2]} 
              color="#ff6b00" 
              weight={3} 
              dashArray="6, 8" 
              opacity={0.8}
            />

            <MapBoundsUpdater bounds={bounds} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500/40 gap-3 font-medium">
            <FiMap className="w-12 h-12 stroke-[1.5] text-orange-500/20 animate-pulse" />
            <span>Awaiting geographical target locks to render topography...</span>
          </div>
        )}
      </div>
    </div>
  );
}
