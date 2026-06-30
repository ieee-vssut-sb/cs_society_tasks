import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { HiCursorArrowRays } from 'react-icons/hi2'

function createMarkerIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const markerIcons = {
  friend1: createMarkerIcon('#818cf8'),
  friend2: createMarkerIcon('#f472b6'),
}

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 })
    } else if (points.length === 1) {
      map.setView(points[0], 5)
    }
  }, [map, points])

  return null
}

function MapClickHandler({ interactive, onMapClick }) {
  useMapEvents({
    click(e) {
      if (interactive && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  return null
}

function getMarkerLabel(location, mapPick) {
  if (location?.city) {
    return `${location.city}, ${location.country}`
  }
  if (mapPick) {
    return `${mapPick.lat.toFixed(2)}°, ${mapPick.lon.toFixed(2)}°`
  }
  return ''
}

export default function LocationMap({
  friend1Name,
  friend2Name,
  location1,
  location2,
  mapPick1,
  mapPick2,
  distance,
  activeFriend,
  onActiveFriendChange,
  onMapClick,
  interactive = false,
}) {
  const pos1 = location1
    ? [location1.lat, location1.lon]
    : mapPick1
      ? [mapPick1.lat, mapPick1.lon]
      : null

  const pos2 = location2
    ? [location2.lat, location2.lon]
    : mapPick2
      ? [mapPick2.lat, mapPick2.lon]
      : null

  const points = [pos1, pos2].filter(Boolean)
  const center = points.length
    ? [
        points.reduce((sum, p) => sum + p[0], 0) / points.length,
        points.reduce((sum, p) => sum + p[1], 0) / points.length,
      ]
    : [20, 0]

  const showLine = pos1 && pos2

  return (
    <div className="relative animate-fade-in-up rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl h-[350px] sm:h-[450px]">
      {interactive && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex gap-2">
            <FriendToggle
              label={friend1Name}
              accent="indigo"
              active={activeFriend === 'friend1'}
              onClick={() => onActiveFriendChange('friend1')}
            />
            <FriendToggle
              label={friend2Name}
              accent="pink"
              active={activeFriend === 'friend2'}
              onClick={() => onActiveFriendChange('friend2')}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/85 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
            <HiCursorArrowRays className="w-3.5 h-3.5 shrink-0" />
            Click the map to place{' '}
            <span className="font-semibold text-white">
              {activeFriend === 'friend1' ? friend1Name : friend2Name}
            </span>
          </p>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={points.length ? 4 : 2}
        scrollWheelZoom
        className={`h-full w-full ${interactive ? 'map-interactive' : ''}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler interactive={interactive} onMapClick={onMapClick} />

        {points.length > 0 && <FitBounds points={points} />}

        {pos1 && (
          <Marker position={pos1} icon={markerIcons.friend1}>
            <Popup>
              <strong>{friend1Name}</strong>
              <br />
              {getMarkerLabel(location1, mapPick1)}
            </Popup>
          </Marker>
        )}

        {pos2 && (
          <Marker position={pos2} icon={markerIcons.friend2}>
            <Popup>
              <strong>{friend2Name}</strong>
              <br />
              {getMarkerLabel(location2, mapPick2)}
            </Popup>
          </Marker>
        )}

        {showLine && (
          <Polyline
            positions={[pos1, pos2]}
            pathOptions={{
              color: '#a78bfa',
              weight: 3,
              dashArray: '10, 10',
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      {distance && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-[1000] pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm text-xs text-slate-300 px-3 py-2 rounded-lg border border-slate-700/50 text-center sm:text-left">
            Great-circle distance: {distance.formatted}
          </div>
        </div>
      )}
    </div>
  )
}

function FriendToggle({ label, accent, active, onClick }) {
  const styles = {
    indigo: active
      ? 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/30'
      : 'bg-slate-900/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/20',
    pink: active
      ? 'bg-pink-500 text-white border-pink-400 shadow-pink-500/30'
      : 'bg-slate-900/80 text-pink-300 border-pink-500/40 hover:bg-pink-500/20',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg border transition-all shadow-lg ${styles[accent]}`}
    >
      {label}
    </button>
  )
}
