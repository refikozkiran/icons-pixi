import React, { useCallback, useState } from 'react';
import { Container, Graphics, Sprite, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily } from '../theme.js';
import { playTapSound } from '../../audio/sfx.js';
import { getButtonFaceTexture } from './buttonGradient.js';

/**
 * Genel amaçlı, modern görünümlü düğme: gradient yüzey + cam parlaklığı + alt kabartma
 * kenarı (3D "bezel") + basınca göre çökme animasyonu + (opsiyonel) dış parlama.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
 */
const VARIANTS = {
  primary: { top: 0x5be3ff, bottom: 0x2f8fe0, rim: 0x1c5f9e, border: 0xbdf3ff, text: 0x06131f, glow: 0x39d3f0 },
  gold: { top: 0xffe38a, bottom: 0xe6a93a, rim: 0x9c6a18, border: 0xfff2c4, text: 0x2a1a04, glow: 0xffcb57 },
  danger: { top: 0xff8fa3, bottom: 0xe23b58, rim: 0x8f1f34, border: 0xffd0d9, text: 0xffffff, glow: 0xff5d7a },
  secondary: { top: 0x3a3466, bottom: 0x211c40, rim: 0x14112a, border: 0x554b8f, text: 0xeae6ff, glow: null },
  ghost: { top: null, bottom: null, rim: null, border: null, text: 0xa79fd6, glow: null },
};

export default function Btn({
  x = 0, y = 0, width = 200, height = 48, radius = 14, label, fontSize = 15,
  variant = 'secondary', onTap, disabled = false, icon,
}) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.secondary;
  const rimH = Math.max(3, Math.round(height * 0.11));
  const faceH = height - rimH;
  const isGhost = variant === 'ghost';

  const alpha = disabled ? 0.42 : 1;
  const pressOffset = pressed && !disabled ? rimH : 0;

  const drawShadow = useCallback(g => {
    g.clear();
    if (isGhost || disabled) return;
    g.beginFill(0x000000, 0.28);
    g.drawRoundedRect(0, 5, width, height, radius);
    g.endFill();
  }, [width, height, radius, isGhost, disabled]);

  const drawGlow = useCallback(g => {
    g.clear();
    if (isGhost || !v.glow || disabled) return;
    for (let i = 3; i >= 1; i--) {
      g.beginFill(v.glow, 0.05 * i * (hover ? 1.6 : 1));
      g.drawRoundedRect(-i * 2, -i * 2, width + i * 4, height + i * 4, radius + i * 2);
      g.endFill();
    }
  }, [width, height, radius, v.glow, hover, isGhost, disabled]);

  const drawRim = useCallback(g => {
    g.clear();
    if (isGhost) return;
    g.beginFill(v.rim, 1);
    g.drawRoundedRect(0, 0, width, height, radius);
    g.endFill();
  }, [width, height, radius, v.rim, isGhost]);

  const drawGhostFace = useCallback(g => {
    g.clear();
    if (!isGhost) return;
    g.lineStyle(1.2, 0x554b8f, pressed ? 0.9 : 0.55);
    g.drawRoundedRect(0, 0, width, faceH, radius);
  }, [width, faceH, radius, isGhost, pressed]);

  const drawBorder = useCallback(g => {
    g.clear();
    if (isGhost || !v.border) return;
    g.lineStyle(1.4, v.border, 0.55);
    g.drawRoundedRect(0.7, 0.7, width - 1.4, faceH - 1.4, Math.max(1, radius - 1));
  }, [width, faceH, radius, v.border, isGhost]);

  const faceTexture = !isGhost
    ? getButtonFaceTexture({ width, height: faceH, radius, topColor: v.top, bottomColor: v.bottom })
    : null;

  const style = new TextStyle({ fontFamily: fontFamily(), fontSize, fontWeight: '800', fill: v.text, letterSpacing: 0.3 });

  return (
    <Container
      x={x} y={y}
      interactive={!disabled}
      cursor={disabled ? 'default' : 'pointer'}
      pointerdown={() => !disabled && setPressed(true)}
      pointerup={() => setPressed(false)}
      pointerupoutside={() => setPressed(false)}
      pointerover={() => setHover(true)}
      pointerout={() => { setHover(false); setPressed(false); }}
      pointertap={() => { if (!disabled && onTap) { playTapSound(); onTap(); } }}
      alpha={alpha}
    >
      <Graphics draw={drawShadow} />
      <Graphics draw={drawGlow} />
      <Graphics draw={drawRim} />
      <Container y={pressOffset}>
        {faceTexture && <Sprite texture={faceTexture} x={0} y={0} width={width} height={faceH} />}
        <Graphics draw={drawGhostFace} />
        <Graphics draw={drawBorder} />
        <Text
          text={(icon ? icon + '  ' : '') + label}
          x={width / 2} y={faceH / 2}
          anchor={0.5}
          style={style}
        />
      </Container>
    </Container>
  );
}
