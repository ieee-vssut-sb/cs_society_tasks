import { useState } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import { getLocation, getWeather } from "./services/api";
import FriendCard from "./components/FriendCard";
import WeatherCard from "./components/WeatherCard";
import MapView from "./components/MapView";
import DistanceCard from "./components/DistanceCard";
import { calculateDistance } from "./utils/distance";
import Footer from "./components/Footer";

function getTimezoneDifference(timezone1, timezone2) {
  const date = new Date();

  const time1 = new Date(
    date.toLocaleString("en-US", { timeZone: timezone1 })
  );

  const time2 = new Date(
    date.toLocaleString("en-US", { timeZone: timezone2 })
  );

  const diff =
    (time2.getTime() - time1.getTime()) / (1000 * 60 * 60);

  return diff.toFixed(1);
}

function App() {
  
  const [friend1IP, setFriend1IP] = useState("");
  const [friend2IP, setFriend2IP] = useState("");
  const [friend1Data, setFriend1Data] = useState(null);
const [friend2Data, setFriend2Data] = useState(null);
const [weather1, setWeather1] = useState(null);
const [weather2, setWeather2] = useState(null);
const [distance, setDistance] = useState(null);
const [loading, setLoading] = useState(false);
async function compareFriends() {

  setLoading(true);

  try {

    const data1 = await getLocation(friend1IP);
    const data2 = await getLocation(friend2IP);

    if (data1.status === "fail" || data2.status === "fail") {
      alert("Please enter valid IP addresses.");
      return;
    }

    setFriend1Data(data1);
    setFriend2Data(data2);

    const w1 = await getWeather(data1.lat, data1.lon);
    const w2 = await getWeather(data2.lat, data2.lon);

    setWeather1(w1);
    setWeather2(w2);

    const dist = calculateDistance(
      data1.lat,
      data1.lon,
      data2.lat,
      data2.lon
    );

    setDistance(dist);

  } catch (error) {

    alert("Something went wrong. Please try again.");

  } finally {

    setLoading(false);

  }

}

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto p-6">

  <SearchForm
    friend1IP={friend1IP}
    setFriend1IP={setFriend1IP}
    friend2IP={friend2IP}
    setFriend2IP={setFriend2IP}
    compareFriends={compareFriends}
  />

  {/* Friend Cards */}
  <div className=" grid md:grid-cols-2 gap-6 mt-8">
    {
loading && (
    <div className="text-center mt-8">

        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>

        <p className="mt-4 text-gray-600">
            Fetching Friend Details...
        </p>

    </div>
)
}
    <FriendCard
      title="👤 Friend 1"
      data={friend1Data}
    />

    <FriendCard
      title="👤 Friend 2"
      data={friend2Data}
    />
  </div>

  {/* Weather Cards */}
  <div className="grid md:grid-cols-2 gap-6 mt-8">
    <WeatherCard
      title="🌤 Friend 1 Weather"
      weather={weather1}
    />

    <WeatherCard
      title="🌤 Friend 2 Weather"
      weather={weather2}
    />
  </div>

  {/* Distance */}
  <div className="mt-8">
    <DistanceCard distance={distance} />
  </div>

  {friend1Data && friend2Data && (
  <div className="mt-8 bg-white rounded-2xl shadow-lg border p-6 text-center">
    <h2 className="text-2xl font-bold text-blue-600">
      🕒 Timezone Difference
    </h2>

    <p className="text-3xl font-bold mt-4">
      {Math.abs(
        getTimezoneDifference(
          friend1Data.timezone,
          friend2Data.timezone
        )
      )} hours
    </p>
  </div>
)}

  {/* Map */}
  <div className="mt-8">
    <MapView
      friend1={friend1Data}
      friend2={friend2Data}
    />
  </div>

</main>
<Footer />
    </>
  );
}

export default App;