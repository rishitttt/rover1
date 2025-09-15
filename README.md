# rover1

A retro arcade-style Martian rover pathfinding visualizer built with React + Vite.

## Features
- Arcade cabinet UI over a custom background
- Grid with Mars-themed tiles: f (flat), h (hill), d (ditch), g (goal)
- Algorithms: DFS, BFS, Best-First (greedy to nearest goal)
- Live node counter while searching
- Battery mechanic with on-screen controls
- Rover sprite animates along the final path

## How to use
- Click grid cells to cycle terrain: F → H → D → G → F
- Use the invisible arcade buttons on the image to run DFS, BFS, BestFS, clear path, or reset
- Battery control is at the bottom-right: use < and > to decrease/increase
- The nodes counter displays how many nodes have been explored so far

## Scripts
- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`

## Notes
- Best-First Search uses Manhattan distance to the nearest goal among all G cells
- To tweak grid vertical position, change `--screen-top` in `src/index.css`
- To reposition battery HUD, edit `.battery-hud { right: X; bottom: Y; }` in `src/index.css`
- Similarly, reposition button overlays to fit the screen size
