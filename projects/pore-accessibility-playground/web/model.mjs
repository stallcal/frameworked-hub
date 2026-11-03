export const VERSION = "0.1.0";
export const WIDTH = 120,
  HEIGHT = 80;
export const PRESETS = {
  channel: {
    name: "A wide channel",
    description: "A 20-unit opening links the left and right sides.",
    obstacles: [
      { x: 50, y: 0, w: 20, h: 30 },
      { x: 50, y: 50, w: 20, h: 30 },
    ],
  },
  bottleneck: {
    name: "A narrow doorway",
    description:
      "A 10-unit entrance controls access to the larger space beyond it.",
    obstacles: [
      { x: 30, y: 0, w: 12, h: 35 },
      { x: 30, y: 45, w: 12, h: 35 },
      { x: 42, y: 10, w: 65, h: 10 },
      { x: 42, y: 60, w: 65, h: 10 },
      { x: 97, y: 20, w: 10, h: 40 },
    ],
  },
  isolated: {
    name: "An isolated pocket",
    description:
      "The closed central cavity can fit a probe but has no route from the inlet.",
    obstacles: [
      { x: 45, y: 20, w: 40, h: 6 },
      { x: 45, y: 54, w: 40, h: 6 },
      { x: 45, y: 26, w: 6, h: 28 },
      { x: 79, y: 26, w: 6, h: 28 },
    ],
  },
};
export function clearance(x, y, obstacles, width = WIDTH, height = HEIGHT) {
  // Left/right boundaries are open; top/bottom are solid. Distances in model units.
  let distance = Math.min(y, height - y);
  for (const o of obstacles) {
    const dx = Math.max(o.x - x, 0, x - o.x - o.w),
      dy = Math.max(o.y - y, 0, y - o.y - o.h);
    distance = Math.min(distance, Math.hypot(dx, dy));
  }
  return distance;
}
export function analyze({
  obstacles = [],
  radius = 3,
  step = 1,
  width = WIDTH,
  height = HEIGHT,
} = {}) {
  if (
    ![radius, step, width, height].every(Number.isFinite) ||
    radius < 0 ||
    step <= 0 ||
    width <= 0 ||
    height <= 0
  )
    throw Error(
      "Use finite, positive geometry values and a non-negative probe radius.",
    );
  if (
    !obstacles.every(
      (o) => [o.x, o.y, o.w, o.h].every(Number.isFinite) && o.w > 0 && o.h > 0,
    )
  )
    throw Error(
      "Obstacles must be finite rectangles with positive dimensions.",
    );
  const nx = Math.ceil(width / step),
    ny = Math.ceil(height / step);
  if (nx * ny > 250000) throw Error("Choose a coarser grid.");
  const dx = width / nx,
    dy = height / ny,
    margin = Math.hypot(dx, dy) / 2;
  const mask = new Uint8Array(nx * ny),
    queue = new Int32Array(nx * ny);
  let fits = 0,
    connected = 0,
    head = 0,
    tail = 0,
    through = false;
  // Conservative clearance ensures every point in an admitted cell is collision-free.
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      const i = y * nx + x;
      if (
        clearance((x + 0.5) * dx, (y + 0.5) * dy, obstacles, width, height) >
        radius + margin
      ) {
        mask[i] = 1;
        fits++;
        if (x === 0) {
          mask[i] = 2;
          queue[tail++] = i;
        }
      }
    }
  while (head < tail) {
    const i = queue[head++],
      x = i % nx,
      y = Math.floor(i / nx);
    connected++;
    if (x === nx - 1) through = true;
    for (const [xx, yy] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ])
      if (xx >= 0 && xx < nx && yy >= 0 && yy < ny) {
        const j = yy * nx + xx;
        if (mask[j] === 1) {
          mask[j] = 2;
          queue[tail++] = j;
        }
      }
  }
  return {
    mask,
    nx,
    ny,
    dx,
    dy,
    margin,
    radius,
    width,
    height,
    fits,
    connected,
    isolated: fits - connected,
    through,
    fitArea: fits * dx * dy,
    accessibleArea: connected * dx * dy,
  };
}
