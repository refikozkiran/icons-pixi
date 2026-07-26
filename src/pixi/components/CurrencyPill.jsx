import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily } from '../theme.js';
import { playTapSound } from '../../audio/sfx.js';

export default function CurrencyPill({ x = 0, y = 0, width = 100, height = 34, icon, value, color = 0xffcb57, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(color, 0.14);
    g.lineStyle(1, color, 0.45);
    g.drawRoundedRect(0, 0, width, height, height / 2);
    g.endFill();
  }, [width, height, color]);

  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 12.5, fontWeight: '800', fill: 0xeae6ff });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 14 });

  return (
    <Container x={x} y={y} interactive={!!onTap} cursor={onTap ? 'pointer' : 'default'} pointertap={() => { if (onTap) { playTapSound(); onTap(); } }}>
      <Graphics draw={draw} />
      <Text text={icon} x={14} y={height / 2} anchor={0.5} style={iconStyle} />
      <Text text={String(value)} x={30} y={height / 2} anchor={{ x: 0, y: 0.5 }} style={style} />
    </Container>
  );
}
