import { HiArrowsRightLeft } from 'react-icons/hi2'

export default function DistanceCard({ distance }) {
  return (
    <div className="animate-fade-in-up bg-gradient-to-br from-emerald-500/10 to-slate-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-lg text-center">
      <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-500/20 mb-4">
        <HiArrowsRightLeft className="w-6 h-6 text-emerald-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">Distance Between Friends are: </p>
      <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {distance.formatted}
      </p>
      <p className="text-slate-400 text-sm">
        {Math.round(distance.miles).toLocaleString()} miles ·{' '}
        {distance.km.toFixed(2)} km exact
      </p>
    </div>
  )
}
