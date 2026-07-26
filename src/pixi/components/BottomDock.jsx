import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import { useUI } from '../../state/uiStore.js';
import { useProgress } from '../../state/progressStore.js';
import { playTapSound } from '../../audio/sfx.js';

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
    g.beginFill(0x0a071a, 0.92);
    g.drawRect(0, 0, VW, h);
    g.endFill();
    g.lineStyle(1, 0x332a5c, 0.6);
    g.moveTo(0, 0); g.lineTo(VW, 0);
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
  const drawBg = useCallback(g => {
    g.clear();
    if (active) {
      g.beginFill(0x8b7cff, 0.16);
      g.lineStyle(1, 0x8b7cff, 0.4);
      g.drawRoundedRect(6, 8, width - 12, height - 24, 14);
      g.endFill();
    }
  }, [active, width, height]);

  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 19 });
  const labelStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fontWeight: '700', fill: active ? 0xeae6ff : 0xa79fd6 });

  return (
    <Container
      x={x} y={0} interactive cursor="pointer"
      pointertap={() => { playTapSound(); onTap(); }}
    >
      <Graphics draw={drawBg} />
      <Text text={icon} x={width / 2} y={height / 2 - 9} anchor={0.5} style={iconStyle} />
      <Text text={label} x={width / 2} y={height / 2 + 14} anchor={0.5} style={labelStyle} />
      {showBadge && (
        <Graphics
          draw={g => { g.clear(); g.beginFill(0xff5d7a); g.drawCircle(0, 0, 4.5); g.endFill(); }}
          x={width / 2 + 12} y={height / 2 - 17}
        />
      )}
    </Container>
  );
}
