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
  primary: { top: 0x82f2ff, bottom: 0x2f8fe0, rim: 0x18507f, border: 0xd8fbff, text: 0x06131f, glow: 0x39d3f0 },
  gold: { top: 0xffee9e, bottom: 0xe6a93a, rim: 0x8a5c14, border: 0xfff8dc, text: 0x2a1a04, glow: 0xffcb57 },
  danger: { top: 0xffa8b8, bottom: 0xe23b58, rim: 0x7d1c2f, border: 0xffe0e6, text: 0xffffff, glow: 0xff5d7a },
  secondary: { top: 0x5b52a3, bottom: 0x2a2455, rim: 0x151230, border: 0x9a8fe6, borderAlpha: 0.5, text: 0xf1eeff, glow: null },
  ghost: { top: null, bottom: null, rim: null, border: 0x554b8f, text: 0xb9b0e8, glow: null },
};

export default function Btn({
  x = 0, y = 0, width = 200, height = 48, radius = 16, label, fontSize = 15,
  variant = 'secondary', onTap, disabled = false, icon,
}) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.secondary;
  const rimH = Math.max(3, Math.round(height * 0.12));
  const faceH = height - rimH;
  const isGhost = variant === 'ghost';

  const alpha = disabled ? 0.42 : 1;
  const pressOffset = pressed && !disabled ? rimH : 0;

  const drawShadow = useCallback(g => {
    g.clear();
    if (isGhost || disabled) return;
    g.beginFill(0x000000, 0.3);
    g.drawRoundedRect(0, 5, width, height, radius);
    g.endFill();
  }, [width, height, radius, isGhost, disabled]);

  const drawGlow = useCallback(g => {
    g.clear();
    if (isGhost || !v.glow || disabled) return;
    for (let i = 3; i >= 1; i--) {
      g.beginFill(v.glow, 0.055 * i * (hover ? 1.7 : 1));
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
    if (hover || pressed) {
      g.beginFill(0xffffff, pressed ? 0.1 : 0.06);
    }
    g.lineStyle(1.3, v.border, pressed ? 0.95 : 0.6);
    g.drawRoundedRect(0.7, 0.7, width - 1.4, faceH - 1.4, radius);
    if (hover || pressed) g.endFill();
  }, [width, faceH, radius, isGhost, pressed, hover, v.border]);

  const drawBorder = useCallback(g => {
    g.clear();
    if (isGhost || !v.border) return;
    g.lineStyle(1.4, v.border, v.borderAlpha != null ? v.borderAlpha : 0.55);
    g.drawRoundedRect(0.7, 0.7, width - 1.4, faceH - 1.4, Math.max(1, radius - 1));
  }, [width, faceH, radius, v.border, v.borderAlpha, isGhost]);

  const faceTexture = !isGhost
    ? getButtonFaceTexture({ width, height: faceH, radius, topColor: v.top, bottomColor: v.bottom })
    : null;

  const style = new TextStyle({ fontFamily: fontFamily(), fontSize, fontWeight: '800', fill: v.text, letterSpacing: 0.3 });
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: fontSize + 3 });

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
        {icon ? (
          <>
            <Text text={icon} x={26} y={faceH / 2} anchor={0.5} style={iconStyle} />
            <Text text={label} x={52} y={faceH / 2} anchor={{ x: 0, y: 0.5 }} style={style} />
          </>
        ) : (
          <Text text={label} x={width / 2} y={faceH / 2} anchor={0.5} style={style} />
        )}
      </Container>
    </Container>
  );
}
