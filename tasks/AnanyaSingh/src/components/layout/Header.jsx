import { HiGlobeAlt } from 'react-icons/hi2' // Globe icon

export default function Header() {
  return (
    <header className="text-center py-11 px-4">
      <div className="inline-flex items-center justify-center gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-blue-500/20 border border-green-400/30 animate-pulse-ring">
          <HiGlobeAlt className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-300 via-blue-300 to-yellow-300 bg-clip-text text-transparent">
        Welcome to GeoPals!
      </h1>
      <div className="flex m-4 flex-col items-center justify-center gap-4"></div>
        <p className="text-slate-400 text-sm sm:text-base mt-20px mb-10px max-w-xl mx-auto">
          Enter two IP addresses to discover where your friends are, how far apart they are, and what the weather looks like on each side.
        </p>
      
      </header>
  )
} /* Header */