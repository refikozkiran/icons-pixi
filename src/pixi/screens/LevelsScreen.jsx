import React, { useCallback, useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, VH } from '../theme.js';
import TopBar from '../components/TopBar.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import { LEVELS } from '../../data/levels.js';
import { useProgress } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';
import { useGame } from '../../state/gameStore.js';
import { fmtTime } from '../../game/queensLogic.js';
import { playTapSound } from '../../audio/sfx.js';
import { dragGuard } from '../interactionGuard.js';

const ROW_H = 68;
const GAP = 10;

export default function LevelsScreen() {
  const progress = useProgress();
  const goto = useUI(s => s.goto);
  const startLevel = useGame(s => s.startLevel);
  const stats = progress.overallStats();

  const listTop = 92;
  const listHeight = VH - 74 - listTop - 10;
  const contentHeight = LEVELS.length * (ROW_H + GAP);

  const style = useMemo(() => ({
    progress: new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fontWeight: '700', fill: 0xa79fd6 }),
  }), []);

  return (
    <Container>
      <TopBar title="BÖLÜMLER" onBack={() => goto('home')} />
      <Text text={stats.completed + ' / ' + LEVELS.length + ' tamamlandı'} x={VW / 2} y={68} anchor={0.5} style={style.progress} />
      <ScrollArea x={16} y={listTop} width={VW - 32} height={listHeight} contentHeight={contentHeight}>
        {LEVELS.map((lvl, idx) => (
          <LevelRow
            key={idx}
            y={idx * (ROW_H + GAP)}
            width={VW - 32}
            idx={idx}
            lvl={lvl}
            unlocked={progress.isLevelUnlocked(idx)}
            data={progress.levels[idx]}
            onTap={() => { startLevel(idx); goto('game'); }}
          />
        ))}
      </ScrollArea>
    </Container>
  );
}

function LevelRow({ y, width, idx, lvl, unlocked, data, onTap }) {
  const done = !!(data && data.done);
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, done ? 0.07 : 0.04);
    g.lineStyle(1, done ? 0x8b7cff : 0x332a5c, done ? 0.5 : 1);
    g.drawRoundedRect(0, 0, width, ROW_H, 16);
    g.endFill();
  }, [width, done]);

  const drawBadge = useCallback(g => {
    g.clear();
    g.beginFill(done ? 0xffcb57 : (unlocked ? 0x8b7cff : 0x332a5c), 1);
    g.drawRoundedRect(0, 0, 44, 44, 13);
    g.endFill();
  }, [done, unlocked]);

  const titleStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13.5, fontWeight: '800', fill: 0xeae6ff });
  const sizeStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 11, fontWeight: '600', fill: 0xa79fd6 });
  const badgeStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 16, fontWeight: '800', fill: 0x0a0a1f });
  const timeStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: 0xeae6ff });
  const starsStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fill: 0xffcb57 });
  const lockStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 18 });
  const emptyStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 11, fill: 0xa79fd6, fontWeight: '600' });

  return (
    <Container y={y} interactive={unlocked} cursor={unlocked ? 'pointer' : 'default'} pointertap={() => { if (unlocked && !dragGuard.active) { playTapSound(); onTap(); } }}>
      <Graphics draw={draw} />
      <Graphics draw={drawBadge} x={12} y={12} />
      <Text text={String(idx + 1)} x={34} y={34} anchor={0.5} style={badgeStyle} />
      <Text text={'Bölüm ' + (idx + 1)} x={70} y={20} style={titleStyle} />
      <Text text={lvl.n + '×' + lvl.n + ' bulmaca'} x={70} y={40} style={sizeStyle} />
      {!unlocked ? (
        <Text text="🔒" x={width - 30} y={34} anchor={0.5} style={lockStyle} />
      ) : done ? (
        <Container x={width - 16} y={0}>
          <Text text={fmtTime(data.bestTime)} x={0} y={20} anchor={{ x: 1, y: 0 }} style={timeStyle} />
          <Text text={'★'.repeat(data.stars || 0) + '☆'.repeat(3 - (data.stars || 0))} x={0} y={40} anchor={{ x: 1, y: 0 }} style={starsStyle} />
        </Container>
      ) : (
        <Text text="Oynanmadı" x={width - 16} y={34} anchor={{ x: 1, y: 0.5 }} style={emptyStyle} />
      )}
    </Container>
  );
}
