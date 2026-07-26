import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import { playTapSound } from '../../audio/sfx.js';

export default function TopBar({ title, onBack, right }) {
  const drawBackBtn = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff, 0.06);
    g.lineStyle(1, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, 40, 40, 12);
    g.endFill();
  }, []);

  const titleStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 16, fontWeight: '800', fill: 0xeae6ff, letterSpacing: 0.5 });
  const backStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 17, fill: 0xeae6ff });

  return (
    <Container x={16} y={20}>
      {onBack && (
        <Container interactive cursor="pointer" pointertap={() => { playTapSound(); onBack(); }}>
          <Graphics draw={drawBackBtn} />
          <Text text="←" x={20} y={20} anchor={0.5} style={backStyle} />
        </Container>
      )}
      <Text text={title} x={VW / 2 - 16} y={20} anchor={0.5} style={titleStyle} />
      {right}
    </Container>
  );
}
