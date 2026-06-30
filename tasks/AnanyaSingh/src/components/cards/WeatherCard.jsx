import { HiBeaker, HiArrowTrendingUp } from 'react-icons/hi2'
import { getWeatherInfo } from '../../utils/weather'

export default function WeatherCard({ name, weather, accent, index }) {
  const info = getWeatherInfo(weather.weather_code)

  const accentStyles = {
    indigo: 'border-indigo-500/30 from-indigo-500/10',
    pink: 'border-pink-500/30 from-pink-500/10',
  }

  return (
    <div
      className={`animate-fade-in-up bg-gradient-to-br ${accentStyles[accent]} to-slate-800/50 backdrop-blur-sm border rounded-2xl p-5 shadow-lg`}
      style={{ animationDelay: `${(index + 2) * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">{name}&apos;s Weather</h3>
        <span className="text-3xl" role="img" aria-label={info.label}>
          {info.icon}
        </span>
      </div>

      <p className="text-2xl font-bold text-white mb-1">
        {Math.round(weather.temperature_2m)}°C
      </p>
      <p className="text-sm text-slate-400 mb-4">{info.label}</p>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={HiBeaker}
          label="Humidity"
          value={`${weather.relative_humidity_2m}%`}
        />
        <Stat
          icon={HiArrowTrendingUp}
          label="Wind"
          value={`${weather.wind_speed_10m} km/h`}
        />
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded-lg px-3 py-2">
      <Icon className="w-4 h-4 text-slate-500" />
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  )
}
