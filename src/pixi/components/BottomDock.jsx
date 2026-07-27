import React, { useCallback, useMemo, useState } from 'react';
import { Container, Graphics, Sprite, Text } from '@pixi/react';
import { TextStyle, Rectangle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import { useUI } from '../../state/uiStore.js';
import { useProgress } from '../../state/progressStore.js';
import { playTapSound } from '../../audio/sfx.js';
import { getButtonFaceTexture } from './buttonGradient.js';

const ITEMS = [
  { id: 'home', icon: '🏠', label: 'Ana Sayfa' },
  { id: 'levels', icon: '🗺️', label: 'Bölümler' },
  { id: 'store', icon: '🛍️', label: 'Mağaza' },
  { id: 'achievements', icon: '🏆', label: 'Başarımlar' },
  { id: 'settings', icon: '⚙️', label: 'Ayarlar' },
];

export default function BottomDock() {
  const screen = useUI(s => s.screen);
  const goto = useUI(s => s.goto);
  const isDailyClaimed = useProgress(s => s.isDailyClaimed());

  const h = 74;
  const y = 920 - h;
  const itemW = VW / ITEMS.length;

  const drawBg = useCallback(g => {
    g.clear();
    g.beginFill(0x0a071a, 0.94);
    g.drawRect(0, 0, VW, h);
    g.endFill();
    g.lineStyle(1, 0x332a5c, 0.6);
    g.moveTo(0, 0); g.lineTo(VW, 0);
    g.lineStyle(1, 0x8b7cff, 0.15);
    g.moveTo(0, 0.6); g.lineTo(VW, 0.6);
  }, []);

  return (
    <Container x={0} y={y}>
      <Graphics draw={drawBg} />
      {ITEMS.map((item, i) => (
        <DockButton
          key={item.id}
          x={i * itemW} width={itemW} height={h}
          active={screen === item.id}
          icon={item.icon} label={item.label}
          showBadge={item.id === 'home' && !isDailyClaimed}
          onTap={() => goto(item.id)}
        />
      ))}
    </Container>
  );
}

function DockButton({ x, width, height, active, icon, label, showBadge, onTap }) {
  const [pressed, setPressed] = useState(false);
  const pillW = width - 12;
  const pillH = height - 24;
  const radius = 14;
  // Aktif değilken parıltı grafiği boş çiziliyor ve sprite hiç render edilmiyor;
  // bu yüzden Pixi'nin otomatik hesapladığı hit alanı yalnızca ikon/metin
  // metinlerinin küçük sınırlarına daralıyordu (bazen dokunma algılanmıyordu).
  // Sabit, tüm buton alanını kaplayan bir hitArea vererek bunu garanti altına alıyoruz.
  const hitArea = useMemo(() => new Rectangle(0, 0, width, height), [width, height]);

  const drawGlow = useCallback(g => {
    g.clear();
    if (!active) return;
    for (let i = 2; i >= 1; i--) {
      g.beginFill(0x8b7cff, 0.09 * i);
      g.drawRoundedRect(6 - i * 2, 8 - i * 2, pillW + i * 4, pillH + i * 4, radius + i * 2);
      g.endFill();
    }
  }, [active, pillW, pillH]);

  const faceTexture = active
    ? getButtonFaceTexture({ width: pillW, height: pillH, radius, topColor: 0xa79bff, bottomColor: 0x5b52a3, gloss: true })
    : null;

  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 19 });
  const labelStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fontWeight: '700', fill: active ? 0xffffff : 0xa79fd6 });

  return (
    <Container
      x={x} y={0} interactive cursor="pointer"
      hitArea={hitArea}
      pointerdown={() => setPressed(true)}
      pointerup={() => setPressed(false)}
      pointerupoutside={() => setPressed(false)}
      pointertap={() => { playTapSound(); onTap(); }}
      scale={pressed ? 0.94 : 1}
    >
      <Graphics draw={drawGlow} />
      {active && <Sprite texture={faceTexture} x={6} y={8} width={pillW} height={pillH} />}
      <Text text={icon} x={width / 2} y={height / 2 - 9} anchor={0.5} style={iconStyle} />
      <Text text={label} x={width / 2} y={height / 2 + 14} anchor={0.5} style={labelStyle} />
      {showBadge && (
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x000000, 0.35);
            g.drawCircle(0.6, 0.6, 5.5);
            g.endFill();
            g.beginFill(0xff5d7a);
            g.lineStyle(1, 0xffb3c0, 0.8);
            g.drawCircle(0, 0, 4.5);
            g.endFill();
          }}
          x={width / 2 + 12} y={height / 2 - 17}
        />
      )}
    </Container>
  );
}
