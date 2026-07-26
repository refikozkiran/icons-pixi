import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, REGION_COLORS } from '../theme.js';
import { useGame } from '../../state/gameStore.js';
import { useProgress, HINT_STAR_COST } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';
import { STORE_ICONS } from '../../data/storeIcons.js';
import { computeConflicts, checkWin, fmtTime } from '../../game/queensLogic.js';
import { checkAchievements } from '../../game/achievementLogic.js';
import { playVictoryChime, playTapSound, vibrate } from '../../audio/sfx.js';

export default function GameScreen() {
  const game = useGame();
  const progress = useProgress();
  const ui = useUI();
  const [now, setNow] = useState(Date.now());
  const [hintMsg, setHintMsg] = useState('Tek dokunuş: ✕  ·  Çift dokunuş: İkon');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [game.idx]);

  const styles = useMemo(() => ({
    lvl: new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '700', fill: 0xa79fd6 }),
    timer: new TextStyle({ fontFamily: fontFamily(), fontSize: 19, fontWeight: '800', fill: 0xeae6ff }),
    toolLabel: new TextStyle({ fontFamily: fontFamily(), fontSize: 10.5, fontWeight: '700', fill: 0xa79fd6 }),
    toolIcon: new TextStyle({ fontFamily: fontFamily(), fontSize: 17 }),
    hintBadge: new TextStyle({ fontFamily: fontFamily(), fontSize: 9, fontWeight: '800', fill: 0x2a1000 }),
    hintMsg: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fill: 0xa79fd6, fontWeight: '600', wordWrap: true, wordWrapWidth: VW - 40, align: 'center' }),
  }), []);

  if (game.idx == null) return null;

  const n = game.n;
  const conflicts = computeConflicts(n, game.region, game.board);
  const elapsed = game.finished ? game.elapsed : (now - game.startTime) / 1000;
  const equippedDef = STORE_ICONS.find(s => s.id === progress.equippedIcon) || STORE_ICONS[0];

  const boardSize = VW - 40;
  const boardX = 20, boardY = 176;
  const cellSize = boardSize / n;
  const gap = 2;

  function finishLevel() {
    const finalElapsed = (Date.now() - game.startTime) / 1000;
    useGame.getState().finish();
    const { stars, coinsEarned, bestTime } = progress.completeLevel(game.idx, finalElapsed, game.hintsUsed);
    ui.bumpStreak();
    const completedCount = useProgress.getState().overallStats().completed;
    const newAchievements = checkAchievements({
      completedCount, hintsUsed: game.hintsUsed, elapsed: finalElapsed,
      sessionStreak: useUI.getState().sessionStreak,
    });
    ui.setLastWinInfo({ level: game.idx + 1, time: finalElapsed, stars, coins: coinsEarned, bestTime, hintsUsed: game.hintsUsed });
    useUI.setState({ pendingChestAchievements: newAchievements });
    vibrate([40, 30, 40, 30, 90]);
    playVictoryChime();
    setTimeout(() => ui.openModal('win'), 260);
  }

  function onCellTap(idx) {
    if (game.finished) return;
    useGame.getState().tapCell(idx);
    const s = useGame.getState();
    if (checkWin(n, s.region, s.board)) {
      finishLevel();
    }
  }

  function onUndo() {
    if (game.finished || game.history.length === 0) return;
    useGame.getState().undo();
  }
  function onResetBoard() {
    if (game.finished) return;
    useGame.getState().resetBoard();
  }
  function onRestartLevel() {
    useGame.getState().startLevel(game.idx);
    setHintMsg('Tek dokunuş: ✕  ·  Çift dokunuş: İkon');
  }
  function onBack() {
    ui.resetStreak();
    ui.goto('home');
  }
  function onHint() {
    if (game.finished) return;
    let usedFromInventory = false;
    if (game.hintsUsed >= game.hintsMax) {
      const ok = progress.consumeHintItem();
      if (!ok) {
        setHintMsg('İpucu hakkın kalmadı. Mağazadan satın alabilirsin.');
        return;
      }
      usedFromInventory = true;
    }
    let target = -1;
    for (let r = 0; r < n; r++) {
      const c = game.queens[r];
      const cellIdx = r * n + c;
      if (game.board[cellIdx] !== 2) { target = cellIdx; break; }
    }
    if (target === -1) {
      setHintMsg('Zaten doğru yoldasın!');
      if (usedFromInventory) progress.refundHintItem();
      return;
    }
    useGame.getState().placeHintQueen(target, usedFromInventory);
    setHintMsg(usedFromInventory ? 'Envanterden ipucu kullanıldı!' : 'İpucu kullanıldı: bir ikon yerleştirildi.');
    const s = useGame.getState();
    if (checkWin(n, s.region, s.board)) finishLevel();
  }

  const remaining = Math.max(0, game.hintsMax - game.hintsUsed);
  const extraHints = progress.hintItems || 0;

  return (
    <Container>
      {/* header */}
      <HeaderBtn x={16} y={20} icon="←" onTap={onBack} />
      <Text text={'Bölüm ' + (game.idx + 1) + ' · ' + n + '×' + n} x={VW / 2} y={30} anchor={{ x: 0.5, y: 0 }} style={styles.lvl} />
      <Text text={fmtTime(elapsed)} x={VW / 2} y={48} anchor={{ x: 0.5, y: 0 }} style={styles.timer} />
      <HeaderBtn x={VW - 56} y={20} icon="⟳" onTap={onRestartLevel} />

      {/* toolbar */}
      <ToolBtn x={16} y={92} width={(VW - 32 - 16) / 3} icon="↩️" label="Geri Al" onTap={onUndo} disabled={game.history.length === 0 || game.finished} />
      <ToolBtn x={16 + (VW - 32 - 16) / 3 + 8} y={92} width={(VW - 32 - 16) / 3} icon="🗑️" label="Temizle" onTap={onResetBoard} disabled={game.finished} />
      <ToolBtn
        x={16 + 2 * ((VW - 32 - 16) / 3 + 8)} y={92} width={(VW - 32 - 16) / 3} icon="💡" label="İpucu" onTap={onHint} disabled={game.finished}
        badge={extraHints > 0 ? (remaining + '+' + extraHints) : String(remaining)}
      />

      <Text text={hintMsg} x={VW / 2} y={148} anchor={{ x: 0.5, y: 0 }} style={styles.hintMsg} />

      {/* board */}
      <Container x={boardX} y={boardY}>
        <Graphics draw={g => { g.clear(); g.beginFill(0x000000, 0.25); g.lineStyle(1, 0x332a5c, 1); g.drawRoundedRect(-8, -8, boardSize + 16, boardSize + 16, 18); g.endFill(); }} />
        {Array.from({ length: n * n }).map((_, i) => {
          const r = Math.floor(i / n), c = i % n;
          return (
            <Cell
              key={i}
              x={c * cellSize} y={r * cellSize} size={cellSize} gap={gap}
              regionColor={REGION_COLORS[game.region[r][c] % REGION_COLORS.length]}
              state={game.board[i]}
              conflict={conflicts[i]}
              icon={equippedDef.icon}
              onTap={() => onCellTap(i)}
            />
          );
        })}
      </Container>
    </Container>
  );
}

