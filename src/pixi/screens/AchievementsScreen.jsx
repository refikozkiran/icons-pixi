import React, { useCallback, useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, VH } from '../theme.js';
import TopBar from '../components/TopBar.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { useProgress } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';

const ROW_H = 76;
const GAP = 10;

export default function AchievementsScreen() {
  const progress = useProgress();
  const goto = useUI(s => s.goto);
  const unlockedIds = Object.keys(progress.achievements || {}).filter(id => progress.achievements[id]);
  const pct = Math.round((unlockedIds.length / ACHIEVEMENTS.length) * 100);

  const listTop = 148;
  const listHeight = VH - 74 - listTop - 10;
  const contentHeight = ACHIEVEMENTS.length * (ROW_H + GAP);

  const styles = useMemo(() => ({
    pct: new TextStyle({ fontFamily: fontFamily(), fontSize: 30, fontWeight: '800', fill: 0xffcb57 }),
    count: new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fontWeight: '700', fill: 0xa79fd6 }),
  }), []);

  const drawTrack = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.08);
    g.drawRoundedRect(0, 0, VW - 32, 8, 4);
    g.endFill();
  }, []);
  const drawFill = useCallback(g => {
    g.clear();
    g.beginFill(0xffcb57, 1);
    g.drawRoundedRect(0, 0, Math.max(6, (VW - 32) * (pct / 100)), 8, 4);
    g.endFill();
  }, [pct]);

  return (
    <Container>
      <TopBar title="BAŞARIMLAR" onBack={() => goto('home')} />
      <Text text={pct + '%'} x={VW / 2} y={66} anchor={0.5} style={styles.pct} />
      <Text text={unlockedIds.length + ' / ' + ACHIEVEMENTS.length + ' kazanıldı'} x={VW / 2} y={104} anchor={0.5} style={styles.count} />
      <Graphics draw={drawTrack} x={16} y={122} />
      <Graphics draw={drawFill} x={16} y={122} />

      <ScrollArea x={16} y={listTop} width={VW - 32} height={listHeight} contentHeight={contentHeight}>
        {ACHIEVEMENTS.map((def, i) => (
          <AchvRow key={def.id} y={i * (ROW_H + GAP)} width={VW - 32} def={def} unlocked={!!progress.achievements[def.id]} />
        ))}
      </ScrollArea>
    </Container>
  );
}

function AchvRow({ y, width, def, unlocked }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, unlocked ? 0.07 : 0.035);
    g.lineStyle(1, unlocked ? 0xffcb57 : 0x332a5c, unlocked ? 0.5 : 1);
    g.drawRoundedRect(0, 0, width, ROW_H, 16);
    g.endFill();
  }, [width, unlocked]);
  const drawIconBg = useCallback(g => {
    g.clear();
    g.beginFill(unlocked ? 0xffcb57 : 0xffffff, unlocked ? 0.25 : 0.06);
    g.drawRoundedRect(0, 0, 50, 50, 15);
    g.endFill();
  }, [unlocked]);

  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 22, fill: 0xffffff });
  const titleStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13.5, fontWeight: '700', fill: unlocked ? 0xffe6a8 : 0xeae6ff });
  const descStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 10.5, fill: 0xa79fd6, fontWeight: '600', wordWrap: true, wordWrapWidth: width - 130 });
  const checkStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 18, fill: 0xffcb57 });

  return (
    <Container y={y} alpha={unlocked ? 1 : 0.55}>
      <Graphics draw={draw} />
      <Graphics draw={drawIconBg} x={13} y={13} />
      <Text text={def.icon} x={38} y={38} anchor={0.5} style={iconStyle} />
      <Text text={def.title} x={78} y={17} style={titleStyle} />
      <Text text={def.desc} x={78} y={38} style={descStyle} />
      {unlocked && <Text text="✓" x={width - 28} y={38} anchor={0.5} style={checkStyle} />}
    </Container>
  );
}
