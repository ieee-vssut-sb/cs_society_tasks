export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12"> 
      <div className="relative w-12 h-12"> 
        <div className="absolute inset-0 rounded-full border-2 border-green-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" />
      </div>
      <p className="text-green-400 text-sm animate-pulse">{label}</p>
    </div>
  )
}
