import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';

/**
 * Yuvarlak köşeli, hafif saydam kart paneli. Orijinal .card / .hud-player stiline karşılık gelir.
 */
export default function Panel({ x = 0, y = 0, width, height, radius = 16, fill = 0x171233, fillAlpha = 0.55, lineColor = 0x332a5c, lineAlpha = 1, lineWidth = 1 }) {
  const draw = useCallback(g => {
    g.clear();
    g.lineStyle(lineWidth, lineColor, lineAlpha);
    g.beginFill(fill, fillAlpha);
    g.drawRoundedRect(0, 0, width, height, radius);
    g.endFill();
  }, [width, height, radius, fill, fillAlpha, lineColor, lineAlpha, lineWidth]);

  return <Graphics x={x} y={y} draw={draw} />;
}
