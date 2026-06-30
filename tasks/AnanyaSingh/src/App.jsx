import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/layout/Header'
import IPForm from './components/forms/IPForm'
import LoadingSpinner from './components/common/LoadingSpinner'
import LocationMap from './components/map/LocationMap'
import LocationCard from './components/cards/LocationCard'
import WeatherCard from './components/cards/WeatherCard'
import DistanceCard from './components/cards/DistanceCard'
import TimezoneCard from './components/cards/TimezoneCard'
import { fetchComparisonData, fetchLocationFromCoords } from './services/api'
import { calculateDistance } from './utils/distance'
import { getTimezoneDifference } from './utils/timezone'

function buildResult(friend1Name, friend2Name, location1, location2, weather1, weather2) {
  const distance = calculateDistance(
    location1.lat,
    location1.lon,
    location2.lat,
    location2.lon,
  )

  const timezoneInfo = getTimezoneDifference(
    location1.timezone,
    location2.timezone,
  )

  return {
    friend1Name,
    friend2Name,
    location1,
    location2,
    weather1,
    weather2,
    distance,
    timezoneInfo,
  }
}

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [friend1Name, setFriend1Name] = useState('Friend 1')
  const [friend2Name, setFriend2Name] = useState('Friend 2')
  const [mapPick1, setMapPick1] = useState(null)
  const [mapPick2, setMapPick2] = useState(null)
  const [activeFriend, setActiveFriend] = useState('friend1')

  async function handleCompare({ friend1Name: name1, friend2Name: name2, ip1, ip2 }) {
    setLoading(true)
    setResult(null)

    try {
      const pick1 = ip1 ? null : mapPick1
      const pick2 = ip2 ? null : mapPick2

      const { location1, location2, weather1, weather2 } =
        await fetchComparisonData(ip1, ip2, pick1, pick2)

      setResult(buildResult(name1, name2, location1, location2, weather1, weather2))
      toast.success('Locations compared successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to fetch location data')
    } finally {
      setLoading(false)
    }
  }

  async function handleMapClick(lat, lon) {
    const pick = { lat, lon }
    const label = activeFriend === 'friend1' ? friend1Name : friend2Name

    if (activeFriend === 'friend1') {
      setMapPick1(pick)
    } else {
      setMapPick2(pick)
    }

    if (!result) {
      toast.success(`Pin placed for ${label}`)
      return
    }

    setLoading(true)

    try {
      const { location, weather } = await fetchLocationFromCoords(lat, lon)

      setResult((prev) => {
        if (!prev) return prev

        const next = { ...prev }
        if (activeFriend === 'friend1') {
          next.location1 = location
          next.weather1 = weather
        } else {
          next.location2 = location
          next.weather2 = weather
        }

        next.distance = calculateDistance(
          next.location1.lat,
          next.location1.lon,
          next.location2.lat,
          next.location2.lon,
        )
        next.timezoneInfo = getTimezoneDifference(
          next.location1.timezone,
          next.location2.timezone,
        )

        return next
      })

      toast.success(`Updated ${label} on the map`)
    } catch (err) {
      toast.error(err.message || 'Failed to update location from map')
    } finally {
      setLoading(false)
    }
  }

  const mapLocation1 = result?.location1 ?? null
  const mapLocation2 = result?.location2 ?? null
  const mapDistance = result?.distance ?? null

  return (
    <div className="min-h-screen pb-12">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
          },
        }}
      />

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <IPForm
          onSubmit={handleCompare}
          loading={loading}
          mapPick1={mapPick1}
          mapPick2={mapPick2}
          friend1Name={friend1Name}
          friend2Name={friend2Name}
          onFriend1NameChange={setFriend1Name}
          onFriend2NameChange={setFriend2Name}
        />

        <div className="mt-8">
          <LocationMap
            friend1Name={friend1Name}
            friend2Name={friend2Name}
            location1={mapLocation1}
            location2={mapLocation2}
            mapPick1={result ? null : mapPick1}
            mapPick2={result ? null : mapPick2}
            distance={mapDistance}
            activeFriend={activeFriend}
            onActiveFriendChange={setActiveFriend}
            onMapClick={handleMapClick}
            interactive
          />
        </div>
       

        {loading && (
          <LoadingSpinner label="Fetching locations, weather & calculating distance..." />
        )}

        {result && !loading && (
          <div className="mt-10 space-y-8">
            <DistanceCard distance={result.distance} />

            <TimezoneCard
              friend1Name={result.friend1Name}
              friend2Name={result.friend2Name}
              tz1={result.location1.timezone}
              tz2={result.location2.timezone}
              timezoneInfo={result.timezoneInfo}
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <LocationCard
                name={result.friend1Name}
                location={result.location1}
                accent="indigo"
                index={0}
              />
              <LocationCard
                name={result.friend2Name}
                location={result.location2}
                accent="pink"
                index={1}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <WeatherCard
                name={result.friend1Name}
                weather={result.weather1}
                accent="indigo"
                index={0}
              />
              <WeatherCard
                name={result.friend2Name}
                weather={result.weather2}
                accent="pink"
                index={1}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-xs text-slate-600 px-4">
        Powered by{' '}
        <a
          href="https://ip-api.com/"
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 hover:text-indigo-400 transition-colors"
        >
          IP-API
        </a>
        ,{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 hover:text-green-400 transition-colors"
        >
          Open-Meteo
        </a>{' '}
        & map data from OpenStreetMap
      </footer>
    </div>
  )
}

export default App
