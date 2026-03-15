// Web Worker for heavy pixel manipulation

export type WorkerMessage = {
  type: 'processCheckerboard';
  id: string;
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
};

export type WorkerResponse = {
  type: 'processCheckerboardDone';
  id: string;
  imageData: Uint8ClampedArray | null;
  error?: string;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, id, imageData, width: w, height: h } = e.data;

  if (type === 'processCheckerboard') {
    try {
      const d = new Uint8ClampedArray(imageData); // Copy to manipulate
      
      // ── Strategy 1: Green-screen chroma-key removal ────────────────
      const isGreenish = (r: number, g: number, b: number) =>
        g > 100 && g > r * 1.5 && g > b * 1.5;

      let greenCornerCount = 0;
      const sampleSize = Math.min(20, Math.floor(w / 10), Math.floor(h / 10));
      const corners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
      ];
      for (const [cx, cy] of corners) {
        for (let dy = 0; dy < sampleSize; dy++) {
          for (let dx = 0; dx < sampleSize; dx++) {
            const sx = cx === 0 ? dx : w - 1 - dx;
            const sy = cy === 0 ? dy : h - 1 - dy;
            if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;
            const i = (sy * w + sx) * 4;
            if (isGreenish(d[i], d[i + 1], d[i + 2])) greenCornerCount++;
          }
        }
      }

      const totalCornerPixels = 4 * sampleSize * sampleSize;
      const greenRatio = greenCornerCount / totalCornerPixels;

      let strategyTriggered = false;

      if (greenRatio > 0.3) {
        // Green background detected — do chroma-key removal
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];

          if (isGreenish(r, g, b)) {
            const greenness = Math.min(1, Math.max(0,
              (g - Math.max(r, b)) / 128
            ));
            d[i + 3] = Math.round((1 - greenness) * 255);
            if (d[i + 3] > 0 && d[i + 3] < 255) {
              d[i + 1] = Math.max(0, g - Math.round(greenness * 100)); // reduce G
            }
          }
        }
        strategyTriggered = true;
      }

      if (!strategyTriggered) {
        // ── Strategy 2: Checkerboard pattern removal (fallback) ────────
        const px = (x: number, y: number): [number, number, number] => {
          const i = (y * w + x) * 4;
          return [d[i], d[i + 1], d[i + 2]];
        };

        const isGray = (r: number, g: number, b: number) =>
          Math.abs(r - g) < 25 && Math.abs(g - b) < 25;

        const cornerConfigs = [
          { x: 0, y: 0, dx: 1, dy: 1 },
          { x: w - 1, y: 0, dx: -1, dy: 1 },
          { x: 0, y: h - 1, dx: 1, dy: -1 },
          { x: w - 1, y: h - 1, dx: -1, dy: -1 },
        ];

        let cellSize = 0;
        let evenColor: [number, number, number] = [0, 0, 0];
        let oddColor: [number, number, number] = [0, 0, 0];

        for (const corner of cornerConfigs) {
          const cp = px(corner.x, corner.y);
          if (!isGray(cp[0], cp[1], cp[2])) continue;

          let cs = 0;
          for (let step = 1; step < Math.min(64, w / 2); step++) {
            const nx = corner.x + step * corner.dx;
            if (nx < 0 || nx >= w) break;
            const np = px(nx, corner.y);
            if (Math.abs(np[0] - cp[0]) > 20) { cs = step; break; }
          }
          if (cs < 2 || cs > 50) continue;

          const c2x = corner.x + cs * corner.dx;
          if (c2x < 0 || c2x >= w) continue;
          const c2 = px(c2x, corner.y);
          if (!isGray(c2[0], c2[1], c2[2])) continue;
          if (Math.abs(cp[0] - c2[0]) < 15) continue;

          let valid = true;
          for (let check = 2; check <= 5; check++) {
            const checkX = corner.x + cs * check * corner.dx;
            if (checkX < 0 || checkX >= w) break;
            const checkP = px(checkX, corner.y);
            const expected = check % 2 === 0 ? cp : c2;
            if (Math.abs(checkP[0] - expected[0]) > 30) { valid = false; break; }
          }
          if (!valid) continue;

          for (let check = 1; check <= 4; check++) {
            const checkY = corner.y + cs * check * corner.dy;
            if (checkY < 0 || checkY >= h) break;
            const checkP = px(corner.x, checkY);
            const expected = check % 2 === 0 ? cp : c2;
            if (Math.abs(checkP[0] - expected[0]) > 30) { valid = false; break; }
          }
          if (!valid) continue;

          cellSize = cs;
          const cornerCellX = Math.floor(corner.x / cs);
          const cornerCellY = Math.floor(corner.y / cs);
          const cornerPhase = (cornerCellX + cornerCellY) % 2;
          if (cornerPhase === 0) { evenColor = cp; oddColor = c2; }
          else { evenColor = c2; oddColor = cp; }
          break;
        }

        if (cellSize > 0) {
          const tolerance = 35;
          const matchColor = (r: number, g: number, b: number, c: [number, number, number]) =>
            Math.abs(r - c[0]) < tolerance && Math.abs(g - c[1]) < tolerance && Math.abs(b - c[2]) < tolerance;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * w + x) * 4;
              const r = d[i], g = d[i + 1], b = d[i + 2];
              if (!isGray(r, g, b)) continue;
              const cellX = Math.floor(x / cellSize);
              const cellY = Math.floor(y / cellSize);
              const phase = (cellX + cellY) % 2;
              const expectedColor = phase === 0 ? evenColor : oddColor;
              if (matchColor(r, g, b, expectedColor)) {
                d[i + 3] = 0;
              }
            }
          }
          strategyTriggered = true;
        }
      }

      self.postMessage({
        type: 'processCheckerboardDone',
        id,
        imageData: strategyTriggered ? d : null
      } as WorkerResponse);
    } catch (error: any) {
      self.postMessage({ type: 'processCheckerboardDone', id, imageData: null, error: error.message } as WorkerResponse);
    }
  }
};
