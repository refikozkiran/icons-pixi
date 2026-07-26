import React, { useMemo } from 'react';
import { Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import ModalOverlay from './ModalOverlay.jsx';
import Btn from './Button.jsx';
import { useUI } from '../../state/uiStore.js';
import { useProgress } from '../../state/progressStore.js';
import { useGame } from '../../state/gameStore.js';

export function HowtoModal() {
  const ui = useUI();
  const panelWidth = VW - 48, panelHeight = 380;
  const styles = useMemo(() => ({
    title: new TextStyle({ fontFamily: fontFamily(), fontSize: 16, fontWeight: '800', fill: 0xeae6ff }),
    body: new TextStyle({
      fontFamily: fontFamily(), fontSize: 12.5, fill: 0xa79fd6, fontWeight: '600', lineHeight: 20,
      wordWrap: true, wordWrapWidth: panelWidth - 48,
    }),
  }), [panelWidth]);

  const text =
    'Amacın: her satıra, her sütuna ve her renkli bölgeye tam olarak bir ikon yerleştirmek.\n\n' +
    '• Tek dokunuş: hücreye ✕ işareti koyar ("buraya ikon olamaz" notu)\n' +
    '• Bir dokunuş daha: ikon yerleşir\n' +
    '• Bir dokunuş daha: hücre boşalır\n\n' +
    'İki ikon aynı satırda, sütunda, renkli bölgede ya da çapraz komşu hücrede olamaz. ' +
    'Takılırsan 💡 İpucu butonunu kullanabilirsin.';

  return (
    <ModalOverlay panelWidth={panelWidth} panelHeight={panelHeight} dismissible onDismiss={() => ui.closeModal()}>
      <Text text="❓ Nasıl Oynanır?" x={24} y={24} style={styles.title} />
      <Text text={text} x={24} y={64} style={styles.body} />
      <Btn x={24} y={panelHeight - 66} width={panelWidth - 48} height={48} variant="primary" label="Anladım" onTap={() => ui.closeModal()} />
    </ModalOverlay>
  );
}

export function ResetConfirmModal() {
  const ui = useUI();
  const panelWidth = VW - 64, panelHeight = 240;
  const styles = useMemo(() => ({
    title: new TextStyle({ fontFamily: fontFamily(), fontSize: 15, fontWeight: '800', fill: 0xeae6ff }),
    body: new TextStyle({ fontFamily: fontFamily(), fontSize: 12, fill: 0xa79fd6, fontWeight: '600', align: 'center', wordWrap: true, wordWrapWidth: panelWidth - 40 }),
  }), [panelWidth]);

  function confirmReset() {
    if (useGame.getState().idx != null) useGame.setState({ idx: null });
    useProgress.getState().resetProgress();
    ui.closeModal();
    ui.goto('home');
  }

  return (
    <ModalOverlay panelWidth={panelWidth} panelHeight={panelHeight}>
      <Text text="⚠️ Emin misin?" x={panelWidth / 2} y={30} anchor={0.5} style={styles.title} />
      <Text text={'Tüm ilerlemen, altınların, yıldızların ve ikon koleksiyonun kalıcı olarak silinecek.'} x={panelWidth / 2} y={58} anchor={{ x: 0.5, y: 0 }} style={styles.body} />
      <Btn x={20} y={panelHeight - 60} width={panelWidth - 40} height={44} variant="danger" label="Evet, Sıfırla" onTap={confirmReset} />
      <Btn x={20} y={panelHeight - 108} width={panelWidth - 40} height={40} variant="ghost" label="Vazgeç" onTap={() => ui.closeModal()} />
    </ModalOverlay>
  );
}
