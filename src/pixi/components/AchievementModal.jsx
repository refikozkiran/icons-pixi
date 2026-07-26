import React, { useEffect, useMemo, useState } from 'react';
import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import ModalOverlay from './ModalOverlay.jsx';
import Btn from './Button.jsx';
import { useUI } from '../../state/uiStore.js';
import { useProgress } from '../../state/progressStore.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { playCoinChime, vibrate } from '../../audio/sfx.js';

export default function AchievementModal() {
  const ui = useUI();
  const [currentId, setCurrentId] = useState(null);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function advance() {
    const id = useUI.getState().shiftAchievement();
    if (!id) {
      useUI.getState().finishAchievementQueue();
      return;
    }
    setCurrentId(id);
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (def && def.reward) {
      useProgress.getState().addCoins(def.reward);
      playCoinChime();
      setRewarded(true);
    } else {
      setRewarded(false);
    }
    vibrate(60);
  }

  const def = ACHIEVEMENTS.find(a => a.id === currentId);
  const styles = useMemo(() => ({
    label: new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fontWeight: '800', fill: 0xffcb57, letterSpacing: 2 }),
    icon: new TextStyle({ fontFamily: fontFamily(), fontSize: 60 }),
    title: new TextStyle({ fontFamily: fontFamily(), fontSize: 20, fontWeight: '800', fill: 0xeae6ff }),
    desc: new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fill: 0xa79fd6, fontWeight: '600', align: 'center', wordWrap: true, wordWrapWidth: VW - 120 }),
    reward: new TextStyle({ fontFamily: fontFamily(), fontSize: 15, fontWeight: '800', fill: 0xffe6a8 }),
  }), []);

  if (!def) return null;
  const panelWidth = VW - 48, panelHeight = 380;

  return (
    <ModalOverlay panelWidth={panelWidth} panelHeight={panelHeight}>
      <Text text="BAŞARI KAZANILDI" x={panelWidth / 2} y={30} anchor={0.5} style={styles.label} />
      <Text text={def.icon} x={panelWidth / 2} y={110} anchor={0.5} style={styles.icon} />
      <Text text={def.title} x={panelWidth / 2} y={168} anchor={0.5} style={styles.title} />
      <Text text={def.desc} x={panelWidth / 2} y={200} anchor={{ x: 0.5, y: 0 }} style={styles.desc} />
      {rewarded && <Text text={'🪙 +' + def.reward} x={panelWidth / 2} y={264} anchor={0.5} style={styles.reward} />}
      <Btn x={24} y={panelHeight - 70} width={panelWidth - 48} height={50} variant="gold" label="Devam" onTap={advance} />
    </ModalOverlay>
  );
}
