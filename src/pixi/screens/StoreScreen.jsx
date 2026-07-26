import React, { useCallback, useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW, VH, RARITY_COLORS } from '../theme.js';
import TopBar from '../components/TopBar.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import { STORE_ICONS } from '../../data/storeIcons.js';
import { useProgress, HINT_STAR_COST } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';
import { playCoinChime, playTapSound } from '../../audio/sfx.js';

const COLS = 3;
const GAP = 10;
const CARD_H = 108;

export default function StoreScreen() {
  const progress = useProgress();
  const goto = useUI(s => s.goto);
  const pushToast = useUI(s => s.pushToast);

  const cardW = (VW - 32 - (COLS - 1) * GAP) / COLS;
  const rows = Math.ceil(STORE_ICONS.length / COLS);
  const gridContentHeight = rows * (CARD_H + GAP);

  const listTop = 232;
  const listHeight = VH - 74 - listTop - 10;

  const buyHint = () => {
    const ok = progress.buyHint();
    if (ok) { playCoinChime(); pushToast('İpucu satın alındı', 'MAĞAZA', '💡'); }
    else pushToast('Yeterli şans yıldızın yok', 'MAĞAZA', '🌟');
  };

  const onIconTap = (def) => {
    const owned = progress.ownedIcons.includes(def.id);
    if (owned) {
      progress.equipIcon(def.id);
      pushToast(def.name + ' seçildi', 'MAĞAZA', def.icon);
    } else {
      const ok = progress.buyIcon(def);
      if (ok) { playCoinChime(); pushToast(def.name + ' satın alındı!', 'MAĞAZA', def.icon); }
      else pushToast('Yeterli paran yok', 'MAĞAZA', '🪙');
    }
  };

  const styles = useMemo(() => ({
    label: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fontWeight: '800', fill: 0xa79fd6, letterSpacing: 1 }),
  }), []);

  const drawHintCard = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.05);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, VW - 32, 90, 16);
    g.endFill();
  }, []);

  return (
    <Container>
      <TopBar title="MAĞAZA" onBack={() => goto('home')} />
      <CurrencyRow x={16} y={64} coins={progress.coins} stars={progress.luckyStars} />

      {/* hint purchase card */}
      <Container x={16} y={124}>
        <Graphics draw={drawHintCard} />
        <Text text="💡" x={30} y={30} anchor={0.5} style={new TextStyle({ fontFamily: fontFamily(), fontSize: 26 })} />
        <Text text="Ekstra İpucu" x={58} y={16} style={new TextStyle({ fontFamily: fontFamily(), fontSize: 13.5, fontWeight: '800', fill: 0xeae6ff })} />
        <Text text={'Envanterde: ' + (progress.hintItems || 0) + ' 💡'} x={58} y={36} style={new TextStyle({ fontFamily: fontFamily(), fontSize: 10.5, fill: 0xa79fd6, fontWeight: '600' })} />
        <Text
          text="Bulmacada kullanabileceğin 1 ekstra ipucu hakkı kazan."
          x={58} y={54}
          style={new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fill: 0xa79fd6, wordWrap: true, wordWrapWidth: VW - 32 - 130 })}
        />
        <BuyBtn x={VW - 32 - 96} y={16} width={96} height={34} label={'🌟 ' + HINT_STAR_COST} disabled={(progress.luckyStars || 0) < HINT_STAR_COST} onTap={buyHint} />
      </Container>

      <Text text={'İKON KOLEKSİYONU (' + progress.ownedIcons.length + '/' + STORE_ICONS.length + ')'} x={16} y={206} style={styles.label} />

      <ScrollArea x={16} y={listTop} width={VW - 32} height={listHeight} contentHeight={gridContentHeight}>
        {STORE_ICONS.map((def, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          const owned = progress.ownedIcons.includes(def.id);
          const equipped = progress.equippedIcon === def.id;
          return (
            <IconCard
              key={def.id}
              x={col * (cardW + GAP)} y={row * (CARD_H + GAP)} width={cardW}
              def={def} owned={owned} equipped={equipped}
              affordable={(progress.coins || 0) >= def.price}
              onTap={() => onIconTap(def)}
            />
          );
        })}
      </ScrollArea>
    </Container>
  );
}

