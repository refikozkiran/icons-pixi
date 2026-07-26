// Orijinal oyunun nebula/gece paleti — hex sayı ve string biçimleri PixiJS'te ayrı ayrı kullanışlı.
export const COLORS = {
  bgDeep: 0x0a0a1f,
  bgMid: 0x160b2e,
  bgNebula: 0x2a1050,
  accent: 0x8b7cff,
  accent2: 0x39d3f0,
  gold: 0xffcb57,
  text: 0xeae6ff,
  textDim: 0xa79fd6,
  card: 0x171233,
  cardLine: 0x332a5c,
  danger: 0xff5d7a,
  good: 0x4be3a3,
};

export const CSS = {
  bgDeep: '#0a0a1f',
  bgMid: '#160b2e',
  bgNebula: '#2a1050',
  accent: '#8b7cff',
  accent2: '#39d3f0',
  gold: '#ffcb57',
  text: '#eae6ff',
  textDim: '#a79fd6',
  card: '#171233',
  cardLine: '#332a5c',
  danger: '#ff5d7a',
  good: '#4be3a3',
};

// Sanal tuval boyutu: her ekran bu referans çözünürlükte tasarlanır,
// App.jsx bunu pencereye "contain" mantığıyla ölçekler (letterbox).
export const VW = 440;
export const VH = 920;

export const REGION_COLORS = [0xf87171, 0xfb923c, 0xfbbf24, 0xa3e635, 0x34d399, 0x22d3ee, 0x60a5fa, 0xa78bfa, 0xf472b6, 0xfca5a5];

export const RARITY_COLORS = {
  common: 0x8b93a8,
  rare: 0x39d3f0,
  epic: 0xa78bff,
  legendary: 0xffcb57,
};

export function fontFamily() {
  return "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
}
