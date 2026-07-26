import React, { useEffect, useState } from 'react';
import { Stage, Container } from '@pixi/react';
import { VW, VH } from './pixi/theme.js';
import Background from './pixi/components/Background.jsx';
import BottomDock from './pixi/components/BottomDock.jsx';
import ToastLayer from './pixi/components/ToastLayer.jsx';
import ModalsRoot from './pixi/components/ModalsRoot.jsx';
import HomeScreen from './pixi/screens/HomeScreen.jsx';
import LevelsScreen from './pixi/screens/LevelsScreen.jsx';
import GameScreen from './pixi/screens/GameScreen.jsx';
import StoreScreen from './pixi/screens/StoreScreen.jsx';
import AchievementsScreen from './pixi/screens/AchievementsScreen.jsx';
import SettingsScreen from './pixi/screens/SettingsScreen.jsx';
import { useUI } from './state/uiStore.js';
import { useProgress } from './state/progressStore.js';
import { bindMusicAutoplayGesture, startMusic } from './audio/music.js';

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return size;
}

const SCREENS = {
  home: HomeScreen,
  levels: LevelsScreen,
  game: GameScreen,
  store: StoreScreen,
  achievements: AchievementsScreen,
  settings: SettingsScreen,
};

export default function App() {
  const { w, h } = useWindowSize();
  const screen = useUI(s => s.screen);
  const ScreenComp = SCREENS[screen] || HomeScreen;
  const showDock = screen !== 'game';

  useEffect(() => {
    bindMusicAutoplayGesture(() => useProgress.getState().musicTrack);
    // ilk yüklemede parça zaten seçiliyse (localStorage) jest hazırlığı yap
  }, []);

  const scale = Math.min(w / VW, h / VH);
  const offsetX = (w - VW * scale) / 2;
  const offsetY = (h - VH * scale) / 2;

  return (
    <Stage
      width={w}
      height={h}
      options={{ backgroundColor: 0x000000, antialias: true, autoDensity: true, resolution: window.devicePixelRatio || 1 }}
    >
      <Container x={offsetX} y={offsetY} scale={scale}>
        <Background />
        <ScreenComp />
        {showDock && <BottomDock />}
        <ToastLayer />
        <ModalsRoot />
      </Container>
    </Stage>
  );
}
