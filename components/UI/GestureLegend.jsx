export default function GestureLegend({ activeGesture }) {
  const gestures = [
    { id: 'fist', emoji: '✊', en: 'Fist', cn: '剑阵·环' },
    { id: 'two', emoji: '✌️', en: 'Two Fingers', cn: '分剑·控' },
    { id: 'five', emoji: '🖐', en: 'Open Palm', cn: '聚剑·球' },
    { id: 'point', emoji: '☝️', en: 'Point', cn: '突刺' },
    { id: 'swipe', emoji: '💨', en: 'Swipe', cn: '斩击' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 w-56 glass-card p-3 font-mono">
      <h3 className="text-[#ffd700] text-sm font-bold mb-3 tracking-widest text-center border-b border-cyan-500/30 pb-2">
        Gestures
      </h3>
      <div className="flex flex-col gap-2">
        {gestures.map((g) => {
          const isActive = activeGesture === g.id;
          return (
            <div 
              key={g.id}
              className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${
                isActive 
                  ? 'bg-cyan-500/20 shadow-[0_0_10px_#00f0ff] border border-cyan-400' 
                  : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{g.emoji}</span>
                <span className={`text-xs ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {g.en}
                </span>
              </div>
              <span className={`text-xs ${isActive ? 'text-cyan-300' : 'text-gray-500'}`}>
                {g.cn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
