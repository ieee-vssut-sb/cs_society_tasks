const EARTH_RADIUS_KM = 6371

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
} /* Convert degrees to radians */

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const km = EARTH_RADIUS_KM * c

  return {
    km,
    miles: km * 0.621371,
    formatted: formatDistance(km), // Format the distance to a readable string
  }
} /* Calculate the distance between two points on the Earth */

function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  if (km < 100) {
    return `${km.toFixed(1)} km`
  }
  return `${Math.round(km).toLocaleString()} km`
} /* Format the distance to a readable string */
