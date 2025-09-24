"use client";

export default function ViralMeter() {
  const bars = new Array(9).fill(0);
  return (
    <div className="flex items-end gap-1 h-10">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-indigo-500/80 rounded equalizer-bar"
          style={{ animationDelay: `${(i % 5) * 0.12}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
