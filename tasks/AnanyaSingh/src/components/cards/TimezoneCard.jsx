import { HiClock } from 'react-icons/hi2'

export default function TimezoneCard({
  friend1Name,
  friend2Name,
  tz1,
  tz2,
  timezoneInfo,
}) {
  return (
    <div className="animate-fade-in-up bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <HiClock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Timezone Comparison</h3>
          <p className="text-sm text-slate-400">{timezoneInfo.description}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <TimeBlock
          name={friend1Name}
          time={timezoneInfo.friend1Time}
          timezone={tz1}
          offset={timezoneInfo.offset1}
          accent="indigo"
        />
        <TimeBlock
          name={friend2Name}
          time={timezoneInfo.friend2Time}
          timezone={tz2}
          offset={timezoneInfo.offset2}
          accent="pink"
        />
      </div>

      {timezoneInfo.diffHours > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <span className="text-2xl font-bold text-amber-300">
            {timezoneInfo.diffHours % 1 === 0
              ? timezoneInfo.diffHours
              : timezoneInfo.diffHours.toFixed(1)}
            h
          </span>
          <span className="text-slate-400 text-sm ml-2">time difference</span>
        </div>
      )}
    </div>
  )
}

function TimeBlock({ name, time, timezone, offset, accent }) {
  const accentColors = {
    indigo: 'text-indigo-300',
    pink: 'text-pink-300',
  }

  return (
    <div className="bg-slate-900/40 rounded-xl p-4 text-center">
      <p className={`text-sm font-medium ${accentColors[accent]} mb-1`}>
        {name}
      </p>
      <p className="text-2xl font-bold text-white">{time}</p>
      <p className="text-xs text-slate-500 mt-1 truncate" title={timezone}>
        {timezone}
      </p>
      <p className="text-xs text-slate-600 mt-0.5">
        UTC{offset >= 0 ? '+' : ''}
        {offset}
      </p>
    </div>
  )
}
