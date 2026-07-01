function FriendCard({ title, data }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border hover:shadow-2xl transition duration-300 h-full">

      <div className="bg-slate-800 text-white rounded-t-2xl p-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="p-6 space-y-4">

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">🌍 Country</span>
          <span>{data.country}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">🏙 City</span>
          <span>{data.city}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">📍 Region</span>
          <span>{data.regionName}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">📡 IP</span>
          <span>{data.query}</span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold">🏢 ISP</span>
          <span>{data.isp}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">🕒 Timezone</span>
          <span>{data.timezone}</span>
        </div>

      </div>
    </div>
  );
}

export default FriendCard;