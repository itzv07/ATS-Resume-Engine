import React from 'react';

interface AtsScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({
  score,
  label = 'Estimated ATS Match Score',
  size = 'md',
  showBadge = true
}) => {
  // Score color tiers
  const getScoreColor = (val: number) => {
    if (val >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-700', stroke: '#059669', badgeBg: 'bg-emerald-600' };
    if (val >= 70) return { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-700', stroke: '#d97706', badgeBg: 'bg-amber-600' };
    if (val >= 50) return { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-700', stroke: '#ea580c', badgeBg: 'bg-orange-600' };
    return { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-700', stroke: '#dc2626', badgeBg: 'bg-rose-600' };
  };

  const color = getScoreColor(score);

  const radius = size === 'lg' ? 64 : size === 'md' ? 48 : 32;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={`p-4 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center text-center relative ${color.bg}`}>
      <div className="relative flex items-center justify-center my-2">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl'} text-black`}>
            {score}
          </span>
          <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">/ 100</span>
        </div>
      </div>

      <div className="font-sans font-bold text-sm uppercase text-black tracking-tight mt-1">
        {label}
      </div>

      {showBadge && (
        <span className={`mt-2 font-mono text-[10px] uppercase font-bold text-white px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${color.badgeBg}`}>
          {score >= 85 ? 'Strong Match' : score >= 70 ? 'Good Match' : score >= 50 ? 'Moderate Match' : 'Low Match'}
        </span>
      )}

      <p className="font-mono text-[10px] text-gray-500 mt-2 max-w-xs text-center leading-tight">
        Estimated compatibility calculated against target Job Description requirements.
      </p>
    </div>
  );
};
