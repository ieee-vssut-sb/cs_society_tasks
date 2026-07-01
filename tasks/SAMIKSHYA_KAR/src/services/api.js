export async function getLocation(ip) {
  const response = await fetch(
    `http://ip-api.com/json/${ip}?fields=66842623&lang=en`
  );

  const data = await response.json();

  return data;
}
export async function getWeather(lat, lon) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  );

  const data = await response.json();

  return data.current;
}