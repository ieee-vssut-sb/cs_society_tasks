function FriendCard({ title, data }) {
  if (!data) return null;

  return (
    <div className="bg-stone-100 rounded-2xl shadow-lg border hover:shadow-2xl transition duration-300 h-full">

      {/* Header */}
      <div className="bg-emerald-600 rounded-t-2xl p-4">
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 space-y-3">
        <p><strong>🌍 Country:</strong> {data.country}</p>
        <p><strong>🏙 City:</strong> {data.city}</p>
        <p><strong>📍 Region:</strong> {data.regionName}</p>
        <p><strong>📡 IP:</strong> {data.query}</p>
        <p><strong>🏢 ISP:</strong> {data.isp}</p>
        <p><strong>🕒 Timezone:</strong> {data.timezone}</p>
      </div>

    </div>
  );
}

export default FriendCard;