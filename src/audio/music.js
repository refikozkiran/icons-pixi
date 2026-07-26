import { getAudioCtx } from './sfx.js';
import { MUSIC_TRACKS } from '../data/musicTracks.js';

const musicState = { gain: null, playingId: null, stepIndex: 0, timer: null };

function ensureMusicGraph() {
  const ctx = getAudioCtx();
  if (!musicState.gain) {
    musicState.gain = ctx.createGain();
    musicState.gain.gain.value = 0;
    musicState.gain.connect(ctx.destination);
  }
  return ctx;
}

function playMusicNote(ctx, freq, t0, dur, peak, wave, brightness) {
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = brightness || 4000; lp.Q.value = 0.4;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  g.connect(lp); lp.connect(musicState.gain);
  const osc = ctx.createOscillator();
  osc.type = wave || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  osc.connect(g);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}

function scheduleMusicLoop(trackId) {
  const track = MUSIC_TRACKS[trackId];
  if (!track) return;
  const ctx = ensureMusicGraph();
  const beatDur = 60 / track.tempo;
  (function stepLoop() {
    if (musicState.playingId !== trackId) return;
    const freq = track.notes[musicState.stepIndex % track.notes.length];
    if (freq) {
      try { playMusicNote(ctx, freq, ctx.currentTime + 0.03, track.noteDur, track.peak, track.wave, track.brightness); } catch (e) {}
    }
    musicState.stepIndex++;
    musicState.timer = setTimeout(stepLoop, beatDur * 1000);
  })();
}

export function stopMusic() {
  musicState.playingId = null;
  if (musicState.timer) { clearTimeout(musicState.timer); musicState.timer = null; }
  if (musicState.gain) {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      musicState.gain.gain.cancelScheduledValues(now);
      musicState.gain.gain.setValueAtTime(musicState.gain.gain.value, now);
      musicState.gain.gain.linearRampToValueAtTime(0, now + 0.4);
    } catch (e) {}
  }
}

export function startMusic(trackId) {
  if (trackId === 'none' || !MUSIC_TRACKS[trackId]) { stopMusic(); return; }
  try {
    const ctx = ensureMusicGraph();
    musicState.playingId = trackId;
    musicState.stepIndex = 0;
    const now = ctx.currentTime;
    musicState.gain.gain.cancelScheduledValues(now);
    musicState.gain.gain.setValueAtTime(musicState.gain.gain.value, now);
    musicState.gain.gain.linearRampToValueAtTime(1, now + 0.6);
    scheduleMusicLoop(trackId);
  } catch (e) {}
}

export function isPlaying(trackId) {
  return musicState.playingId === trackId;
}

// Otomatik oynatma ilkesi: ilk kullanıcı etkileşiminde seçili parçayı devam ettir.
export function bindMusicAutoplayGesture(getWantedTrack) {
  const tryResume = () => {
    const wanted = getWantedTrack();
    if (wanted && wanted !== 'none' && musicState.playingId !== wanted) {
      startMusic(wanted);
    }
    document.removeEventListener('pointerdown', tryResume);
  };
  document.addEventListener('pointerdown', tryResume, { once: true });
}
