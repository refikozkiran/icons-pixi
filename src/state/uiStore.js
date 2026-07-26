import { create } from 'zustand';

let toastSeq = 1;

export const useUI = create((set, get) => ({
  screen: 'home', // home | levels | game | store | achievements | settings
  modal: null,    // null | win | chest | achv | reset-confirm | howto
  toasts: [],

  sessionStreak: 0,
  lastWinInfo: null,          // { level, time, stars, coins }
  pendingChestAchievements: [],
  achvQueue: [],
  achvAfterAction: null,
  pendingBonusChest: false,
  chestAfterAction: null,

  goto(screen) { set({ screen }); },
  openModal(modal) { set({ modal }); },
  closeModal() { set({ modal: null }); },

  pushToast(title, sub, icon, coinReward) {
    const id = toastSeq++;
    set(s => ({ toasts: [...s.toasts, { id, title, sub, icon, coinReward }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3100);
  },

  bumpStreak() { set(s => ({ sessionStreak: s.sessionStreak + 1 })); },
  resetStreak() { set({ sessionStreak: 0 }); },

  setLastWinInfo(info) { set({ lastWinInfo: info }); },

  queueAchievements(ids, afterAction) {
    if (!ids || !ids.length) { if (afterAction) afterAction(); return; }
    set({ achvQueue: ids.slice(), achvAfterAction: afterAction || null, modal: 'achv' });
  },
  shiftAchievement() {
    const s = get();
    if (!s.achvQueue.length) return null;
    const id = s.achvQueue[0];
    set({ achvQueue: s.achvQueue.slice(1) });
    return id;
  },
  finishAchievementQueue() {
    const cb = get().achvAfterAction;
    set({ modal: null, achvAfterAction: null });
    if (cb) cb();
  },

  setPendingBonusChest(v) { set({ pendingBonusChest: v }); },
  openChest(afterAction) {
    set({ modal: 'chest', chestAfterAction: afterAction || null });
  },
  finishChest() {
    const cb = get().chestAfterAction;
    set({ modal: null, chestAfterAction: null });
    if (cb) cb();
  },
}));
