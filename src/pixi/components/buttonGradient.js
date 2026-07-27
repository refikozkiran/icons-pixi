import { Texture } from 'pixi.js';

// Aynı boyut+renk kombinasyonu için canvas gradient dokusunu tekrar üretmemek adına
// basit bir önbellek. Butonlar sık re-render olsa da texture yeniden çizilmez.
const cache = new Map();

function toCss(hex, alpha = 1) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundedRectPath(ctx, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(rr, 0);
  ctx.arcTo(w, 0, w, h, rr);
  ctx.arcTo(w, h, 0, h, rr);
  ctx.arcTo(0, h, 0, 0, rr);
  ctx.arcTo(0, 0, w, 0, rr);
  ctx.closePath();
}

/**
 * Dikey linear-gradient dolgulu, köşeleri yuvarlatılmış bir buton yüzeyi dokusu üretir.
 * topColor -> bottomColor arası yumuşak geçiş; isteğe bağlı üstte parlak "gloss" şeridi.
 */
export function getButtonFaceTexture({ width, height, radius, topColor, bottomColor, gloss = true }) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const key = `face-${w}x${h}-${radius}-${topColor}-${bottomColor}-${gloss}`;
  if (cache.has(key)) return cache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  roundedRectPath(ctx, w, h, radius);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, toCss(topColor));
  grad.addColorStop(1, toCss(bottomColor));
  ctx.fillStyle = grad;
  ctx.fill();

  if (gloss) {
    ctx.save();
    roundedRectPath(ctx, w, h, radius);
    ctx.clip();
    const glossGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    glossGrad.addColorStop(0, 'rgba(255,255,255,0.32)');
    glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glossGrad;
    ctx.fillRect(0, 0, w, h * 0.55);
    ctx.restore();
  }

  const texture = Texture.from(canvas);
  cache.set(key, texture);
  return texture;
}
