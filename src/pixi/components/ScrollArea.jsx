import React, { useRef, useState, useCallback } from 'react';
import { Container, Graphics } from '@pixi/react';
import { Rectangle } from 'pixi.js';

/**
 * Dikey sürükle-kaydır alanı. Listeler (seviyeler, mağaza, başarımlar) için kullanılır.
 * contentHeight, iç içeriğin toplam yüksekliği; height, görünür pencere yüksekliği.
 */
export default function ScrollArea({ x = 0, y = 0, width, height, contentHeight, children }) {
  const [offset, setOffset] = useState(0);
  const [maskGfx, setMaskGfx] = useState(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  const maxOffset = Math.max(0, contentHeight - height);
  const clamp = v => Math.min(0, Math.max(-maxOffset, v));

  // e.currentTarget.toLocal(...) global piksel koordinatlarını bu konteynerin kendi
  // (ölçeklenmemiş, sanal 440x920) koordinat uzayına çevirir; App.jsx'teki Stage
  // ölçeklemesinden (letterbox) bağımsız, tutarlı bir sürükleme mesafesi sağlar.
  const onDown = useCallback(e => {
    dragging.current = true;
    moved.current = false;
    startY.current = e.currentTarget.toLocal(e.global).y;
    startOffset.current = offset;
  }, [offset]);

  const onMove = useCallback(e => {
    if (!dragging.current) return;
    const localY = e.currentTarget.toLocal(e.global).y;
    const dy = localY - startY.current;
    if (Math.abs(dy) > 4) moved.current = true;
    setOffset(clamp(startOffset.current + dy));
  }, [maxOffset]);

  const endDrag = useCallback(() => { dragging.current = false; }, []);

  const drawMask = useCallback(g => {
    g.clear();
    g.beginFill(0xffffff);
    g.drawRect(0, 0, width, height);
    g.endFill();
  }, [width, height]);

  const hitArea = new Rectangle(0, 0, width, Math.max(height, contentHeight));

  return (
    <Container
      x={x} y={y}
      interactive
      hitArea={hitArea}
      pointerdown={onDown}
      pointermove={onMove}
      pointerup={endDrag}
      pointerupoutside={endDrag}
    >
      {/* renderable=false: bu şekil yalnızca maske geometrisi olarak kullanılır, kendisi çizilmez */}
      <Graphics draw={drawMask} renderable={false} ref={g => { if (g && g !== maskGfx) setMaskGfx(g); }} />
      <Container mask={maskGfx || undefined} y={offset}>
        {children}
      </Container>
    </Container>
  );
}
