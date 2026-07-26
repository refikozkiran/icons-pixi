import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS } from '../data/levels.js';

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAILY_COIN_REWARD = 10;
export const HINT_STAR_COST = 100;

const initialState = {
  levels: {},           // { [idx]: { done, bestTime, stars } }
  achievements: {},      // { [id]: true }
  coins: 0,
  luckyStars: 0,
  hintItems: 0,
  noHintCount: 0,
  speedCount: 0,
  musicTrack: 'none',
  ownedIcons: ['crystal'],
  equippedIcon: 'crystal',
  dailyLastClaim: null,
  tutorialDone: false,
};

export const useProgress = create(
  persist(
    (set, get) => ({
      ...initialState,

      addCoins(amount) {
        if (!amount) return;
        set(s => ({ coins: (s.coins || 0) + amount }));
      },
      addStars(amount) {
        if (!amount) return;
        set(s => ({ luckyStars: (s.luckyStars || 0) + amount }));
      },
      spendCoins(amount) {
        const ok = (get().coins || 0) >= amount;
        if (ok) set(s => ({ coins: s.coins - amount }));
        return ok;
      },
      spendStars(amount) {
        const ok = (get().luckyStars || 0) >= amount;
        if (ok) set(s => ({ luckyStars: s.luckyStars - amount }));
        return ok;
      },

      completeLevel(idx, elapsed, hintsUsed) {
        const stars = hintsUsed === 0 ? 3 : (hintsUsed === 1 ? 2 : 1);
        const prev = get().levels[idx];
        const bestTime = (prev && prev.bestTime != null) ? Math.min(prev.bestTime, elapsed) : elapsed;
        const bestStars = Math.max(stars, prev ? (prev.stars || 0) : 0);
        const coinsEarned = 15 + stars * 5;
        set(s => ({
          levels: { ...s.levels, [idx]: { done: true, bestTime, stars: bestStars } },
          coins: (s.coins || 0) + coinsEarned,
        }));
        return { stars, coinsEarned, bestTime };
      },

      registerHintlessWin() {
        set(s => ({ noHintCount: (s.noHintCount || 0) + 1 }));
      },
      registerSpeedWin() {
        set(s => ({ speedCount: (s.speedCount || 0) + 1 }));
      },

      unlockAchievement(id) {
        if (get().achievements[id]) return false;
        set(s => ({ achievements: { ...s.achievements, [id]: true } }));
        return true;
      },

      buyIcon(def) {
        const s = get();
        if ((s.coins || 0) < def.price) return false;
        set(st => ({
          coins: st.coins - def.price,
          ownedIcons: [...st.ownedIcons, def.id],
          equippedIcon: def.id,
        }));
        return true;
      },
      equipIcon(id) {
        set({ equippedIcon: id });
      },

      buyHint() {
        const s = get();
        if ((s.luckyStars || 0) < HINT_STAR_COST) return false;
        set(st => ({ luckyStars: st.luckyStars - HINT_STAR_COST, hintItems: (st.hintItems || 0) + 1 }));
        return true;
      },
      consumeHintItem() {
        const s = get();
        if ((s.hintItems || 0) <= 0) return false;
        set(st => ({ hintItems: st.hintItems - 1 }));
        return true;
      },
      refundHintItem() {
        set(st => ({ hintItems: (st.hintItems || 0) + 1 }));
      },

      isDailyClaimed() {
        return get().dailyLastClaim === todayStr();
      },
      claimDaily() {
        if (get().isDailyClaimed()) return false;
        set(s => ({ dailyLastClaim: todayStr(), coins: (s.coins || 0) + DAILY_COIN_REWARD }));
        return true;
      },

      setMusicTrack(id) {
        set({ musicTrack: id });
      },
      setTutorialDone() {
        set({ tutorialDone: true });
      },

      firstIncompleteLevel() {
        const levels = get().levels;
        for (let i = 0; i < LEVELS.length; i++) {
          const lv = levels[i];
          if (!lv || !lv.done) return i;
        }
        return LEVELS.length - 1;
      },
      isLevelUnlocked(idx) {
        if (idx === 0) return true;
        const prev = get().levels[idx - 1];
        return !!(prev && prev.done);
      },
      overallStats() {
        const levels = get().levels;
        let completed = 0, stars = 0, best = null, bestIdx = null, worst = null, worstIdx = null, sum = 0, timedCount = 0;
        for (const k in levels) {
          const lv = levels[k];
          if (lv.done) {
            completed++;
            stars += (lv.stars || 0);
            if (lv.bestTime != null) {
              sum += lv.bestTime; timedCount++;
              if (best == null || lv.bestTime < best) { best = lv.bestTime; bestIdx = k; }
              if (worst == null || lv.bestTime > worst) { worst = lv.bestTime; worstIdx = k; }
            }
          }
        }
        const avg = timedCount > 0 ? sum / timedCount : null;
        return { completed, stars, best, bestIdx, worst, worstIdx, avg };
      },

      resetProgress() {
        set({ ...initialState, levels: {}, achievements: {}, ownedIcons: ['crystal'] });
      },
    }),
    { name: 'icons_refo_progress_v2' }
  )
);
