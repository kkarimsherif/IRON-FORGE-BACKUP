# Dumbbell Animation

A 3D animation featuring two dumbbells that move apart as the user scrolls down the page.

## Features

- Two 3D dumbbells positioned side-by-side at the center
- Animation triggered by scroll position
- Subtle rotation as the dumbbells move apart
- Responsive design

## How to Run

1. Navigate to the project directory:
   ```
   cd "proj 2/dumbbell-animation"
   ```

2. Since this is a standalone HTML/JS application without a build step, you can run it using any local server. If you have Python installed, you can use:
   ```
   python -m http.server
   ```
   Or with Node.js:
   ```
   npx http-server
   ```

3. Open `index.html` in your browser.

4. Scroll down to see the animation effect.

## Implementation Details

- Uses React for UI components
- Three.js with @react-three/fiber for 3D rendering
- @react-three/drei for 3D utilities
- Scroll controls with framer-motion
- Responsive design that works on all screen sizes

## Performance Considerations

- Low-poly 3D models for better performance
- Optimized animations to minimize re-renders
- Responsive design for all screen sizes 