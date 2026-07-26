import React, { useCallback, useMemo } from 'react';
import { Container, Graphics } from '@pixi/react';
import { VW, VH } from '../theme.js';

const STAR_COUNT = 50;

export default function Background() {
  const stars = useMemo(() => Array.from({ length: STAR_COUNT }).map(() => ({
    x: Math.random() * VW,
    y: Math.random() * VH,
    r: Math.random() * 1.3 + 0.5,
    a: Math.random() * 0.5 + 0.3,
  })), []);

  const drawBg = useCallback(g => {
    g.clear();
    // Katmanlı düz renkler ile basit bir nebula hissi (Pixi Graphics gerçek gradyanı desteklemez).
    g.beginFill(0x0a0a1f, 1);
    g.drawRect(0, 0, VW, VH);
    g.endFill();
    g.beginFill(0x160b2e, 0.55);
    g.drawEllipse(VW * 0.5, VH * 0.15, VW * 0.9, VH * 0.35);
    g.endFill();
    g.beginFill(0x2a1050, 0.35);
    g.drawEllipse(VW * 0.2, VH * 0.75, VW * 0.7, VH * 0.4);
    g.endFill();
  }, []);

  const drawStars = useCallback(g => {
    g.clear();
    stars.forEach(s => {
      g.beginFill(0xffffff, s.a);
      g.drawCircle(s.x, s.y, s.r);
      g.endFill();
    });
  }, [stars]);

  return (
    <Container>
      <Graphics draw={drawBg} />
      <Graphics draw={drawStars} />
    </Container>
  );
}
