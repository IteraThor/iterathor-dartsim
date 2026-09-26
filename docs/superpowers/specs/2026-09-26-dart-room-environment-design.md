# 3D Regulation Dart Room Environment Specification

## Overview
A web-based 3D simulation environment built with Vite, TypeScript, and Three.js, accurately modeling an official regulation darts room. This establishes the physical foundation for the Darts Camera Angle & FOV Simulator tool. The application is fully client-side and optimized for hosting on GitHub Pages.

## Physical Specifications & Regulation Dimensions
All dimensions in the 3D coordinate system use metric units ($1\text{ unit} = 1.0\text{ meter}$, $1\text{ mm} = 0.001\text{ units}$):

1. **Dartboard Positioning & Measurements**:
   - **Bullseye Center**: Exactly $Y = 1.727\text{ m}$ ($173\text{ cm}$ / 5' 8") above the floor level.
   - **Front Face Plane**: $Z = 0.000\text{ m}$.
   - **Board Diameter**: $451\text{ mm}$ ($45.1\text{ cm}$).
   - **Board Thickness**: $38\text{ mm}$ ($3.8\text{ cm}$).
   - **Inner Bull (Bullseye / 50)**: Diameter $12.7\text{ mm}$ ($r = 6.35\text{ mm}$).
   - **Outer Bull (Single Bull / 25)**: Diameter $31.8\text{ mm}$ ($r = 15.9\text{ mm}$).
   - **Treble Ring**: Inner radius $99\text{ mm}$, outer radius $107\text{ mm}$ (width $8\text{ mm}$).
   - **Double Ring**: Inner radius $162\text{ mm}$, outer radius $170\text{ mm}$ (width $8\text{ mm}$).
   - **Wiring / Spider**: Thin metallic wire separators dividing 20 radial segments ($18^\circ$ each), with '20' positioned vertically at the top.
   - **Surround Ring**: Outer diameter $680\text{ mm}$ ($68\text{ cm}$), thickness $38\text{ mm}$.

2. **Oche (Toe Line) & Throwing Area**:
   - **Horizontal Distance**: Exactly $2.370\text{ m}$ ($237\text{ cm}$ / 7' 9¼") measured horizontally along the floor from the **front face** of the dartboard ($Z = 0$) to the front edge of the oche bar.
   - **Diagonal Distance**: Exactly $2.934\text{ m}$ ($293.4\text{ cm}$ / 9' 7½") from the center of the bullseye ($0, 1.727, 0$) to the base of the oche at floor level ($0, 0, 2.37$).
   - **Raised Oche Bar**: Standard raised timber/rubber barrier ($38\text{ mm}$ height, $600\text{ mm}$ width, $50\text{ mm}$ depth) positioned at $Z = 2.37\text{ m}$.
   - **Darts Mat / Runner**: Mat extending from the wall past the oche ($3.0\text{ m}$ length, $0.8\text{ m}$ width) with distance markers.

3. **Room Environment**:
   - Floor: Subtle wood plank flooring.
   - Wall: Dark matte feature wall behind the dartboard.
   - Lighting: Warm ambient lighting plus a directional spotlight angled directly at the dartboard face to simulate lighting rings / overhead darts illumination.

4. **Interactive Controls & 3D Helpers**:
   - OrbitControls with smooth damping, zoom limits, and pan capabilities.
   - Quick preset camera buttons:
     - **Player Eye View (Oche)**: Camera at $(0, 1.75, 2.37)$ looking directly at the bullseye $(0, 1.73, 0)$.
     - **Board Close-up**: Camera at $(0, 1.73, 0.7)$ looking at the board.
     - **Side Profile**: Camera at $(2.5, 1.2, 1.185)$ showing the board, floor, and oche distance.
     - **Top-Down (Plan)**: Camera at $(0, 4.0, 1.185)$ looking straight down.
   - Toggleable 3D Dimension Guides:
     - Vertical height dimension: $1.73\text{ m}$ from floor to bullseye.
     - Horizontal distance dimension: $2.37\text{ m}$ from board face to oche.
     - Diagonal dimension line: $2.93\text{ m}$ from bullseye to oche line.

## Project Structure
```
darts-cam-angle-simulator/
├── index.html
├── package.json
├── vite.config.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── main.ts
│   ├── scene/
│   │   ├── SceneManager.ts
│   │   ├── Dartboard.ts
│   │   ├── Oche.ts
│   │   ├── DartRoom.ts
│   │   └── DimensionGuides.ts
│   ├── ui/
│   │   └── ViewControls.ts
│   └── style.css
```

## GitHub Hosting & Build Setup
- Static output generated into `dist/` via `npm run build`.
- `vite.config.ts` configured with `base: './'` for proper asset resolution on GitHub Pages.
- GitHub Actions workflow (`.github/workflows/deploy.yml`) configured for automated deployment on push to `main`.
