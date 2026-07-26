import { create } from 'zustand';
import { LEVELS } from '../data/levels.js';
import { emptyBoard } from '../game/queensLogic.js';

export const useGame = create((set, get) => ({
  idx: null,
  n: 0,
  region: null,
  queens: null,
  board: [],
  history: [],
  hintsUsed: 0,
  hintsMax: 3,
  startTime: 0,
  elapsed: 0,
  finished: false,

  startLevel(idx) {
    const lvl = LEVELS[idx];
    set({
      idx, n: lvl.n, region: lvl.region, queens: lvl.queens,
      board: emptyBoard(lvl.n), history: [], hintsUsed: 0, hintsMax: 3,
      startTime: Date.now(), elapsed: 0, finished: false,
    });
  },

  tapCell(cellIdx) {
    const s = get();
    if (s.finished) return;
    const prev = s.board[cellIdx];
    const next = (prev + 1) % 3;
    const board = s.board.slice();
    board[cellIdx] = next;
    set({ board, history: [...s.history, { idx: cellIdx, prev }] });
  },

  undo() {
    const s = get();
    if (s.finished || s.history.length === 0) return;
    const last = s.history[s.history.length - 1];
    const board = s.board.slice();
    board[last.idx] = last.prev;
    set({ board, history: s.history.slice(0, -1) });
  },

  resetBoard() {
    const s = get();
    if (s.finished) return;
    set({ board: emptyBoard(s.n), history: [] });
  },

  placeHintQueen(cellIdx, usedFromInventory) {
    const s = get();
    const board = s.board.slice();
    board[cellIdx] = 2;
    set({
      board,
      history: [...s.history, { idx: cellIdx, prev: s.board[cellIdx] }],
      hintsUsed: s.hintsUsed + 1,
      hintsMax: usedFromInventory ? s.hintsMax + 1 : s.hintsMax,
    });
  },

  tickElapsed() {
    const s = get();
    if (s.finished || !s.startTime) return;
    set({ elapsed: (Date.now() - s.startTime) / 1000 });
  },

  finish() {
    set({ finished: true });
  },
}));
