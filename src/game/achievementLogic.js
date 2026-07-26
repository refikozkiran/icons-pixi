import { useProgress } from '../state/progressStore.js';

// Bölüm bitişinde hangi başarımların açıldığını hesaplar ve ilgili sayaçları günceller.
export function checkAchievements({ completedCount, hintsUsed, elapsed, sessionStreak }) {
  const newly = [];
  const unlock = id => { if (useProgress.getState().unlockAchievement(id)) newly.push(id); };

  if (completedCount >= 1) unlock('first_win');
  if (completedCount >= 10) unlock('levels_10');
  if (completedCount >= 20) unlock('levels_20');
  if (completedCount >= 30) unlock('levels_30');
  if (completedCount >= 40) unlock('levels_40');

  if (hintsUsed === 0) {
    useProgress.getState().registerHintlessWin();
    if (useProgress.getState().noHintCount >= 15) unlock('no_hint');
  }
  if (elapsed < 10) {
    useProgress.getState().registerSpeedWin();
    if (useProgress.getState().speedCount >= 3) unlock('speed_10');
  }
  if (sessionStreak >= 5) unlock('streak_5');

  return newly;
}
