import {
  HiMapPin,
  HiGlobeAlt,
  HiBuildingOffice2,
  HiSignal,
} from 'react-icons/hi2'

export default function LocationCard({ name, location, accent, index }) {
  const accentStyles = {
    indigo: {
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300',
      dot: 'bg-indigo-400',
    },
    pink: {
      border: 'border-pink-500/30',
      badge: 'bg-pink-500/20 text-pink-300',
      dot: 'bg-pink-400',
    },
  }

  const locationLabel = [location.city, location.regionName, location.country]
    .filter(Boolean)
    .join(', ')

  const style = accentStyles[accent]

  return (
    <div
      className={`animate-fade-in-up bg-slate-800/50 backdrop-blur-sm border ${style.border} rounded-2xl p-5 shadow-lg`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-white">{name}</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full ${style.badge}`}>
          {location.query}
        </span>
      </div>

      <div className="space-y-3">
        <InfoRow
          icon={HiMapPin}
          label="Location"
          value={locationLabel}
        />
        <InfoRow
          icon={HiGlobeAlt}
          label="Coordinates"
          value={`${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}°`}
        />
        <InfoRow
          icon={HiBuildingOffice2}
          label="Timezone"
          value={location.timezone}
        />
        <InfoRow
          icon={HiSignal}
          label="ISP"
          value={location.isp || location.org || 'Unknown'}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className="text-xs text-slate-500">
          {location.continent ? `${location.continent} · ` : ''}
          UTC{location.offset >= 0 ? '+' : ''}
          {location.offset / 3600}
        </span>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 break-words">{value}</p>
      </div>
    </div>
  )
}
