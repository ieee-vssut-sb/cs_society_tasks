import React, { useState } from "react";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
function App() {
  const [friend1IP, setFriend1IP] = useState("");
  const [friend2IP, setFriend2IP] = useState("");

  const [friend1Data, setFriend1Data] = useState(null);
  const [friend2Data, setFriend2Data] = useState(null);
  const [friend1Weather, setFriend1Weather] = useState(null);
  const [friend2Weather, setFriend2Weather] = useState(null);

  // API call function
  const getLocation = async (ip) => {
    try {
      const res = await axios.get(
        `http://ip-api.com/json/${ip}?fields=66842623&lang=en`
      );
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  const getWeather = async (lat, lon) => {
  try {
    const res = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );

    return res.data.current;
  } catch (error) {
    console.log(error);
    return null;
  }
};
  const handleCompare = async () => {
  try {
    //  Friend 1 (your IP → location)
    const ipRes = await axios.get("https://api.ipify.org?format=json");
    const ip = ipRes.data.ip;

    const res1 = await axios.get(`http://ip-api.com/json/${ip}`);
    const data1 = res1.data;

    setFriend1Data(data1);

    //  Friend 2 (manual IP)
    const res2 = await axios.get(`http://ip-api.com/json/${friend2IP}`);
    const data2 = res2.data;

    setFriend2Data(data2);

    //  Weather calls
    const weather1 = await getWeather(data1.lat, data1.lon);
    const weather2 = await getWeather(data2.lat, data2.lon);

    setFriend1Weather(weather1);
    setFriend2Weather(weather2);

    //  Distance calculation
    const dist = calculateDistance(
      data1.lat,
      data1.lon,
      data2.lat,
      data2.lon
    );

    setDistance(dist);

  } catch (error) {
    console.log("handleCompare error:", error);
  }
};
  // button click

  function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c).toFixed(2);
}
  
  return (
  <div
    style={{
      maxWidth: "700px",
      margin: "30px auto",
      padding: "20px",
      fontFamily: "Arial",
    }}
  >
    <h1> Friend Location Comparer</h1>

    <input
      type="text"
      placeholder="Enter Friend 1 IP"
      value={friend1IP}
      onChange={(e) => setFriend1IP(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />

    <input
      type="text"
      placeholder="Enter Friend 2 IP"
      value={friend2IP}
      onChange={(e) => setFriend2IP(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
      }}
    />

    <button onClick={handleCompare}>
  Compare Friends
</button>

    <div style={{ marginTop: "20px" }}>
      {friend1Data && (
        <div
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h2>Friend 1</h2>
          <p><b>City:</b> {friend1Data.city}</p>
          <p><b>Country:</b> {friend1Data.country}</p>
          <p><b>Latitude:</b> {friend1Data.lat}</p>
          <p><b>Longitude:</b> {friend1Data.lon}</p>
          {friend1Weather && (
  <>
    <p> Temperature: {friend1Weather.temperature_2m} °C</p>
    <p> Humidity: {friend1Weather.relative_humidity_2m}%</p>
    <p> Wind: {friend1Weather.wind_speed_10m} km/h</p>
  </>
)}
<p>
   Local Time: {dayjs().tz(friend1Data.timezone).format("hh:mm A")}
</p>
        </div>
      )}

      {friend2Data && (
        <div
          style={{
            border: "1px solid gray",
            padding: "15px",
          }}
        >
          <h2>Friend 2</h2>
          <p><b>City:</b> {friend2Data.city}</p>
          <p><b>Country:</b> {friend2Data.country}</p>
          <p><b>Latitude:</b> {friend2Data.lat}</p>
          <p><b>Longitude:</b> {friend2Data.lon}</p>
          {friend2Weather && (
  <>
    <p> Temperature: {friend2Weather.temperature_2m} °C</p>
    <p> Humidity: {friend2Weather.relative_humidity_2m}%</p>
    <p> Wind: {friend2Weather.wind_speed_10m} km/h</p>
  </>
)}
    <p>
   Local Time: {dayjs().tz(friend2Data.timezone).format("hh:mm A")}
</p>
        </div>
      )}
    </div>
    <MapContainer
  center={[friend1Data?.lat || 20.2961,friend1Data?.lon || 85.8245]}
  zoom={3}
  style={{ height: "400px", width: "100%", marginTop: "20px" }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap contributors"
  />

  {friend1Data && (
  <Marker position={[friend1Data.lat, friend1Data.lon]}>
    <Popup>
      Friend 1 - {friend1Data.city}
    </Popup>
  </Marker>
)}
 {friend2Data && (
  <Marker position={[friend2Data.lat, friend2Data.lon]}>
    <Popup>
      Friend 2 - {friend2Data.city}
    </Popup>
  </Marker>
)} 
{friend1Data && friend2Data && (
  <Polyline
    positions={[
      [friend1Data.lat, friend1Data.lon],
      [friend2Data.lat, friend2Data.lon],
    ]}
  />
)}
</MapContainer>
{friend1Data && friend2Data && (
  <div
    style={{
      marginTop: "20px",
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    Distance:{" "}
    {calculateDistance(
      friend1Data.lat,
      friend1Data.lon,
      friend2Data.lat,
      friend2Data.lon
    )}{" "}
    km
  </div>
)}
  </div>
);
}

export default App;