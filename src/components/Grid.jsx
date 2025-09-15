import React from "react";
import Cell from "./Cell";

export default function Grid({ grid, start, goal, onCellClick, visual }) {
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 48px)` }}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const key = `${r},${c}`;
            const visitedInfo = visual?.visited?.[key];
            const pathInfo = visual?.path?.[key];
            return (
              <Cell
                key={key}
                r={r}
                c={c}
                value={val}
                isStart={r === start[0] && c === start[1]}
                isGoal={val === "G"}
                visited={visitedInfo}
                path={pathInfo}
                onClick={() => onCellClick(r, c, val)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
