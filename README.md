# Graph Search Algorithm Visualizer

An interactive, browser-based visualization of classical graph search algorithms built with D3.js. Generates random weighted graphs and animates how different algorithms explore them step by step.

## Algorithms

- **Breadth First Search** — explores nodes level by level; finds shortest path by number of edges
- **Uniform Cost Search** — expands the lowest-cost frontier node; optimal for weighted graphs
- **Depth First Search** — explores as deep as possible before backtracking; not optimal
- **Depth Limited Search** — depth first with a fixed depth cutoff (limit: 4)
- **Iterative Deepening** — repeated depth limited search with increasing limits; combines DFS space efficiency with BFS optimality
- **Greedy Best First** — prioritizes nodes closest to the goal by straight-line distance; fast but not optimal
- **A\*** — combines path cost and straight-line heuristic; optimal and efficient

## Controls

| Control | Function |
|---|---|
| Algorithm buttons | Select and (re)start the chosen algorithm |
| ▶ (autoplay) | Run the algorithm continuously at the current speed |
| ▶\| (step) | Click the active algorithm button to advance one step at a time |
| Speed selector | Cycle through five playback speeds |
| Highlight buttons | Overlay node shading by heuristic, path cost, or combined (f = g + h) |
| RESET | Generate a new random graph |
| ▼ / ▲ | Decrease or increase node count (3–52) |

## Display

The right panel shows the current **frontier** (nodes queued for expansion) and **visited** set. For priority-based algorithms, frontier nodes are displayed with their current cost value. Upon reaching the goal, the solution path is highlighted in orange with total step count and path cost.

Node shading overlays allow the user to visualize the relative **heuristic value** (straight-line distance to goal), **path cost** (g), or **evaluation function** (f = g + h) across all nodes simultaneously. Darker shading indicates lower values. This makes it possible to directly relate each algorithm's search behavior to the quantity driving its queue prioritization.

## Usage

A live version is available at [tmillhouua.github.io/GraphSearchAlgorithmViz](https://tmillhouua.github.io/GraphSearchAlgorithmViz/).

Alternatively, clone or download the repository and open `index.html` directly in a browser. The visualization runs entirely in the browser with no build step or server required.

## Dependencies

All dependencies are bundled locally in the `d3/` folder — no internet connection required.

| Library | Version |
|---|---|
| D3 | v4 |
| d3-scale-chromatic | v1 |
| d3-contour | v1 |
| d3-3d | — |
