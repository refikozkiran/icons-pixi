import React, { useCallback, useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily } from '../theme.js';
import { playTapSound } from '../../audio/sfx.js';

/**
 * Genel amaçlı düğme: dikdörtgen/kapsül arka plan + ortalanmış metin (emoji dahil).
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
 */
const VARIANTS = {
  primary: { fill: 0x39d3f0, fill2: 0x8b7cff, text: 0x0a0a1f },
  secondary: { fill: 0xffffff, fillAlpha: 0.07, line: 0x332a5c, text: 0xeae6ff },
  ghost: { fill: 0x000000, fillAlpha: 0, text: 0xa79fd6 },
  danger: { fill: 0xff5d7a, fill2: 0xd63a5a, text: 0xffffff },
  gold: { fill: 0x2a1050, fillAlpha: 0.9, line: 0xffcb57, text: 0xffcb57 },
};

export default function Btn({
  x = 0, y = 0, width = 200, height = 48, radius = 14, label, fontSize = 15,
  variant = 'secondary', onTap, disabled = false, icon,
}) {
  const [pressed, setPressed] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.secondary;

  const draw = useCallback(g => {
    g.clear();
    const alpha = disabled ? 0.4 : 1;
    g.beginFill(v.fill, v.fillAlpha != null ? v.fillAlpha : 1);
    if (v.line) g.lineStyle(1.4, v.line, 0.9);
    g.drawRoundedRect(0, 0, width, height, radius);
    g.endFill();
    g.alpha = alpha * (pressed ? 0.85 : 1);
  }, [width, height, radius, v, disabled, pressed]);

  const style = new TextStyle({ fontFamily: fontFamily(), fontSize, fontWeight: '700', fill: v.text });

  return (
    <Container
      x={x} y={y}
      interactive={!disabled}
      cursor={disabled ? 'default' : 'pointer'}
      pointerdown={() => !disabled && setPressed(true)}
      pointerup={() => setPressed(false)}
      pointerupoutside={() => setPressed(false)}
      pointertap={() => { if (!disabled && onTap) { playTapSound(); onTap(); } }}
      scale={pressed ? 0.97 : 1}
    >
      <Graphics draw={draw} />
      <Text
        text={(icon ? icon + '  ' : '') + label}
        x={width / 2} y={height / 2}
        anchor={0.5}
        style={style}
        alpha={disabled ? 0.5 : 1}
      />
    </Container>
  );
}
