import React, { useCallback, useState } from 'react';
import { Container, Graphics, Sprite, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily } from '../theme.js';
import { playTapSound } from '../../audio/sfx.js';
import { getButtonFaceTexture } from './buttonGradient.js';

let _measureCanvas = null;
function measureTextWidth(text, fontSize, weight, family) {
  if (!_measureCanvas) _measureCanvas = document.createElement('canvas');
  const ctx = _measureCanvas.getContext('2d');
  ctx.font = `${weight} ${fontSize}px ${family}`;
  return ctx.measureText(text).width;
}

/**
 * Genel amaçlı, modern görünümlü düğme: doygun gradient yüzey + cam parlaklığı +
 * alt kabartma kenarı (3D "bezel") + basınca göre çökme animasyonu + dış parlama.
 * İkon + etiket her zaman tek grup olarak yatayda ortalanır (metin ölçülerek).
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
 */
const VARIANTS = {
  primary: { top: 0x8ff5ff, bottom: 0x1f7cd6, rim: 0x0f4d85, border: 0xe8feff, text: 0x06131f, glow: 0x39d3f0 },
  gold: { top: 0xffee9e, bottom: 0xe6a93a, rim: 0x8a5c14, border: 0xfff8dc, text: 0x2a1a04, glow: 0xffcb57 },
  danger: { top: 0xffa8b8, bottom: 0xd6294a, rim: 0x6e1526, border: 0xffe0e6, text: 0xffffff, glow: 0xff5d7a },
  secondary: { top: 0x9587ff, bottom: 0x37307a, rim: 0x191537, border: 0xe0d9ff, borderAlpha: 0.7, text: 0xffffff, glow: 0x6a5cf0, glowAlpha: 0.03 },
  ghost: { top: null, bottom: null, rim: null, border: 0xa79fd6, borderAlpha: 0.7, text: 0xd9d3ff, glow: null, fillAlways: 0x8b7cff },
};

export default function Btn({
  x = 0, y = 0, width = 200, height = 48, radius = 20, label, fontSize = 15,
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
    g.beginFill(0x000000, 0.32);
    g.drawRoundedRect(0, 5, width, height, radius);
    g.endFill();
  }, [width, height, radius, isGhost, disabled]);

  const drawGlow = useCallback(g => {
    g.clear();
    if (isGhost || !v.glow || disabled) return;
    const base = v.glowAlpha != null ? v.glowAlpha : 0.055;
    for (let i = 3; i >= 1; i--) {
      g.beginFill(v.glow, base * i * (hover ? 1.7 : 1));
      g.drawRoundedRect(-i * 2, -i * 2, width + i * 4, height + i * 4, radius + i * 2);
      g.endFill();
    }
  }, [width, height, radius, v.glow, v.glowAlpha, hover, isGhost, disabled]);

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
    const wash = pressed ? 0.16 : (hover ? 0.12 : 0.07);
    g.beginFill(v.fillAlways, wash);
    g.lineStyle(1.4, v.border, pressed ? 1 : 0.8);
    g.drawRoundedRect(0.7, 0.7, width - 1.4, faceH - 1.4, radius);
    g.endFill();
  }, [width, faceH, radius, isGhost, pressed, hover, v.border, v.fillAlways]);

  const drawBorder = useCallback(g => {
    g.clear();
    if (isGhost || !v.border) return;
    g.lineStyle(1.6, v.border, v.borderAlpha != null ? v.borderAlpha : 0.6);
    g.drawRoundedRect(0.8, 0.8, width - 1.6, faceH - 1.6, Math.max(1, radius - 1));
  }, [width, faceH, radius, v.border, v.borderAlpha, isGhost]);

  const faceTexture = !isGhost
    ? getButtonFaceTexture({ width, height: faceH, radius, topColor: v.top, bottomColor: v.bottom })
    : null;

  const style = new TextStyle({ fontFamily: fontFamily(), fontSize, fontWeight: '800', fill: v.text, letterSpacing: 0.3 });
  const iconFontSize = fontSize + 3;
  const iconStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: iconFontSize });

  // İkon + etiketi tek grup olarak yatayda tam ortalamak için gerçek metin genişliğini ölç.
  const family = fontFamily();
  const labelW = measureTextWidth(label || '', fontSize, '800', family);
  const iconW = icon ? measureTextWidth(icon, iconFontSize, '400', family) : 0;
  const gap = icon ? 10 : 0;
  const totalW = iconW + gap + labelW;
  const startX = width / 2 - totalW / 2;
  const iconCx = startX + iconW / 2;
  const labelCx = startX + iconW + gap + labelW / 2;

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
        {icon && <Text text={icon} x={iconCx} y={faceH / 2} anchor={0.5} style={iconStyle} />}
        <Text text={label} x={labelCx} y={faceH / 2} anchor={0.5} style={style} />
      </Container>
    </Container>
  );
}
