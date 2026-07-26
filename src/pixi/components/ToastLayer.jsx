import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import { useUI } from '../../state/uiStore.js';

export default function ToastLayer() {
  const toasts = useUI(s => s.toasts);
  return (
    <Container x={0} y={20} zIndex={500} sortableChildren>
      {toasts.map((t, i) => <Toast key={t.id} data={t} index={i} />)}
    </Container>
  );
}

function Toast({ data, index }) {
  const width = VW - 32;
  const height = 60;
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0x1a1240, 0.96);
    g.lineStyle(1, 0xffcb57, 0.4);
    g.drawRoundedRect(0, 0, width, height, 16);
    g.endFill();
  }, [width, height]);

  const labelStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 9.5, fontWeight: '700', fill: 0xffcb57, letterSpacing: 1 });
  const titleStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 14, fontWeight: '800', fill: 0xeae6ff });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 19 });
  const rewardStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 13, fontWeight: '800', fill: 0xffe6a8 });

  return (
    <Container x={16} y={index * (height + 8)}>
      <Graphics draw={draw} />
      <Text text={data.icon} x={30} y={height / 2} anchor={0.5} style={iconStyle} />
      <Text text={data.sub} x={56} y={16} style={labelStyle} />
      <Text text={data.title} x={56} y={30} style={titleStyle} />
      {data.coinReward ? (
        <Text text={'🪙 +' + data.coinReward} x={width - 16} y={height / 2} anchor={{ x: 1, y: 0.5 }} style={rewardStyle} />
      ) : null}
    </Container>
  );
}
