/**
 * Background Removal Tool for Isometric Sprites
 * Uses HTML5 Canvas pixel manipulation with contiguous flood fill,
 * tolerance control, eyedropper, and edge smoothing.
 */

class BackgroundRemover {
  /**
   * Remove background from an image element or canvas
   * @param {HTMLImageElement|HTMLCanvasElement} sourceImage
   * @param {Object} options
   * @returns {HTMLCanvasElement} processed canvas with transparent background
   */
  static process(sourceImage, options = {}) {
    const {
      targetColor = null, // { r, g, b } or auto-detected
      tolerance = 20, // 0 to 100 percent
      mode = 'contiguous', // 'contiguous' (flood fill from edges) or 'global'
      smoothEdges = true
    } = options;

    const width = sourceImage.naturalWidth || sourceImage.width;
    const height = sourceImage.naturalHeight || sourceImage.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw source image onto canvas
    ctx.drawImage(sourceImage, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 1. Auto-detect target color if not provided (sample 4 corners)
    let bgR, bgG, bgB;
    if (targetColor) {
      bgR = targetColor.r;
      bgG = targetColor.g;
      bgB = targetColor.b;
    } else {
      const corners = [
        0, // top-left
        (width - 1) * 4, // top-right
        ((height - 1) * width) * 4, // bottom-left
        ((height - 1) * width + (width - 1)) * 4 // bottom-right
      ];
      let rSum = 0, gSum = 0, bSum = 0;
      for (const idx of corners) {
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
      }
      bgR = Math.round(rSum / 4);
      bgG = Math.round(gSum / 4);
      bgB = Math.round(bSum / 4);
    }

    // Tolerance distance threshold in RGB space (0 to 441.67)
    const maxDist = 441.67;
    const threshold = (tolerance / 100) * maxDist;
    const featherRange = smoothEdges ? Math.max(10, threshold * 0.35) : 0;

    function colorDist(idx) {
      const dr = data[idx] - bgR;
      const dg = data[idx + 1] - bgG;
      const db = data[idx + 2] - bgB;
      return Math.hypot(dr, dg, db);
    }

    const totalPixels = width * height;
    const mask = new Uint8Array(totalPixels); // 0 = unvisited, 1 = transparent, 2 = border feather

    if (mode === 'contiguous') {
      // Flood Fill from outer edges inward
      const queue = new Int32Array(totalPixels);
      let qHead = 0;
      let qTail = 0;

      // Seed queue with all edge pixels that match background
      for (let x = 0; x < width; x++) {
        // Top edge
        const topIdx = x;
        if (colorDist(topIdx * 4) <= threshold + featherRange) {
          mask[topIdx] = 1;
          queue[qTail++] = topIdx;
        }
        // Bottom edge
        const btmIdx = (height - 1) * width + x;
        if (mask[btmIdx] === 0 && colorDist(btmIdx * 4) <= threshold + featherRange) {
          mask[btmIdx] = 1;
          queue[qTail++] = btmIdx;
        }
      }

      for (let y = 0; y < height; y++) {
        // Left edge
        const leftIdx = y * width;
        if (mask[leftIdx] === 0 && colorDist(leftIdx * 4) <= threshold + featherRange) {
          mask[leftIdx] = 1;
          queue[qTail++] = leftIdx;
        }
        // Right edge
        const rightIdx = y * width + (width - 1);
        if (mask[rightIdx] === 0 && colorDist(rightIdx * 4) <= threshold + featherRange) {
          mask[rightIdx] = 1;
          queue[qTail++] = rightIdx;
        }
      }

      // BFS Flood Fill
      while (qHead < qTail) {
        const curr = queue[qHead++];
        const cx = curr % width;
        const cy = (curr / width) | 0;

        const neighbors = [
          cy > 0 ? curr - width : -1, // up
          cy < height - 1 ? curr + width : -1, // down
          cx > 0 ? curr - 1 : -1, // left
          cx < width - 1 ? curr + 1 : -1 // right
        ];

        for (const next of neighbors) {
          if (next >= 0 && mask[next] === 0) {
            const dist = colorDist(next * 4);
            if (dist <= threshold + featherRange) {
              mask[next] = 1;
              queue[qTail++] = next;
            }
          }
        }
      }

      // Apply transparency according to mask and feathering
      for (let i = 0; i < totalPixels; i++) {
        if (mask[i] === 1) {
          const pIdx = i * 4;
          const dist = colorDist(pIdx);
          if (dist <= threshold) {
            data[pIdx + 3] = 0; // Fully transparent
          } else if (featherRange > 0) {
            // Smoothly ramp alpha at edges to prevent harsh jagged edges
            const alphaFactor = (dist - threshold) / featherRange;
            data[pIdx + 3] = Math.min(data[pIdx + 3], Math.round(255 * alphaFactor));
          }
        }
      }

    } else {
      // Global mode: remove all matching pixels anywhere
      for (let i = 0; i < totalPixels; i++) {
        const pIdx = i * 4;
        const dist = colorDist(pIdx);
        if (dist <= threshold) {
          data[pIdx + 3] = 0;
        } else if (featherRange > 0 && dist <= threshold + featherRange) {
          const alphaFactor = (dist - threshold) / featherRange;
          data[pIdx + 3] = Math.min(data[pIdx + 3], Math.round(255 * alphaFactor));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Sample the average corner color of an image
   */
  static getCornerColor(sourceImage) {
    const width = sourceImage.naturalWidth || sourceImage.width;
    const height = sourceImage.naturalHeight || sourceImage.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImage, 0, 0, width, height);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    return { r: p[0], g: p[1], b: p[2] };
  }
}

