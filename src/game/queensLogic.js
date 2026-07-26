// ICONS bulmacası: n x n tahtada her satıra, sütuna ve renkli bölgeye tam olarak
// bir ikon (taş) yerleştirilmeli; iki ikon çapraz komşu da olamaz.
// Hücre durumları: 0 = boş, 1 = X (buraya olamaz işareti), 2 = ikon (taş).

export function emptyBoard(n) {
  return Array(n * n).fill(0);
}

export function computeConflicts(n, region, board) {
  const conflict = Array(n * n).fill(false);
  const queenCells = [];
  for (let i = 0; i < n * n; i++) if (board[i] === 2) queenCells.push(i);
  for (let a = 0; a < queenCells.length; a++) {
    for (let b = a + 1; b < queenCells.length; b++) {
      const i1 = queenCells[a], i2 = queenCells[b];
      const r1 = Math.floor(i1 / n), c1 = i1 % n, r2 = Math.floor(i2 / n), c2 = i2 % n;
      const sameRow = r1 === r2, sameCol = c1 === c2;
      const sameRegion = region[r1][c1] === region[r2][c2];
      const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
      if (sameRow || sameCol || sameRegion || touching) {
        conflict[i1] = true; conflict[i2] = true;
      }
    }
  }
  return conflict;
}

export function checkWin(n, region, board) {
  let queenCount = 0;
  for (let i = 0; i < n * n; i++) if (board[i] === 2) queenCount++;
  if (queenCount !== n) return false;
  const conflicts = computeConflicts(n, region, board);
  return !conflicts.some(c => c);
}

export function fmtTime(sec) {
  if (sec == null) return '--:--';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
