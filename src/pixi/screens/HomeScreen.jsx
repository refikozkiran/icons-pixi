import React, { useCallback, useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, COLORS } from '../theme.js';
import { useProgress } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';
import { useGame } from '../../state/gameStore.js';
import { LEVELS } from '../../data/levels.js';
import { STORE_ICONS } from '../../data/storeIcons.js';
import { fmtTime } from '../../game/queensLogic.js';
import { playCoinChime, playTapSound, vibrate } from '../../audio/sfx.js';

const TILES = [
  { ch: 'I', c1: 0xffb08a, c2: 0xff5d7a },
  { ch: 'C', c1: 0xffe07a, c2: 0xffcb57 },
  { ch: 'O', c1: 0x9df3ff, c2: 0x39d3f0 },
  { ch: 'N', c1: 0xc3b6ff, c2: 0x8b7cff },
  { ch: 'S', c1: 0x8ff7d4, c2: 0x4be3a3 },
];

export default function HomeScreen() {
  const progress = useProgress();
  const goto = useUI(s => s.goto);
  const pushToast = useUI(s => s.pushToast);
  const startLevel = useGame(s => s.startLevel);

  const stats = progress.overallStats();
  const nextIdx = progress.firstIncompleteLevel();
  const overallPct = Math.round((stats.completed / LEVELS.length) * 100);
  const equippedDef = STORE_ICONS.find(s => s.id === progress.equippedIcon) || STORE_ICONS[0];
  const dailyClaimed = progress.isDailyClaimed();

  const play = () => {
    startLevel(nextIdx);
    goto('game');
  };

  const claimDaily = () => {
    if (dailyClaimed) {
      pushToast('Yarın tekrar gel', 'GÜNLÜK ÖDÜL', '🎁');
      return;
    }
    const ok = progress.claimDaily();
    if (ok) {
      vibrate(40);
      playCoinChime();
      pushToast('cebine düştü!', 'GÜNLÜK ÖDÜL ALINDI', '🎁', 10);
    }
  };

  // --- draw callbacks ---
  const drawAvatarPanel = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.05);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, 240, 60, 16);
    g.endFill();
  }, []);
  const drawAvatarCircle = useCallback(g => {
    g.clear();
    g.beginFill(0x2a1050, 1);
    g.lineStyle(2, 0xffcb57, 0.8);
    g.drawCircle(0, 0, 22);
    g.endFill();
  }, []);
  const drawXpTrack = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.08);
    g.drawRoundedRect(0, 0, 148, 6, 3);
    g.endFill();
  }, []);
  const drawXpFill = useCallback(g => {
    g.clear();
    const w = Math.max(4, 148 * (overallPct / 100));
    g.beginFill(0x39d3f0, 1);
    g.drawRoundedRect(0, 0, w, 6, 3);
    g.endFill();
  }, [overallPct]);

  const drawDailyBtn = useCallback(g => {
    g.clear();
    g.beginFill(0x8b7cff, 0.14);
    g.lineStyle(1, 0x8b7cff, 0.4);
    g.drawRoundedRect(0, 0, 408, 46, 14);
    g.endFill();
  }, []);

  const drawPlayBtn = useCallback(g => {
    g.clear();
    g.beginFill(0x1e0f37, 0.9);
    g.lineStyle(1.5, 0xffcb57, 0.6);
    g.drawRoundedRect(0, 0, 360, 62, 20);
    g.endFill();
  }, []);

  const drawLevelCard = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.045);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, 408, 92, 16);
    g.endFill();
  }, []);

  const drawHowtoCard = useCallback(g => {
    g.clear();
    g.beginFill(0x8b7cff, 0.1);
    g.lineStyle(1, 0x8b7cff, 0.28);
    g.drawRoundedRect(0, 0, 408, 56, 14);
    g.endFill();
  }, []);

  const drawStatsCard = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.045);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, 408, 132, 16);
    g.endFill();
  }, []);

  const dotCount = 10;
  const filledDots = Math.round((overallPct / 100) * dotCount);
  const dotW = (408 - 16 * 2 - (dotCount - 1) * 4) / dotCount;

  const styles = useMemo(() => ({
    lvl: new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fontWeight: '800', fill: 0xeae6ff }),
    coin: new TextStyle({ fontFamily: fontFamily(), fontSize: 22 }),
    small: new TextStyle({ fontFamily: fontFamily(), fontSize: 11, fontWeight: '700', fill: 0xeae6ff }),
    sub: new TextStyle({ fontFamily: fontFamily(), fontSize: 10, letterSpacing: 4, fill: 0xa79fd6, fontWeight: '600' }),
    playLabel: new TextStyle({ fontFamily: fontFamily(), fontSize: 20, fontWeight: '800', fill: 0xffcb57, letterSpacing: 1 }),
    playSub: new TextStyle({ fontFamily: fontFamily(), fontSize: 11, fill: 0xa79fd6, fontWeight: '600' }),
    cardTitle: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fontWeight: '800', fill: 0xeae6ff, letterSpacing: 1 }),
    cardPct: new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: 0xffcb57 }),
    cardNext: new TextStyle({ fontFamily: fontFamily(), fontSize: 10.5, fill: 0xa79fd6, fontWeight: '600' }),
    howtoText: new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '700', fill: 0xeae6ff }),
    statsTitle: new TextStyle({ fontFamily: fontFamily(), fontSize: 10, fontWeight: '800', fill: 0xa79fd6, letterSpacing: 1 }),
    statLbl: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fontWeight: '700', fill: 0xeae6ff }),
    statVal: new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: 0xffcb57 }),
    dailyText: new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '700', fill: 0xeae6ff }),
  }), []);

  return (
    <Container>
      {/* HUD row */}
      <Container x={16} y={20} interactive cursor="pointer" pointertap={() => { playTapSound(); goto('store'); }}>
        <Graphics draw={drawAvatarPanel} />
        <Graphics draw={drawAvatarCircle} x={30} y={30} />
        <Text text={equippedDef.icon} x={30} y={30} anchor={0.5} style={styles.coin} />
        <Text text={'Seviye ' + (stats.completed + 1)} x={58} y={17} style={styles.lvl} />
        <Graphics draw={drawXpTrack} x={58} y={38} />
        <Graphics draw={drawXpFill} x={58} y={38} />
      </Container>

      <CurrencyBadge x={264} y={20} width={160} height={28} icon="🪙" value={progress.coins} color={0xffcb57} onTap={() => goto('store')} />
      <CurrencyBadge x={264} y={52} width={160} height={28} icon="🌟" value={progress.luckyStars} color={0x8b7cff} onTap={() => goto('store')} />

      {/* daily gift */}
      <Container x={16} y={96} interactive cursor="pointer" pointertap={claimDaily}>
        <Graphics draw={drawDailyBtn} />
        <Text text={dailyClaimed ? '✅' : '🎁'} x={26} y={23} anchor={0.5} style={styles.coin} />
        <Text text={dailyClaimed ? 'Günlük ödül alındı — yarın tekrar gel' : 'Günlük Ödülünü Al  ·  +10 🪙'} x={50} y={23} anchor={{ x: 0, y: 0.5 }} style={styles.dailyText} />
      </Container>

      {/* wordmark */}
      <Container x={VW / 2 - (5 * 54 + 4 * 8) / 2} y={158}>
        {TILES.map((t, i) => <LogoTile key={t.ch} x={i * 62} data={t} />)}
      </Container>
      <Text text="◆  B U L M A C A  ◆" x={VW / 2} y={238} anchor={0.5} style={styles.sub} />

      {/* play button */}
      <Container x={(VW - 360) / 2} y={272} interactive cursor="pointer" pointertap={play}>
        <Graphics draw={drawPlayBtn} />
        <Text text={'▶  BÖLÜM ' + (nextIdx + 1)} x={180} y={24} anchor={0.5} style={styles.playLabel} />
        <Text text={LEVELS[nextIdx].n + '×' + LEVELS[nextIdx].n + ' bulmaca'} x={180} y={46} anchor={0.5} style={styles.playSub} />
      </Container>

      {/* level progress card */}
      <Container x={16} y={350} interactive cursor="pointer" pointertap={() => { playTapSound(); goto('levels'); }}>
        <Graphics draw={drawLevelCard} />
        <Text text={'BÖLÜM ' + (nextIdx + 1)} x={16} y={16} style={styles.cardTitle} />
        <Text text={overallPct + '%'} x={392} y={16} anchor={{ x: 1, y: 0 }} style={styles.cardPct} />
        {Array.from({ length: dotCount }).map((_, i) => (
          <Graphics
            key={i}
            draw={g => {
              g.clear();
              g.beginFill(i < filledDots ? 0x8b7cff : 0xffffff, i < filledDots ? 1 : 0.09);
              g.drawRoundedRect(0, 0, dotW, 7, 3.5);
              g.endFill();
            }}
            x={16 + i * (dotW + 4)} y={44}
          />
        ))}
        <Text
          text={nextIdx < LEVELS.length - 1 ? ('Sonraki Bölüm: ' + (nextIdx + 2)) : 'Tüm bölümler tamamlandı!'}
          x={204} y={70} anchor={0.5} style={styles.cardNext}
        />
      </Container>

      {/* howto card */}
      <Container x={16} y={454} interactive cursor="pointer" pointertap={() => { playTapSound(); useUI.getState().openModal('howto'); }}>
        <Graphics draw={drawHowtoCard} />
        <Text text="❓" x={28} y={28} anchor={0.5} style={styles.coin} />
        <Text text="Nasıl Oynanır?" x={52} y={28} anchor={{ x: 0, y: 0.5 }} style={styles.howtoText} />
        <Text text="›" x={388} y={28} anchor={0.5} style={styles.howtoText} />
      </Container>

      {/* stats card */}
      <Container x={16} y={522} interactive={false}>
        <Graphics draw={drawStatsCard} />
        <Text text="İSTATİSTİKLER" x={16} y={12} style={styles.statsTitle} />
        <StatRow y={38} icon="✅" label="Tamamlanan" value={stats.completed + '/' + LEVELS.length} />
        <StatRow y={70} icon="⭐" label="Toplam Yıldız" value={String(stats.stars)} />
        <StatRow y={102} icon="⏱️" label="En İyi Süre" value={fmtTime(stats.best)} />
      </Container>
    </Container>
  );
}

