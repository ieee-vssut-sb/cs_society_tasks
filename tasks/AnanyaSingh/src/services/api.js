import axios from 'axios'

const IP_API_FIELDS = '66842623' // IP API fields
const IP_API_BASE = '/api/ip' // IP API base
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast' // Weather API base
const REVERSE_GEOCODE_BASE =
  'https://api.bigdatacloud.net/data/reverse-geocode-client' // Reverse geocoding API base

const WEATHER_PARAMS = {
  current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code', // Weather parameters
  timezone: 'auto', // Timezone
}

export async function fetchIpLocation(ip) {
  const { data } = await axios.get(
    `${IP_API_BASE}/${ip}?fields=${IP_API_FIELDS}&lang=en`,
  )

  if (data.status === 'fail') {
    throw new Error(data.message || `Could not locate IP ${ip}`)
  }

  return data
}

export async function fetchWeather(lat, lon) {
  const { data } = await axios.get(WEATHER_API_BASE, {
    params: { latitude: lat, longitude: lon, ...WEATHER_PARAMS },
  })

  return data.current
}

export async function fetchReverseGeocode(lat, lon) {
  const { data } = await axios.get(REVERSE_GEOCODE_BASE, {
    params: { latitude: lat, longitude: lon, localityLanguage: 'en' },
  })

  return data
}

export async function fetchLocationFromCoords(lat, lon) {
  const [geo, weatherResponse] = await Promise.all([
    fetchReverseGeocode(lat, lon),
    axios.get(WEATHER_API_BASE, {
      params: { latitude: lat, longitude: lon, ...WEATHER_PARAMS },
    }),
  ])

  const location = {
    query: 'Map pin',
    lat,
    lon,
    city: geo.city || geo.locality || geo.localityInfo?.administrative?.[2]?.name || 'Unknown',
    regionName: geo.principalSubdivision || '',
    country: geo.countryName || 'Unknown',
    countryCode: geo.countryCode || '',
    continent: geo.continent || '',
    timezone: weatherResponse.data.timezone,
    offset: weatherResponse.data.utc_offset_seconds,
    isp: 'Selected on map',
  }

  return { location, weather: weatherResponse.data.current }
}

export async function resolveFriendLocation(ip, mapPick) {
  if (mapPick) {
    return fetchLocationFromCoords(mapPick.lat, mapPick.lon)
  }

  const location = await fetchIpLocation(ip)
  const weather = await fetchWeather(location.lat, location.lon)
  return { location, weather }
}

export async function fetchComparisonData(friend1Ip, friend2Ip, mapPick1, mapPick2) {
  const [friend1, friend2] = await Promise.all([
    resolveFriendLocation(friend1Ip, mapPick1),
    resolveFriendLocation(friend2Ip, mapPick2),
  ]) 

  return {
    location1: friend1.location,
    location2: friend2.location,
    weather1: friend1.weather,
    weather2: friend2.weather,
  }
}
