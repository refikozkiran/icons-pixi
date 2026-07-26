import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, RARITY_COLORS } from '../theme.js';
import ModalOverlay from './ModalOverlay.jsx';
import Btn from './Button.jsx';
import { useUI } from '../../state/uiStore.js';
import { useProgress } from '../../state/progressStore.js';
import { useGame } from '../../state/gameStore.js';
import { buildChestRewards } from '../../game/chestLogic.js';
import { playChestOpenSound, playChestBurstSound, playCoinChime, playStarChime, vibrate } from '../../audio/sfx.js';

export default function ChestModal() {
  const ui = useUI();
  const [phase, setPhase] = useState('idle'); // idle -> opened
  const [cards, setCards] = useState([]);
  const [collected, setCollected] = useState([]);

  const levelIdx = useGame.getState().idx ?? 0;

  useEffect(() => {
    setPhase('idle');
    setCards(buildChestRewards(levelIdx, useProgress.getState().ownedIcons));
    setCollected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.modal]);

  function openChest() {
    if (phase !== 'idle') return;
    playChestOpenSound();
    vibrate(30);
    setTimeout(() => { playChestBurstSound(); setPhase('opened'); }, 320);
  }

  function collect(i) {
    if (collected.includes(i)) return;
    const card = cards[i];
    applyCard(card);
    setCollected(c => [...c, i]);
    vibrate(30);
  }

  function applyCard(card) {
    const p = useProgress.getState();
    if (card.type === 'coin') { p.addCoins(card.amount); playCoinChime(); }
    else if (card.type === 'star') { p.addStars(card.amount); playStarChime(); }
    else if (card.type === 'icon') { useProgress.setState(s => ({ ownedIcons: [...s.ownedIcons, card.def.id] })); playCoinChime(); }
    else if (card.type === 'chest') { ui.setPendingBonusChest(true); playCoinChime(); }
  }

  const allCollected = cards.length > 0 && collected.length === cards.length;

  function onContinue() {
    if (ui.pendingBonusChest) {
      ui.setPendingBonusChest(false);
      setPhase('idle');
      setCards(buildChestRewards(levelIdx, useProgress.getState().ownedIcons));
      setCollected([]);
    } else {
      ui.finishChest();
    }
  }

  const styles = useMemo(() => ({
    title: new TextStyle({ fontFamily: fontFamily(), fontSize: 14, fontWeight: '800', fill: 0xeae6ff, letterSpacing: 1 }),
    hint: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fill: 0xa79fd6, fontWeight: '600' }),
    chest: new TextStyle({ fontFamily: fontFamily(), fontSize: 72 }),
  }), []);

  const panelWidth = VW - 48, panelHeight = 480;

  return (
    <ModalOverlay panelWidth={panelWidth} panelHeight={panelHeight}>
      <Text text="BÖLÜM ÖDÜLÜ" x={panelWidth / 2} y={24} anchor={0.5} style={styles.title} />

      {phase === 'idle' ? (
        <Container x={panelWidth / 2} y={140} interactive cursor="pointer" pointertap={openChest}>
          <Text text="🎁" x={0} y={0} anchor={0.5} style={styles.chest} />
          <Text text="Açmak için dokun" x={0} y={80} anchor={0.5} style={styles.hint} />
        </Container>
      ) : (
        <>
          <Text text={allCollected ? '' : '👆 Almak için ödüllere dokun'} x={panelWidth / 2} y={52} anchor={0.5} style={styles.hint} />
          <CardGrid width={panelWidth} cards={cards} collected={collected} onCollect={collect} />
        </>
      )}

      {(allCollected) && (
        <Btn x={24} y={panelHeight - 70} width={panelWidth - 48} height={50} variant="primary"
          label={ui.pendingBonusChest ? 'Sandığı Tekrar Aç!' : 'Devam Et'} onTap={onContinue} />
      )}
    </ModalOverlay>
  );
}

function CardGrid({ width, cards, collected, onCollect }) {
  const cols = 2;
  const gap = 12;
  const cardW = (width - 48 - gap) / cols;
  const cardH = 96;
  return (
    <Container x={24} y={80}>
      {cards.map((card, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const isCollected = collected.includes(i);
        return (
          <ChestCard
            key={i}
            x={col * (cardW + gap)} y={row * (cardH + gap)}
            width={cardW} height={cardH}
            card={card} collected={isCollected}
            onTap={() => onCollect(i)}
          />
        );
      })}
    </Container>
  );
}

function ChestCard({ x, y, width, height, card, collected, onTap }) {
  const rarityColor = card.def ? (RARITY_COLORS[card.def.rarity] || 0x8b93a8) : 0xffcb57;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, collected ? 0.14 : 0.06);
    g.lineStyle(1.4, rarityColor, collected ? 0.9 : 0.4);
    g.drawRoundedRect(0, 0, width, height, 16);
    g.endFill();
  }, [width, height, rarityColor, collected]);

  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 26 });
  const titleStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '800', fill: 0xeae6ff });
  const subStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fill: 0xa79fd6, fontWeight: '600' });
  const checkStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 14, fill: 0x4be3a3 });

  const iconText = card.icon === 'coin' ? '🪙' : card.icon;

  return (
    <Container x={x} y={y} interactive={!collected} cursor={collected ? 'default' : 'pointer'} pointertap={() => { if (!collected) onTap(); }} alpha={collected ? 0.55 : 1}>
      <Graphics draw={draw} />
      <Text text={iconText} x={width / 2} y={30} anchor={0.5} style={iconStyle} />
      <Text text={card.title} x={width / 2} y={58} anchor={0.5} style={titleStyle} />
      <Text text={card.sub} x={width / 2} y={76} anchor={0.5} style={subStyle} />
      {collected && <Text text="✓" x={width - 14} y={12} anchor={0.5} style={checkStyle} />}
    </Container>
  );
}
