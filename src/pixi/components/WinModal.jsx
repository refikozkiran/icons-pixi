import React, { useMemo } from 'react';
import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import ModalOverlay from './ModalOverlay.jsx';
import Btn from './Button.jsx';
import { useUI } from '../../state/uiStore.js';
import { useGame } from '../../state/gameStore.js';
import { useProgress } from '../../state/progressStore.js';
import { STORE_ICONS } from '../../data/storeIcons.js';
import { LEVELS } from '../../data/levels.js';
import { fmtTime } from '../../game/queensLogic.js';

export default function WinModal() {
  const ui = useUI();
  const info = ui.lastWinInfo;

  const styles = useMemo(() => ({
    title: new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '700', fill: 0xa79fd6, letterSpacing: 1 }),
    stars: new TextStyle({ fontFamily: fontFamily(), fontSize: 34, fill: 0xffcb57 }),
    crown: new TextStyle({ fontFamily: fontFamily(), fontSize: 44 }),
    coins: new TextStyle({ fontFamily: fontFamily(), fontSize: 18, fontWeight: '800', fill: 0xffe6a8 }),
    stat: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fill: 0xa79fd6, fontWeight: '600' }),
    statVal: new TextStyle({ fontFamily: fontFamily(), fontSize: 14, fontWeight: '800', fill: 0xeae6ff }),
  }), []);

  if (!info) return null;
  const equippedDef = STORE_ICONS.find(s => s.id === useProgress.getState().equippedIcon) || STORE_ICONS[0];
  const hasNext = info.level < LEVELS.length;

  function proceedAfterExtras(action) {
    const pending = ui.pendingChestAchievements;
    if (pending && pending.length) {
      useUI.setState({ pendingChestAchievements: [] });
      ui.queueAchievements(pending, () => ui.openChest(action));
    } else {
      action();
    }
  }

  function goNext() {
    ui.closeModal();
    proceedAfterExtras(() => {
      useGame.getState().startLevel(info.level); // info.level is 1-based -> equals nextIdx (0-based) since level=idx+1
      ui.goto('game');
    });
  }
  function replay() {
    ui.closeModal();
    ui.resetStreak();
    proceedAfterExtras(() => {
      useGame.getState().startLevel(info.level - 1);
      ui.goto('game');
    });
  }
  function toMenu() {
    ui.closeModal();
    ui.resetStreak();
    proceedAfterExtras(() => ui.goto('home'));
  }
  function share() {
    const starsText = '⭐'.repeat(info.stars) + '☆'.repeat(3 - info.stars);
    const msg = `ICONS bulmaca oyununda Bölüm ${info.level}'i ${fmtTime(info.time)} sürede ve ${starsText} ile tamamladım! 🧩✨`;
    if (navigator.share) navigator.share({ text: msg }).catch(() => {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }

  const panelWidth = VW - 48, panelHeight = 480;

  return (
    <ModalOverlay panelWidth={panelWidth} panelHeight={panelHeight}>
      <Text text={'BÖLÜM ' + info.level + ' TAMAMLANDI'} x={panelWidth / 2} y={26} anchor={0.5} style={styles.title} />
      <Text text={equippedDef.icon} x={panelWidth / 2} y={76} anchor={0.5} style={styles.crown} />
      <Text text={'★'.repeat(info.stars) + '☆'.repeat(3 - info.stars)} x={panelWidth / 2} y={124} anchor={0.5} style={styles.stars} />

      <Container x={panelWidth / 2 - 90} y={168}>
        <Text text="Süre" x={0} y={0} anchor={{ x: 0.5, y: 0 }} style={styles.stat} />
        <Text text={fmtTime(info.time)} x={0} y={16} anchor={{ x: 0.5, y: 0 }} style={styles.statVal} />
      </Container>
      <Container x={panelWidth / 2} y={168}>
        <Text text="İpucu" x={0} y={0} anchor={{ x: 0.5, y: 0 }} style={styles.stat} />
        <Text text={String(info.hintsUsed)} x={0} y={16} anchor={{ x: 0.5, y: 0 }} style={styles.statVal} />
      </Container>
      <Container x={panelWidth / 2 + 90} y={168}>
        <Text text="En İyi" x={0} y={0} anchor={{ x: 0.5, y: 0 }} style={styles.stat} />
        <Text text={fmtTime(info.bestTime)} x={0} y={16} anchor={{ x: 0.5, y: 0 }} style={styles.statVal} />
      </Container>

      <Text text={'🪙 +' + info.coins} x={panelWidth / 2} y={214} anchor={0.5} style={styles.coins} />

      <Container y={252}>
        {hasNext && <Btn x={24} y={0} width={panelWidth - 48} height={52} label="Sonraki Bölüm" icon="▶" variant="primary" onTap={goNext} />}
        <Btn x={24} y={hasNext ? 62 : 0} width={panelWidth - 48} height={48} label="Tekrar Oyna" icon="🔁" variant="secondary" onTap={replay} />
        <Btn x={24} y={(hasNext ? 62 : 0) + 58} width={panelWidth - 48} height={48} label="Paylaş" icon="📤" variant="secondary" onTap={share} />
        <Btn x={24} y={(hasNext ? 62 : 0) + 116} width={panelWidth - 48} height={44} label="Ana Menü" variant="ghost" onTap={toMenu} />
      </Container>
    </ModalOverlay>
  );
}
