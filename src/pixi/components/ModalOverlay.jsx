import React, { useCallback } from 'react';
import { Container, Graphics } from '@pixi/react';
import { VW, VH } from '../theme.js';

export default function ModalOverlay({ children, panelWidth = VW - 48, panelHeight = 420, dismissible = false, onDismiss }) {
  const drawDim = useCallback(g => {
    g.clear();
    g.beginFill(0x05030f, 0.72);
    g.drawRect(0, 0, VW, VH);
    g.endFill();
  }, []);
  const drawPanel = useCallback(g => {
    g.clear();
    g.beginFill(0x150c30, 0.98);
    g.lineStyle(1.5, 0x332a5c, 1);
    g.drawRoundedRect(0, 0, panelWidth, panelHeight, 22);
    g.endFill();
  }, [panelWidth, panelHeight]);

  return (
    <Container zIndex={1000}>
      <Graphics draw={drawDim} interactive={dismissible} cursor={dismissible ? 'pointer' : 'default'} pointertap={dismissible ? onDismiss : undefined} />
      <Container x={(VW - panelWidth) / 2} y={(VH - panelHeight) / 2}>
        <Graphics draw={drawPanel} />
        {children}
      </Container>
    </Container>
  );
}
