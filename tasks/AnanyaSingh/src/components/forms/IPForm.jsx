import { useState } from 'react'
import { HiMagnifyingGlass, HiUser } from 'react-icons/hi2'
import { isValidIp } from '../../utils/validation'

const SAMPLE_PAIRS = [
  { label: 'India ↔ UK', ip1: '103.152.112.162', ip2: '81.2.69.142' },
  { label: 'US ↔ Japan', ip1: '1.1.1.1', ip2: '210.138.175.226' },
  { label: 'India ↔ Australia', ip1: '103.152.112.162', ip2: '1.128.96.1' },
]

export default function IPForm({
  onSubmit,
  loading,
  mapPick1,
  mapPick2,
  friend1Name,
  friend2Name,
  onFriend1NameChange,
  onFriend2NameChange,
}) {
  const [ip1, setIp1] = useState('')
  const [ip2, setIp2] = useState('')
  const [errors, setErrors] = useState({})

  function validate() {
    const nextErrors = {}
    const hasSource1 = Boolean(ip1.trim() || mapPick1)
    const hasSource2 = Boolean(ip2.trim() || mapPick2)

    if (!hasSource1) {
      nextErrors.ip1 = 'Enter an IP  addesss or click the map to set a location'
    } else if (ip1.trim() && !isValidIp(ip1)) {
      nextErrors.ip1 = 'Enter a valid IPv4 or IPv6 address'
    }

    if (!hasSource2) {
      nextErrors.ip2 = 'Enter an IP address or click the map to set a location'
    } else if (ip2.trim() && !isValidIp(ip2)) {
      nextErrors.ip2 = 'Enter a valid IPv4 or IPv6 address'
    }

    const sameIp = ip1.trim() && ip2.trim() && ip1.trim() === ip2.trim()
    const samePin =
      mapPick1 &&
      mapPick2 &&
      mapPick1.lat === mapPick2.lat &&
      mapPick1.lon === mapPick2.lon

    if (sameIp || samePin) {
      nextErrors.ip2 = 'Both friends must be in different locations'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      friend1Name: friend1Name.trim() || 'Friend 1',
      friend2Name: friend2Name.trim() || 'Friend 2',
      ip1: ip1.trim(),
      ip2: ip2.trim(),
    })
  }

  function applySample(pair) {
    setIp1(pair.ip1)
    setIp2(pair.ip2)
    setErrors({})
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-green-700/60 rounded-2xl p-6 sm:p-8 shadow-xl"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <FriendFields
          label="Friend 1"
          accent="indigo"
          name={friend1Name}
          onNameChange={onFriend1NameChange}
          ip={ip1}
          onIpChange={setIp1}
          error={errors.ip1}
          mapPick={mapPick1}
          placeholder="e.g. 8.8.8.8 (optional if pinned)"
        />
        <FriendFields
          label="Friend 2"
          accent="pink"
          name={friend2Name}
          onNameChange={onFriend2NameChange}
          ip={ip2}
          onIpChange={setIp2}
          error={errors.ip2}
          mapPick={mapPick2}
          placeholder="e.g. 1.1.1.1 (optional if pinned)"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-gray-400 w-full text-center mb-1">
          Try a sample pair:
        </span>
        {SAMPLE_PAIRS.map((pair) => (
          <button
            key={pair.label}
            type="button"
            onClick={() => applySample(pair)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-700/60 text-green-300 hover:bg-slate-600/80 transition-colors border border-slate-600/50"
          >
            {pair.label}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-green-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
      >
        <HiMagnifyingGlass className="w-5 h-5" />
        {loading ? 'Comparing locations...' : 'Compare Locations'}
      </button>
    </form>
  )
}

function FriendFields({
  label,
  accent,
  name,
  onNameChange,
  ip,
  onIpChange,
  error,
  mapPick,
  placeholder,
}) {
  const accentClasses = {
    indigo: 'focus:ring-indigo-500/50 focus:border-indigo-400',
    pink: 'focus:ring-pink-500/50 focus:border-pink-400',
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <HiUser className="w-4 h-4" />
        {label}
      </h3>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Name"
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 ${accentClasses[accent]}`}
      />
      <input
        type="text"
        value={ip}
        onChange={(e) => onIpChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border ${
          error ? 'border-red-500/60' : 'border-slate-600/50'
        } text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 ${accentClasses[accent]}`}
      />
      {mapPick && !error && (
        <p className="text-xs text-emerald-400">
          Map pin set at {mapPick.lat.toFixed(2)}°, {mapPick.lon.toFixed(2)}°
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
