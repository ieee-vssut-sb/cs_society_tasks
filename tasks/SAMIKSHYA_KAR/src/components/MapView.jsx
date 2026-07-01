import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

function FitBounds({ friend1, friend2 }) {
  const map = useMap();

  map.fitBounds([
    [friend1.lat, friend1.lon],
    [friend2.lat, friend2.lon],
  ]);

  return null;
}

function MapView({ friend1, friend2 }) {
  if (!friend1 || !friend2) return null;

  return (
  <div className="mt-8">
    <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">
      🗺️ Friends Location Map
    </h2>

    <div className=" rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "550px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds
          friend1={friend1}
          friend2={friend2}
        />

        <Marker position={[friend1.lat, friend1.lon]}>
          <Popup>
            <strong>Friend 1</strong>
            <br />
            {friend1.city}
          </Popup>
        </Marker>

        <Marker position={[friend2.lat, friend2.lon]}>
          <Popup>
            <strong>Friend 2</strong>
            <br />
            {friend2.city}
          </Popup>
        </Marker>

        <Polyline
          positions={[
            [friend1.lat, friend1.lon],
            [friend2.lat, friend2.lon],
          ]}
        />
      </MapContainer>
    </div>
  </div>
);
}

export default MapView;