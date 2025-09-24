"use client";

const tags = [
  "#reels",
  "#viral",
  "#fyp",
  "#clips",
  "#trend",
  "#shorts",
  "#forYou",
  "#monetize",
  "#eloX",
];

export default function HashtagTicker() {
  const doubled = [...tags, ...tags, ...tags];
  return (
    <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-xl">
      <div className="flex gap-4 py-3 w-[300%] animate-marquee-fast" style={{"--marquee-speed":"16s"} as React.CSSProperties}>
        {doubled.map((t, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-indigo-400/15 text-indigo-200 text-sm border border-indigo-400/20">{t}</span>
        ))}
      </div>
    </div>
  );
}
