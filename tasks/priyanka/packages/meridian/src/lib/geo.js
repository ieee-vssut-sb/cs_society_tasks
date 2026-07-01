import axios from "axios";

export const getOwnIP = async () => {
  const res = await axios.get("https://api.ipify.org?format=json");
  return res.data.ip;
};

export const getGeo = async (ip) => {
  const res = await axios.get(`https://ipapi.co/${ip}/json/`);
  const d = res.data;
  if (d.error) throw new Error(d.reason || "Invalid IP address");
  return {
    lat: d.latitude,
    lon: d.longitude,
    city: d.city,
    country: d.country_name,
    countryCode: d.country_code,
    regionName: d.region,
    zip: d.postal,
    timezone: d.timezone,
    isp: d.org ?? "",
    org: d.org ?? "",
  };
};

export const getWeather = async (lat, lon) => {
  const res = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`,
  );
  return res.data;
};

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function getMidpoint(lat1, lon1, lat2, lon2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const Bx = Math.cos(φ2) * Math.cos(Δλ);
  const By = Math.cos(φ2) * Math.sin(Δλ);
  const φm = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2),
  );
  const λm = (lon1 * Math.PI) / 180 + Math.atan2(By, Math.cos(φ1) + Bx);
  return {
    lat: (φm * 180) / Math.PI,
    lon: (((λm * 180) / Math.PI + 540) % 360) - 180,
  };
}

export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const l1 = (lat1 * Math.PI) / 180;
  const l2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(l2);
  const x =
    Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
  const compass = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(compass / 45) % 8];
}

export function getAntipode(lat, lon) {
  return { lat: -lat, lon: lon > 0 ? lon - 180 : lon + 180 };
}

export function weatherCodeToEmoji(code) {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "☁️";
}

export function formatTravelTime(hours) {
  if (hours < 1 / 60) return `${Math.round(hours * 3600)}s`;
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const TRAVEL_MODES = (km) => [
  {
    label: "Walking",
    speed: "5 km/h",
    icon: "🚶",
    time: formatTravelTime(km / 5),
  },
  {
    label: "Cycling",
    speed: "25 km/h",
    icon: "🚲",
    time: formatTravelTime(km / 25),
  },
  {
    label: "Car",
    speed: "100 km/h",
    icon: "🚗",
    time: formatTravelTime(km / 100),
  },
  {
    label: "High-Speed Rail",
    speed: "300 km/h",
    icon: "🚄",
    time: formatTravelTime(km / 300),
  },
  {
    label: "Aircraft",
    speed: "900 km/h",
    icon: "✈️",
    time: formatTravelTime(km / 900),
  },
  {
    label: "Sound",
    speed: "1,235 km/h",
    icon: "🔊",
    time: formatTravelTime(km / 1235),
  },
  {
    label: "Light",
    speed: "1.08B km/h",
    icon: "⚡",
    time: formatTravelTime(km / 1079252849),
  },
];
