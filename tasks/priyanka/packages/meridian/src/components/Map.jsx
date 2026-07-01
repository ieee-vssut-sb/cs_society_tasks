import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const greenIcon = L.divIcon({
  className: "custom-marker-green",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const orangeIcon = L.divIcon({
  className: "custom-marker-orange",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const goldIcon = L.divIcon({
  className: "custom-marker-gold",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapBounds({ pos1, pos2, midpoint }) {
  const map = useMap();
  useEffect(() => {
    if (pos1 && pos2) {
      const points = [pos1, pos2];
      if (midpoint) points.push(midpoint);
      map.fitBounds(L.latLngBounds(points), {
        padding: [60, 60],
        animate: true,
        maxZoom: 6,
      });
    } else if (pos1) {
      map.setView(pos1, 4, { animate: true });
    } else if (pos2) {
      map.setView(pos2, 4, { animate: true });
    }
  }, [pos1, pos2, midpoint, map]);
  return null;
}

export default function GeoMap({ loc1, loc2, midpoint }) {
  const pos1 = loc1 ? [loc1.lat, loc1.lon] : undefined;
  const pos2 = loc2 ? [loc2.lat, loc2.lon] : undefined;
  const midPos = midpoint ? [midpoint.lat, midpoint.lon] : undefined;

  return (
    <MapContainer
      center={[20, 0]}
      zoom={1}
      minZoom={1}
      maxZoom={18}
      className="w-full h-[340px] lg:h-[520px] rounded-xl z-0"
      zoomControl={true}
      scrollWheelZoom={true}
      worldCopyJump={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />

      {pos1 && <Marker position={pos1} icon={greenIcon} />}
      {pos2 && <Marker position={pos2} icon={orangeIcon} />}
      {midPos && <Marker position={midPos} icon={goldIcon} />}

      {pos1 && pos2 && (
        <Polyline
          positions={[pos1, pos2]}
          pathOptions={{
            color: "rgba(255, 215, 0, 0.75)",
            dashArray: "8, 12",
            weight: 2.5,
          }}
        />
      )}
      {pos1 && midPos && (
        <Polyline
          positions={[pos1, midPos]}
          pathOptions={{
            color: "rgba(0,255,136,0.4)",
            dashArray: "4, 8",
            weight: 1.5,
          }}
        />
      )}
      {pos2 && midPos && (
        <Polyline
          positions={[pos2, midPos]}
          pathOptions={{
            color: "rgba(255,107,0,0.4)",
            dashArray: "4, 8",
            weight: 1.5,
          }}
        />
      )}

      <MapBounds pos1={pos1} pos2={pos2} midpoint={midPos} />
    </MapContainer>
  );
}
