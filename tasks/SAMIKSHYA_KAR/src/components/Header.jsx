function Header() {
  return (
    <header className="bg-gradient-to-r
from-slate-900
via-slate-800
to-emerald-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-6xl
font-black
tracking-tight">
          🌍 Friend Locator
        </h1>

        <p className="text-slate-200
text-lg">
          Compare the geographical locations of two friends using their IP
          addresses, visualize them on an interactive map, calculate the
          distance between them, and view their current weather and timezone.
        </p>

      </div>
    </header>
  );
}

export default Header;