function LogoTile({ x, data }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(data.c2, 1);
    g.lineStyle(1, 0xffffff, 0.25);
    g.drawRoundedRect(0, 0, 54, 54, 16);
    g.endFill();
  }, [data]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 27, fontWeight: '900', fill: 0xffffff });
  return (
    <Container x={x} y={0}>
      <Graphics draw={draw} />
      <Text text={data.ch} x={27} y={27} anchor={0.5} style={style} />
    </Container>
  );
}

function CurrencyBadge({ x, y, width, height, icon, value, color, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(color, 0.14);
    g.lineStyle(1, color, 0.45);
    g.drawRoundedRect(0, 0, width, height, height / 2);
    g.endFill();
  }, [width, height, color]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: 0xeae6ff });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13 });
  return (
    <Container x={x} y={y} interactive cursor="pointer" pointertap={() => { playTapSound(); onTap(); }}>
      <Graphics draw={draw} />
      <Text text={icon} x={16} y={height / 2} anchor={0.5} style={iconStyle} />
      <Text text={String(value)} x={30} y={height / 2} anchor={{ x: 0, y: 0.5 }} style={style} />
    </Container>
  );
}

function StatRow({ y, icon, label, value }) {
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 14 });
  const lblStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fontWeight: '700', fill: 0xeae6ff });
  const valStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '800', fill: 0xffcb57 });
  return (
    <Container x={16} y={y}>
      <Text text={icon} x={0} y={0} style={iconStyle} />
      <Text text={label} x={26} y={2} style={lblStyle} />
      <Text text={value} x={376} y={2} anchor={{ x: 1, y: 0 }} style={valStyle} />
    </Container>
  );
}
