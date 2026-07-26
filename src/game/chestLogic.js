import { LEVELS } from '../data/levels.js';
import { STORE_ICONS } from '../data/storeIcons.js';

export function chestProgressFrac(levelIdx) {
  const idx = typeof levelIdx === 'number' ? levelIdx : 0;
  return Math.min(1, Math.max(0, idx / Math.max(1, LEVELS.length - 1)));
}

function getChestWeights(f) {
  return {
    common: Math.max(14, 60 - f * 44),
    rare: 28 + f * 8,
    epic: 10 + f * 20,
    legendary: 2 + f * 16,
  };
}

function pickChestIcon(ownedIcons, f) {
  const pool = STORE_ICONS.filter(s => !ownedIcons.includes(s.id));
  if (!pool.length) return null;
  const weights = getChestWeights(f);
  const total = pool.reduce((sum, s) => sum + (weights[s.rarity] || 10), 0);
  let r = Math.random() * total;
  for (const s of pool) {
    r -= (weights[s.rarity] || 10);
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
}

// levelIdx: sandığın tetiklendiği bölüm indexi (ödül büyüklüğünü ölçekler)
// ownedIcons: mevcut sahip olunan ikon id listesi
export function buildChestRewards(levelIdx, ownedIcons) {
  const f = chestProgressFrac(levelIdx);
  const isFirstLevel = levelIdx === 0;
  const cards = [];

  let coinAmt = Math.round(40 + f * 90 + Math.random() * (50 + f * 60));

  const iconChance = isFirstLevel ? 0 : Math.min(0.4, 0.08 + f * 0.32);
  const iconDef = (Math.random() < iconChance) ? pickChestIcon(ownedIcons, f) : null;
  if (iconDef) {
    cards.push({ type: 'icon', title: iconDef.name, sub: 'Yeni İkon!', icon: iconDef.icon, def: iconDef });
  } else if (Math.random() < 0.75) {
    coinAmt += Math.round(30 + f * 45 + Math.random() * 30);
  }

  const bonusRoll = Math.random();
  if (bonusRoll < 0.15 + f * 0.1) {
    cards.push({ type: 'chest', title: 'Bonus!', sub: 'Sandık', icon: '🎁' });
  } else if (bonusRoll < 0.55 + f * 0.1) {
    coinAmt += Math.round(15 + f * 35 + Math.random() * 15);
  }

  cards.unshift({ type: 'coin', title: '+' + coinAmt, sub: 'Altın', amount: coinAmt, icon: 'coin' });

  if (Math.random() < 0.65) {
    const starAmt = Math.round(20 + f * 50 + Math.random() * 30);
    cards.push({ type: 'star', title: '+' + starAmt, sub: 'Şans Yıldızı', amount: starAmt, icon: '⭐' });
  }

  return cards;
}