function CurrencyRow({ x, y, coins, stars }) {
  const w = (VW - 32 - 10) / 2;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.05);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, w, 40, 14);
    g.endFill();
  }, [w]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 14, fontWeight: '800', fill: 0xeae6ff });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 17 });
  return (
    <Container x={x} y={y}>
      <Container>
        <Graphics draw={draw} />
        <Text text="🪙" x={20} y={20} anchor={0.5} style={iconStyle} />
        <Text text={String(coins || 0)} x={36} y={20} anchor={{ x: 0, y: 0.5 }} style={style} />
      </Container>
      <Container x={w + 10}>
        <Graphics draw={draw} />
        <Text text="🌟" x={20} y={20} anchor={0.5} style={iconStyle} />
        <Text text={String(stars || 0)} x={36} y={20} anchor={{ x: 0, y: 0.5 }} style={style} />
      </Container>
    </Container>
  );
}

function BuyBtn({ x, y, width, height, label, disabled, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0x8b7cff, disabled ? 0.15 : 0.28);
    g.lineStyle(1, 0x8b7cff, disabled ? 0.2 : 0.6);
    g.drawRoundedRect(0, 0, width, height, height / 2);
    g.endFill();
  }, [width, height, disabled]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: disabled ? 0x66608a : 0xeae6ff });
  return (
    <Container x={x} y={y} interactive={!disabled} cursor={disabled ? 'default' : 'pointer'} pointertap={() => { if (!disabled) { playTapSound(); onTap(); } }}>
      <Graphics draw={draw} />
      <Text text={label} x={width / 2} y={height / 2} anchor={0.5} style={style} />
    </Container>
  );
}

function IconCard({ x, y, width, def, owned, equipped, affordable, onTap }) {
  const rarityColor = RARITY_COLORS[def.rarity] || 0x8b93a8;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(equipped ? 0x8b7cff : 0xffffff, equipped ? 0.18 : 0.05);
    g.lineStyle(1.4, equipped ? 0x8b7cff : rarityColor, equipped ? 0.9 : 0.45);
    g.drawRoundedRect(0, 0, width, CARD_H, 16);
    g.endFill();
  }, [width, equipped, rarityColor]);

  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 28 });
  const nameStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fontWeight: '700', fill: 0xeae6ff, align: 'center', wordWrap: true, wordWrapWidth: width - 8 });
  const priceStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 10, fontWeight: '800', fill: affordable ? 0xffcb57 : 0x66608a });
  const stateStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9, fontWeight: '800', fill: 0x4be3a3 });

  return (
    <Container x={x} y={y} interactive cursor="pointer" pointertap={onTap} alpha={!owned && !affordable ? 0.55 : 1}>
      <Graphics draw={draw} />
      <Text text={def.icon} x={width / 2} y={34} anchor={0.5} style={iconStyle} />
      <Text text={def.name} x={width / 2} y={62} anchor={{ x: 0.5, y: 0 }} style={nameStyle} />
      {equipped ? (
        <Text text="✓ SEÇİLİ" x={width / 2} y={CARD_H - 14} anchor={0.5} style={stateStyle} />
      ) : owned ? (
        <Text text="SAHİPSİN" x={width / 2} y={CARD_H - 14} anchor={0.5} style={new TextStyle({ fontFamily: fontFamily(), fontSize: 9, fontWeight: '800', fill: 0xa79fd6 })} />
      ) : (
        <Text text={'🪙 ' + def.price} x={width / 2} y={CARD_H - 14} anchor={0.5} style={priceStyle} />
      )}
    </Container>
  );
}
