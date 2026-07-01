function DistanceCard({ distance }) {
  if (!distance) return null;

  return (
    <div className="bg-gradient-to-r
from-slate-900 to-emerald-600 rounded-2xl shadow-xl p-8 text-center text-white">
      <h2 className="text-3xl font-bold">
        📏 Distance Between Friends
      </h2>

      <p className="text-6xl font-extrabold mt-6">
        {distance}
      </p>

      <p className=" text-7xl font-black mt-2 tracking-wide">
        Kilometers (km)
      </p>
    </div>
  );
}

export default DistanceCard;