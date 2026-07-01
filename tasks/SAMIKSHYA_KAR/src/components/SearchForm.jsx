function SearchForm({
  friend1IP,
  setFriend1IP,
  friend2IP,
  setFriend2IP,
  compareFriends,
}) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 mt-8 border">

      <div className="mb-4">
        <label className="block font-semibold mb-2">
          Friend 1 IP Address
        </label>

        <input
  type="text"
  placeholder="Example: 8.8.8.8"
  value={friend1IP}
  onChange={(e) => setFriend1IP(e.target.value)}
  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">
          Friend 2 IP Address
        </label>

        <input
  type="text"
  placeholder="Example: 1.1.1.1"
  value={friend2IP}
  onChange={(e) => setFriend2IP(e.target.value)}
  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
      </div>

      <button
  onClick={compareFriends}
  className="bg-slate-900 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg w-full"
>
  Compare Friends
</button>
    </div>
  );
}

export default SearchForm;