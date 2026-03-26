export default function WebcamPreview({ isTracking, videoRef }) {
  return (
    <div className="fixed bottom-6 left-6 z-40 w-40 glass-card p-1">
      <div className="flex items-center justify-between px-2 py-1 mb-1 bg-black/40">
        <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">Hand Tracking</span>
        <div className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
      </div>
      <div className="relative w-full aspect-video bg-black/80 rounded overflow-hidden border border-cyan-500/20">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
          playsInline 
          muted 
        />
        {/* Scanning line effect */}
        {isTracking && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400/50 shadow-[0_0_8px_#00f0ff] animate-[slide-down_2s_linear_infinite]" />
        )}
      </div>
    </div>
  );
}
