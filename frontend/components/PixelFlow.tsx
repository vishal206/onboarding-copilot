"use client";

import { useEffect, useRef } from "react";

const PALETTE_HSL: [number, number, number][] = [
  [180, 45, 18],
  [179, 43, 28],
  [178, 41, 40],
  [177, 44, 52],
  [175, 46, 70],
  [173, 48, 80],
];
const BG_COLOR = "#0a0a0a";
const PIXEL_SIZE = 9;
const GAP = 3;
const SPEED = 1;
const SHOW_DOT = true;

class SimplexNoise {
  grad3: number[][];
  p: number[];
  perm: number[];

  constructor(seed?: number) {
    if (seed === undefined) seed = Math.random();
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
    ];
    this.p = [];
    for (let i = 0; i < 256; i++) this.p[i] = Math.floor(seed * 256 + i * 131.7) & 255;
    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const tt = (i + j) * G2;
    const X0 = i - tt, Y0 = j - tt;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const dot = (g: number[], x: number, y: number) => g[0] * x + g[1] * y;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot(this.grad3[this.perm[ii + this.perm[jj]] % 12], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot(this.grad3[this.perm[ii + i1 + this.perm[jj + j1]] % 12], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot(this.grad3[this.perm[ii + 1 + this.perm[jj + 1]] % 12], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }

  noise3D(x: number, y: number, z: number): number {
    return (this.noise2D(x, y) + this.noise2D(y + 31.416, z)) * 0.5;
  }
}

function hslToRgba(h: number, s: number, l: number, a: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return "rgba(" + Math.round((r + m) * 255) + "," + Math.round((g + m) * 255) + "," + Math.round((b + m) * 255) + "," + a + ")";
}

function sampleHsl(pal: [number, number, number][], t: number): [number, number, number] {
  const n = pal.length;
  const pos = ((t % 1) + 1) % 1 * n;
  const i0 = Math.floor(pos) % n;
  const i1 = (i0 + 1) % n;
  const f = pos - Math.floor(pos);
  const a = pal[i0], b = pal[i1];
  let dh = b[0] - a[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return [a[0] + dh * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}


export default function PixelFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; clicks: { x: number; y: number; time: number }[] }>({
    x: -9999, y: -9999, active: false, clicks: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const noise = new SimplexNoise();
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width || window.innerWidth;
      h = rect.height || window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;
      mouseRef.current.active = true;
    };
    const handleLeave = () => { mouseRef.current.active = false; };
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      mouseRef.current.clicks.push({ x: touch.clientX, y: touch.clientY, time: timeRef });
    };
    const handleTouchStart = (e: TouchEvent) => { handleMove(e); handleClick(e); };
    const handleTouchMove = (e: TouchEvent) => { handleMove(e); };

    // Listen on window so events are captured even when content layers sit above the canvas
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleLeave);

    let timeRef = 0;
    let lastFrame = 0;
    const loadStart = performance.now();
    let raf: number;

    const draw = (now: number) => {
      if (!lastFrame) lastFrame = now;
      let dt = (now - lastFrame) / 1000;
      if (dt > 0.1) dt = 0.1;
      lastFrame = now;
      timeRef += dt * SPEED;
      const t = timeRef;
      const elapsed = (now - loadStart) / 1000;
      const step = PIXEL_SIZE + GAP;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const cx = w / 2, cy = h / 2;
      const maxDist = Math.hypot(cx, cy);
      const mouse = mouseRef.current;
      mouse.clicks = mouse.clicks.filter((c) => t - c.time < 3.5);

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const origX = col * step;
          const origY = row * step;
          let colorT = 0, scale = 0.7, offX = 0, offY = 0;

          const n1 = noise.noise3D(col * 0.13, row * 0.13, t * 0.4);
          const n2 = noise.noise2D(col * 0.08 + t * 0.35, row * 0.08 - t * 0.25);
          colorT = n1 * 0.8 + t * 0.04;
          scale = 0.2 + (n2 * 0.5 + 0.5) * 1.3;
          offX = noise.noise2D(col * 0.2 + t * 0.5, row * 0.2) * 22;
          offY = noise.noise2D(col * 0.2, row * 0.2 + t * 0.5) * 22;

          let px = origX + offX;
          let py = origY + offY;
          let hueShift = 0, lightShift = 0, satShift = 0;

          if (mouse.active) {
            const mdx = origX - mouse.x;
            const mdy = origY - mouse.y;
            const md = Math.hypot(mdx, mdy);
            const radius = 220;
            if (md < radius) {
              const f = 1 - md / radius;
              const eased = f * f;
              hueShift = eased * 180;
              lightShift = eased * 25;
              satShift = eased * 30;
              scale *= 1 + eased * 0.7;
            }
          }

          for (let i = 0; i < mouse.clicks.length; i++) {
            const click = mouse.clicks[i];
            const cdx = origX - click.x, cdy = origY - click.y;
            const cd = Math.hypot(cdx, cdy);
            const age = t - click.time;
            const rippleR = age * 340;
            const rippleW = 110;
            const rDist = Math.abs(cd - rippleR);
            if (rDist < rippleW) {
              const fade = Math.max(0, 1 - age / 2.5);
              const ff = (1 - rDist / rippleW) * fade;
              const eF = ff * ff;
              hueShift += eF * 220;
              lightShift += eF * 30;
              satShift += eF * 40;
              scale += eF * 0.9;
            }
          }

          const distC = Math.hypot(origX - cx, origY - cy) / maxDist;
          const activation = distC * 0.8 + 0.05;
          let loadProg = (elapsed - activation) / 0.35;
          if (loadProg < 0) loadProg = 0;
          if (loadProg > 1) loadProg = 1;
          loadProg = loadProg * loadProg * (3 - 2 * loadProg);
          scale *= loadProg;
          if (scale < 0.05) continue;

          const hsl = sampleHsl(PALETTE_HSL, colorT);
          const finalH = hsl[0] + hueShift;
          const finalS = Math.max(0, Math.min(100, hsl[1] + satShift));
          const finalL = Math.max(5, Math.min(88, hsl[2] + lightShift));
          const centerX = px + PIXEL_SIZE / 2;
          const centerY = py + PIXEL_SIZE / 2;

          const size = PIXEL_SIZE * scale;
          ctx.fillStyle = hslToRgba(finalH, finalS, finalL, 0.96);
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.fill();
          if (SHOW_DOT) {
            const dotSize = size * 0.2;
            ctx.fillStyle = hslToRgba(finalH, finalS * 0.85, Math.max(8, finalL - 28), 0.92);
            ctx.beginPath();
            ctx.arc(centerX, centerY, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "#0a0a0a",
        touchAction: "none",
      }}
    />
  );
}
