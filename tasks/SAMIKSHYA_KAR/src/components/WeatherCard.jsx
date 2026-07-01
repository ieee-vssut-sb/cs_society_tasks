function getWeatherDescription(code) {

  const weatherCodes = {
    0: "☀ Clear Sky",
    1: "🌤 Mainly Clear",
    2: "⛅ Partly Cloudy",
    3: "☁ Overcast",
    45: "🌫 Fog",
    48: "🌫 Depositing Fog",
    51: "🌦 Light Drizzle",
    53: "🌦 Moderate Drizzle",
    55: "🌧 Dense Drizzle",
    61: "🌧 Slight Rain",
    63: "🌧 Moderate Rain",
    65: "🌧 Heavy Rain",
    80: "🌦 Rain Showers",
    95: "⛈ Thunderstorm",
  };

  return weatherCodes[code] || "Unknown";
}

function WeatherCard({ title, weather }) {
  if (!weather) return null;

  return (
    <div className="bg-stone-100 rounded-2xl shadow-lg border hover:shadow-2xl transition duration-300 h-full">
      <div className="bg-emerald-600 text-white rounded-t-2xl p-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="p-6 space-y-4">

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">🌡 Temperature</span>
          <span>{weather.temperature_2m} °C</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">💧 Humidity</span>
          <span>{weather.relative_humidity_2m}%</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">🌬 Wind Speed</span>
          <span>{weather.wind_speed_10m} km/h</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">☁ Weather Code</span>
          <span>{getWeatherDescription(weather.weather_code)}</span>
        </div>

      </div>
    </div>
  );
}

export default WeatherCard;