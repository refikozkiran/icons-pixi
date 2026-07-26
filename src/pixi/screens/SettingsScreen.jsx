import React, { useCallback, useMemo } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { fontFamily, VW } from '../theme.js';
import TopBar from '../components/TopBar.jsx';
import { MUSIC_TRACKS } from '../../data/musicTracks.js';
import { useProgress } from '../../state/progressStore.js';
import { useUI } from '../../state/uiStore.js';
import { startMusic } from '../../audio/music.js';
import { playTapSound } from '../../audio/sfx.js';

const TRACK_IDS = ['none', 'calm', 'upbeat', 'retro'];

export default function SettingsScreen() {
  const progress = useProgress();
  const goto = useUI(s => s.goto);
  const openModal = useUI(s => s.openModal);

  const setTrack = (id) => {
    progress.setMusicTrack(id);
    startMusic(id);
  };

  const styles = useMemo(() => ({
    section: new TextStyle({ fontFamily: fontFamily(), fontSize: 11.5, fontWeight: '800', fill: 0xa79fd6, letterSpacing: 1 }),
  }), []);

  return (
    <Container>
      <TopBar title="AYARLAR" onBack={() => goto('home')} />
      <Text text="ARKA PLAN MÜZİĞİ" x={16} y={70} style={styles.section} />
      <Container x={16} y={92}>
        {TRACK_IDS.map((id, i) => (
          <MusicOption
            key={id}
            y={i * 58}
            width={VW - 32}
            label={id === 'none' ? 'Kapalı' : MUSIC_TRACKS[id].label}
            active={progress.musicTrack === id}
            onTap={() => setTrack(id)}
          />
        ))}
      </Container>

      <Text text="VERİ" x={16} y={92 + TRACK_IDS.length * 58 + 20} style={styles.section} />
      <DangerBtn
        x={16} y={92 + TRACK_IDS.length * 58 + 42} width={VW - 32} height={52}
        label="İlerlemeyi Sıfırla" onTap={() => openModal('reset-confirm')}
      />
    </Container>
  );
}

function MusicOption({ y, width, label, active, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(active ? 0x8b7cff : 0xffffff, active ? 0.18 : 0.045);
    g.lineStyle(1, active ? 0x8b7cff : 0x332a5c, active ? 0.7 : 1);
    g.drawRoundedRect(0, 0, width, 48, 14);
    g.endFill();
  }, [width, active]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 13.5, fontWeight: '700', fill: 0xeae6ff });
  const checkStyle = new TextStyle({ fontFamily: fontFamily(), fontSize: 16, fill: 0x8b7cff });
  return (
    <Container y={y} interactive cursor="pointer" pointertap={() => { playTapSound(); onTap(); }}>
      <Graphics draw={draw} />
      <Text text={(active ? '🎵 ' : '🎼 ') + label} x={16} y={24} anchor={{ x: 0, y: 0.5 }} style={style} />
      {active && <Text text="✓" x={width - 24} y={24} anchor={0.5} style={checkStyle} />}
    </Container>
  );
}

function DangerBtn({ x, y, width, height, label, onTap }) {
  const draw = useCallback(g => {
    g.clear();
    g.beginFill(0xff5d7a, 0.14);
    g.lineStyle(1, 0xff5d7a, 0.5);
    g.drawRoundedRect(0, 0, width, height, 16);
    g.endFill();
  }, [width, height]);
  const style = new TextStyle({ fontFamily: fontFamily(), fontSize: 13.5, fontWeight: '800', fill: 0xff5d7a });
  return (
    <Container x={x} y={y} interactive cursor="pointer" pointertap={() => { playTapSound(); onTap(); }}>
      <Graphics draw={draw} />
      <Text text={'🗑️  ' + label} x={width / 2} y={height / 2} anchor={0.5} style={style} />
    </Container>
  );
}
