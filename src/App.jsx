import React, { useState, useRef } from "react";
import Grid from "./components/Grid";
import { runDFS, runBFS, runBestFS } from "./utils/algorithms";
import bgArcade from "./assets/smai bd.png";
import roverPng from "./assets/smai rover.png";

const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 6;
const DEFAULT_BATTERY = 25;
const DEFAULT_SPEED = 60; // ms per step

function makeDefaultGrid(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  // default interesting grid - you can replace later
  return [
    ["F", "H", "F", "F", "D", "F"],
    ["H", "D", "H", "F", "H", "F"],
    ["F", "F", "D", "H", "F", "F"],
    ["F", "H", "F", "D", "G", "F"],
    ["D", "F", "F", "H", "F", "H"],
    ["F", "D", "H", "F", "H", "G"]
  ];
}

export default function App() {
  const [grid, setGrid] = useState(makeDefaultGrid());
  const [start, setStart] = useState([0, 0]);
  const [goal, setGoal] = useState([5, 5]);
  const [battery, setBattery] = useState(DEFAULT_BATTERY);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [nodesExpanded, setNodesExpanded] = useState(0);
  const animRef = useRef(null); // to cancel if needed

  // visual state: maps "r,c" -> {visited:true, battery, stepIndex}
  const [visual, setVisual] = useState({ visited: {}, path: {} });
  const [finalPath, setFinalPath] = useState([]);
  const [roverStep, setRoverStep] = useState(-1);

  function resetVisual() {
    setVisual({ visited: {}, path: {} });
    setMessage("");
    setFinalPath([]);
    setRoverStep(-1);
    setNodesExpanded(0);
  }

  function setGridCell(r, c, value) {
    setGrid(prev => {
      const copy = prev.map(row => row.slice());
      copy[r][c] = value;
      return copy;
    });
  }

  async function animateRun(result) {
    if (!result) {
      setMessage("No path found.");
      setRunning(false);
      return;
    }
    const { visitedOrder, path, nodesExpanded: totalNodes, finalBattery } = result;
    setNodesExpanded(0);
    setMessage(`Nodes expanded: ${totalNodes} — Path length: ${path.length} — Final battery: ${finalBattery ?? "N/A"}`);
    setVisual({ visited: {}, path: {} });
    setRunning(true);
    setFinalPath(path);
    setRoverStep(-1); // hide rover until path-follow starts

    // animate visit order (live update counter)
    for (let i = 0; i < visitedOrder.length; i++) {
      const s = visitedOrder[i];
      setVisual(prev => {
        const newVisited = { ...prev.visited };
        newVisited[`${s.r},${s.c}`] = { battery: s.battery, step: i };
        return { ...prev, visited: newVisited };
      });
      setNodesExpanded(i + 1);
      await new Promise(res => animRef.current = setTimeout(res, speed));
    }

    // animate path (highlight)
    for (let i = 0; i < path.length; i++) {
      const [r, c] = path[i];
      setVisual(prev => {
        const newPath = { ...prev.path };
        newPath[`${r},${c}`] = { step: i };
        return { ...prev, path: newPath };
      });
      await new Promise(res => animRef.current = setTimeout(res, Math.max(30, speed/1.5)));
    }

    // move rover along final path (slower)
    for (let i = 0; i < path.length; i++) {
      setRoverStep(i);
      await new Promise(res => animRef.current = setTimeout(res, Math.max(150, Math.round(speed * 1.5))));
    }

    setRunning(false);
  }

  function cancelAnimation() {
    if (animRef.current) {
      clearTimeout(animRef.current);
    }
    setRunning(false);
  }

  async function handleRun(alg) {
    resetVisual();
    cancelAnimation();
    setRunning(true);
    setMessage("Computing...");
    await new Promise(r => setTimeout(r, 10)); // let UI update
    const opts = { grid, start, goal, battery };
    let result = null;
    if (alg === "DFS") result = runDFS(opts);
    else if (alg === "BFS") result = runBFS(opts);
    else if (alg === "BEST") result = runBestFS(opts);
    await animateRun(result);
  }

  function handleClearPath() {
    resetVisual();
  }

  function handleResetGrid() {
    cancelAnimation();
    setGrid(makeDefaultGrid());
    setStart([0,0]);
    setGoal([5,5]);
    setBattery(DEFAULT_BATTERY);
    resetVisual();
  }

  const cellSize = 44;
  const roverSize = 70;

  const roverStyle = () => {
    if (roverStep < 0 || !finalPath.length) return { display: 'none' };
    const [r, c] = finalPath[roverStep];
    const left = c * cellSize + (cellSize - roverSize) / 2;
    const top = r * cellSize + (cellSize - roverSize) / 2;
    return { left: left + 'px', top: top + 'px', width: roverSize + 'px', height: roverSize + 'px' };
  };

  return (
    <div className="bg-arcade-image" style={{ backgroundImage: `url(${bgArcade})` }}>
      <div className="overlay-stage">

        <div className="machine-screen-overlay">
          <div className="grid-wrap">
            <img src={roverPng} alt="rover" className="rover-sprite" style={roverStyle()} />
            <Grid
              grid={grid}
              start={start}
              goal={goal}
              onCellClick={(r,c, val) => {
                const cycle = { F: "H", H: "D", D: "G", G: "F" };
                const newVal = cycle[val] ?? "F";
                if (newVal === "G") {
                  setGridCell(r, c, "G");
                } else {
                  setGridCell(r, c, newVal);
                }
                resetVisual();
              }}
              visual={visual}
            />
          </div>
        </div>

        {/* Invisible hotspots (no labels) */}
        <button disabled={running} onClick={() => handleRun("DFS")} className="hotspot hot-dfs" aria-label="Run DFS" />
        <button disabled={running} onClick={() => handleRun("BFS")} className="hotspot hot-bfs" aria-label="Run BFS" />
        <button disabled={running} onClick={() => handleRun("BEST")} className="hotspot hot-best" aria-label="Run BestFS" />
        <button onClick={handleClearPath} className="hotspot hot-clear" aria-label="Clear Path" />
        <button onClick={handleResetGrid} className="hotspot hot-reset" aria-label="Reset Grid" />

        {/* Battery HUD fixed bottom-right with icon; buttons inline left/right */}
        <div className="battery-hud pixel-font" role="status" aria-live="polite">
          <div className="value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hud-btn" aria-label="Decrease battery" onClick={() => setBattery(b => Math.max(0, b - 1))}>{'<'}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="2" width="14" height="6" rx="1" fill="#0a0a0a" stroke="#ffffff" strokeWidth="1"/>
                <rect x="16" y="4" width="2" height="2" fill="#ffffff"/>
              </svg>
              {battery}
            </div>
            <button className="hud-btn" aria-label="Increase battery" onClick={() => setBattery(b => b + 1)}>{'>'}</button>
          </div>
        </div>

        {/* Nodes counter live (pixel font) */}
        <div className="nodes-counter pixel-font" aria-hidden="true">
          <div className="label">NODES:</div>
          <div className="value">{nodesExpanded}</div>
        </div>

      </div>
    </div>
  );
}
