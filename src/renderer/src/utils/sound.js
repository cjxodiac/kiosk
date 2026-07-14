let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  return ctx;
}

export function playBeep(freq = 1200, duration = 80) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain).connect(c.destination);
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration / 1000);
    osc.start();
    osc.stop(c.currentTime + duration / 1000);
  } catch (e) {}
}

export function playSuccess() {
  playBeep(800, 100);
  setTimeout(() => playBeep(1200, 150), 110);
}