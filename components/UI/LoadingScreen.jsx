export default function LoadingScreen({ progress }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
      {/* Octagonal Border Animation */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin-slow_20s_linear_infinite]">
          <polygon 
            points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" 
            fill="none" 
            stroke="#114466" 
            strokeWidth="1" 
          />
          <polygon 
            points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" 
            fill="none" 
            stroke="#00f0ff" 
            strokeWidth="2"
            strokeDasharray="300"
            strokeDashoffset={300 - (progress / 100) * 300}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <h1 className="text-5xl font-bold gold-neon-text tracking-widest text-[#ffd700]">御剑术</h1>
      </div>

      <div className="text-cyan-400 font-mono text-sm tracking-widest mb-4 flex items-center">
        <span>Initializing Sword Control</span>
        <span className="animate-pulse ml-1">...</span>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#ffd700] transition-all duration-300 ease-out shadow-[0_0_10px_#ffd700]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
