import React from 'react';

interface VoiceVisualizerProps {
  level: number;
  isActive: boolean;
  type: 'user' | 'model';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  level,
  isActive,
  type,
}) => {
  // Generate 16 responsive audio bars
  const barCount = 16;
  const bars = Array.from({ length: barCount }, (_, i) => {
    // Symmetrical curved envelope
    const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
    const heightMultiplier = Math.max(0.12, centerFactor * 0.95);
    const calculatedHeight = isActive
      ? Math.min(100, Math.max(14, level * heightMultiplier * 130 + (Math.sin(i * 1.5 + Date.now() / 200) * 12)))
      : 8;

    return calculatedHeight;
  });

  const barColor =
    type === 'model'
      ? 'bg-gradient-to-t from-teal-500 to-emerald-400'
      : 'bg-gradient-to-t from-sky-500 to-indigo-400';

  return (
    <div className="flex items-center justify-center gap-1 h-12 px-3 py-1">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-75 ease-out ${barColor}`}
          style={{
            height: `${height}%`,
            opacity: isActive ? 0.95 : 0.35,
          }}
        />
      ))}
    </div>
  );
};