function HeaderBtn({ x, y, icon, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.06);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, 40, 40, 12);
    g.endFill();
  }, []);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 17, fill: 0xeae6ff });
  return (
    <Container x={x} y={y} interactive cursor="pointer" pointertap={() => { playTapSound(); onTap(); }}>
      <Graphics draw={draw} />
      <Text text={icon} x={20} y={20} anchor={0.5} style={style} />
    </Container>
  );
}

function ToolBtn({ x, y, width, icon, label, onTap, disabled, badge }) {
  const height = 48;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.06);
    g.lineStyle(1, 0xffffff, 0.08);
    g.drawRoundedRect(0, 0, width, height, 16);
    g.endFill();
  }, [width]);
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 17 });
  const lblStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 10, fontWeight: '700', fill: 0xa79fd6 });
  const badgeStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9, fontWeight: '800', fill: 0x2a1000 });
  return (
    <Container x={x} y={y} interactive={!disabled} cursor={disabled ? 'default' : 'pointer'} alpha={disabled ? 0.35 : 1}
      pointertap={() => { if (!disabled) { playTapSound(); onTap(); } }}>
      <Graphics draw={draw} />
      <Text text={icon} x={width / 2} y={16} anchor={0.5} style={iconStyle} />
      <Text text={label} x={width / 2} y={36} anchor={0.5} style={lblStyle} />
      {badge && (
        <Container x={width - 6} y={2}>
          <Graphics draw={g => { g.clear(); g.beginFill(0xffcb57); g.drawRoundedRect(-14, 0, 28, 15, 7); g.endFill(); }} />
          <Text text={badge} x={0} y={7} anchor={0.5} style={badgeStyle} />
        </Container>
      )}
    </Container>
  );
}

function Cell({ x, y, size, gap, regionColor, state, conflict, icon, onTap }) {
  const s = size - gap;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(regionColor, 1);
    g.drawRect(0, 0, s, s);
    g.endFill();
    if (conflict) {
      g.beginFill(0xff5d7a, 0.4);
      g.drawRect(0, 0, s, s);
      g.endFill();
    }
  }, [regionColor, conflict, s]);

  const xStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: Math.min(s * 0.55, 24), fontWeight: '700', fill: 0x14152d });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: Math.min(s * 0.55, 26) });

  return (
    <Container x={x} y={y} interactive cursor="pointer" pointertap={onTap}>
      <Graphics draw={draw} />
      {state === 1 && <Text text="✕" x={s / 2} y={s / 2} anchor={0.5} style={xStyle} />}
      {state === 2 && <Text text={icon} x={s / 2} y={s / 2} anchor={0.5} style={iconStyle} />}
    </Container>
  );
}
