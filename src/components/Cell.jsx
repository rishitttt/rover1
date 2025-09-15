import React from "react";

function baseClass() {
    return "cell flex items-center justify-center text-xs font-bold pixel-font select-none";
  }
  
  export default function Cell({ r, c, value, isStart, visited, path, onClick }) {
    let classes = baseClass();

    // Mars-themed palette
    if (value === "F") classes += " bg-[#6b3a22] text-[#ffe7d1]"; // dusty flat
    if (value === "H") classes += " bg-[#8c4b2a] text-[#fff0e0]"; // rocky hill
    if (value === "D") classes += " bg-[#2b1a12] text-[#c7b3a3]"; // dark ditch
    if (value === "G") classes += " bg-[#3da35d] text-white"; // green goal beacon with white text

    if (isStart) classes += " bg-[#00c2ff] text-[#0b0b0b]"; // cyan start stays distinct

    // Minimal pixel animations kept but no glyph overlays
    if (visited) classes += " visited-pixel";
    if (path) classes += " path-pixel";

    const letter = value ? value.toLowerCase() : "";

    return (
      <div className={classes} onClick={onClick}>
        <div style={{ fontSize: 12, lineHeight: 1 }}>{letter}</div>
      </div>
    );
  }
  