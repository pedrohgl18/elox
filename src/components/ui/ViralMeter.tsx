"use client";

export default function ViralMeter() {
  const bars = new Array(9).fill(0);
  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((_, i) => (
        <div
          key={i}
          className="equalizer-bar w-1.5 rounded bg-gradient-to-t from-sky-500 via-sky-400 to-cyan-300"
          style={{ animationDelay: `${(i % 5) * 0.12}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
