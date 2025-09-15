import React, { useState, useRef } from "react";
import Grid from "./components/Grid";
import { runDFS, runBFS, runBestFS } from "./utils/algorithms";

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
    ["F", "H", "F", "D", "H", "F"],
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
  const animRef = useRef(null); // to cancel if needed

  // visual state: maps "r,c" -> {visited:true, battery, stepIndex}
  const [visual, setVisual] = useState({ visited: {}, path: {} });

  function resetVisual() {
    setVisual({ visited: {}, path: {} });
    setMessage("");
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
      return;
    }
    const { visitedOrder, path, nodesExpanded, finalBattery } = result;
    setMessage(`Nodes expanded: ${nodesExpanded} — Path length: ${path.length} — Final battery: ${finalBattery ?? "N/A"}`);
    setVisual({ visited: {}, path: {} });
    setRunning(true);
    // animate visit order
    for (let i = 0; i < visitedOrder.length; i++) {
      const s = visitedOrder[i];
      setVisual(prev => {
        const newVisited = { ...prev.visited };
        newVisited[`${s.r},${s.c}`] = { battery: s.battery, step: i };
        return { ...prev, visited: newVisited };
      });
      // allow interruption
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

  return (
    <div className="min-h-screen p-6 bg-[#0a0a0a] crt">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 retro-title">Martian Rover — Pathfinding Visualizer</h1>

        <div className="flex flex-col gap-4 md:flex-row mb-4">
          <div className="p-4 panel pixel-border flex items-center gap-4">
            <label className="flex items-center gap-2 retro-subtle">
              Battery:
              <input type="number" value={battery} min={0} onChange={e => setBattery(Number(e.target.value))} className="border-2 border-black bg-[#0f0f0f] text-[#caffdd] px-2 py-1 w-20"/>
            </label>
            <label className="flex items-center gap-2 retro-subtle">
              Speed:
              <input type="range" min="10" max="400" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
              <span className="w-16 text-right">{speed}ms</span>
            </label>
            <div className="flex gap-2">
              <button disabled={running} onClick={() => handleRun("DFS")} className="retro-btn pink">Run DFS</button>
              <button disabled={running} onClick={() => handleRun("BFS")} className="retro-btn pink">Run BFS</button>
              <button disabled={running} onClick={() => handleRun("BEST")} className="retro-btn pink">Run BestFS</button>
            </div>
            <div className="flex gap-2 ml-0 md:ml-4">
              <button onClick={handleClearPath} className="retro-btn yellow">Clear Path</button>
              <button onClick={handleResetGrid} className="retro-btn green">Reset Grid</button>
            </div>
          </div>

          <div className="p-3 panel pixel-border flex-1">
            <div className="text-xs md:text-sm retro-subtle">Instructions: Click cells to cycle: <span className="font-semibold text-[#2affd6]">F → H → D → G → F</span>. Click 'Run ...' to animate.</div>
            <div className="mt-2 text-[10px] md:text-xs retro-subtle">Start is fixed at (0,0) cyan. Goal default is neon green (you can change by clicking a cell to set 'G').</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 grid-frame pixel-border overflow-auto">
            <Grid
              grid={grid}
              start={start}
              goal={goal}
              onCellClick={(r,c, val) => {
                // cycle cell value
                const cycle = { F: "H", H: "D", D: "G", G: "F" };
                const newVal = cycle[val] ?? "F";
                // if placing a new goal, clear old goal cell
                if (newVal === "G") {
                  // just set cell as goal, don't clear old goals
                  setGridCell(r, c, "G");
                } else {
                  setGridCell(r, c, newVal);
                }                
                resetVisual();
              }}
              visual={visual}
            />
          </div>

          <div className="p-4 panel pixel-border">
            <h2 className="font-medium mb-3 retro-title text-base">Legend & Stats</h2>
            <div className="flex gap-2 items-center mb-3">
              <div className="w-6 h-6 bg-slate-300 legend-swatch" /> <div>Flat (F) — cost 2</div>
            </div>
            <div className="flex gap-2 items-center mb-3">
              <div className="w-6 h-6 bg-amber-700 legend-swatch" /> <div>Hill (H) — cost 4</div>
            </div>
            <div className="flex gap-2 items-center mb-3">
              <div className="w-6 h-6 bg-black legend-swatch" /> <div>Ditch (D) — impassable</div>
            </div>
            <div className="flex gap-2 items-center mb-3">
              <div className="w-6 h-6 bg-green-500 legend-swatch" /> <div>Goal (G)</div>
            </div>
            <div className="flex gap-2 items-center mb-3">
              <div className="w-6 h-6 bg-sky-500 legend-swatch" /> <div>Start (0,0)</div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold retro-title text-sm">Status</h3>
              <div className="mt-2 text-xs">{message || "Idle"}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
