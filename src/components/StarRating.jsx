import { useState } from "react";

export default function StarRating({ rating = 0, onRate, disabled = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); onRate(n === rating ? 0 : n); }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
          className="leading-none disabled:cursor-default transition-transform hover:scale-125 active:scale-110"
        >
          <span className={`text-xl ${active >= n ? "text-amber-400" : "text-gray-300"}`}>★</span>
        </button>
      ))}
    </div>
  );
}
