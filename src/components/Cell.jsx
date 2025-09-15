import React from "react";

function baseClass() {
    return "cell flex items-center justify-center text-xs font-bold border border-gray-800 pixel-font";
  }
  
  export default function Cell({ r, c, value, isStart, visited, path, onClick }) {
    let classes = baseClass();
    let content = "";
  
    if (value === "F") classes += " bg-[#2d2d2d]"; // dark gray floor
    if (value === "H") classes += " bg-[#8b0000] text-white"; // dark red hill
    if (value === "D") classes += " bg-black"; // pit/ditch
    if (value === "G") classes += " bg-[#00ff00] text-black"; // neon green goal
  
    if (isStart) classes += " bg-[#00ffff] text-black"; // cyan start
  
    if (visited) {
      classes += " bg-[#ff00ff] visited-blink"; // magenta trail
      content = ".";
    }
  
    if (path) {
      classes += " bg-[#ffff00] path-pulse"; // yellow path
      content = "■";
    }
  
    return (
      <div className={classes} onClick={onClick}>
        <div style={{ fontSize: 14 }}>{content}</div>
      </div>
    );
  }
  