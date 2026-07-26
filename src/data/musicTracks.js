export const MUSIC_TRACKS = {
  calm: {
    label: 'Sakin',
    tempo: 88, wave: 'sine', brightness: 3000, peak: 0.05, noteDur: 1.05,
    notes: [523.25,null,659.25,null,783.99,null,659.25,null, 587.33,null,698.46,null,880.00,null,698.46,null]
  },
  upbeat: {
    label: 'Enerjik',
    tempo: 128, wave: 'triangle', brightness: 4600, peak: 0.045, noteDur: 0.27,
    notes: [659.25,783.99,880.00,783.99, 659.25,587.33,659.25,783.99, 880.00,987.77,880.00,783.99, 659.25,783.99,659.25,523.25]
  },
  retro: {
    label: 'Retro',
    tempo: 140, wave: 'square', brightness: 3400, peak: 0.032, noteDur: 0.2,
    notes: [392.00,392.00,523.25,392.00, 349.23,349.23,440.00,349.23, 392.00,392.00,523.25,392.00, 587.33,523.25,466.16,392.00]
  }
};
