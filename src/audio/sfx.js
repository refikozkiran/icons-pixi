// Orijinal oyundaki WebAudio sentez tabanlı ses efektleri, framework'ten bağımsız.
let _audioCtx = null;
let _noiseBuffer = null;

export function getAudioCtx() {
  _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function getNoiseBuffer(ctx) {
  if (_noiseBuffer && _noiseBuffer.sampleRate === ctx.sampleRate) return _noiseBuffer;
  const len = ctx.sampleRate * 1;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  _noiseBuffer = buffer;
  return buffer;
}

function playTone(ctx, freq, t0, dur, peak, opts = {}) {
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = opts.brightness || 5200;
  lp.Q.value = 0.3;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + (opts.attack || 0.02));
  gain.gain.exponentialRampToValueAtTime(0.0006, t0 + dur);
  gain.connect(lp); lp.connect(ctx.destination);

  const core = ctx.createOscillator();
  core.type = 'sine';
  core.frequency.setValueAtTime(freq, t0);
  if (opts.pitchTo) core.frequency.exponentialRampToValueAtTime(opts.pitchTo, t0 + dur);
  core.connect(gain);
  core.start(t0); core.stop(t0 + dur + 0.05);

  const overtone = ctx.createOscillator();
  const overtoneGain = ctx.createGain();
  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(freq * (opts.detune || 2.003), t0);
  overtoneGain.gain.value = opts.overtoneMix != null ? opts.overtoneMix : 0.35;
  overtone.connect(overtoneGain); overtoneGain.connect(gain);
  overtone.start(t0); overtone.stop(t0 + dur + 0.05);
}

function playFilteredNoise(ctx, t0, dur, peak, opts = {}) {
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = opts.filterType || 'bandpass';
  filter.Q.value = opts.q != null ? opts.q : 0.9;
  filter.frequency.setValueAtTime(opts.freqFrom || 1000, t0);
  if (opts.freqTo) filter.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + (opts.attack || 0.03));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  noise.start(t0); noise.stop(t0 + dur + 0.02);
}

export function playCoinChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    playTone(ctx, 880, now, 0.4, 0.20, { brightness: 6000, overtoneMix: 0.3 });
    playTone(ctx, 1318.51, now + 0.09, 0.38, 0.18, { brightness: 6500, overtoneMix: 0.28 });
  } catch (e) {}
}

export function playStarChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const notes = [1046.5, 1396.91, 1760];
    notes.forEach((freq, i) => {
      playTone(ctx, freq, now + i * 0.075, 0.34, 0.15, { brightness: 7500, overtoneMix: 0.4, detune: 2.006 });
    });
  } catch (e) {}
}

export function playChestOpenSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    playTone(ctx, 150, now, 0.36, 0.22, { pitchTo: 52, brightness: 900, overtoneMix: 0.15, attack: 0.015 });
    playFilteredNoise(ctx, now, 0.5, 0.10, { filterType: 'bandpass', q: 0.7, freqFrom: 220, freqTo: 1800, attack: 0.09 });
  } catch (e) {}
}

export function playChestBurstSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    playFilteredNoise(ctx, now, 0.22, 0.09, { filterType: 'highpass', freqFrom: 4200, attack: 0.008 });
    const notes = [523.25, 659.25, 784.0, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      playTone(ctx, freq, now + 0.05 + i * 0.06, 0.5, 0.14, { brightness: 4200, overtoneMix: 0.25, detune: 2.004 });
    });
  } catch (e) {}
}

export function playVictoryChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch (e) {}
}

export function playTapSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    playTone(ctx, 340, now, 0.09, 0.06, { brightness: 2500, overtoneMix: 0.1 });
  } catch (e) {}
}

export function vibrate(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}
