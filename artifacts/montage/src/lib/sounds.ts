let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx || _ctx.state === "closed") _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function ramp(gain: GainNode, from: number, to: number, dur: number) {
  const c = ctx();
  gain.gain.setValueAtTime(from, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(to, 0.0001), c.currentTime + dur);
}

/* ── UI click (buttons, links) ── */
export function playClick(vol = 0.22) {
  const c = ctx();
  const now = c.currentTime;

  const buf = c.createBuffer(1, c.sampleRate * 0.035, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 8);

  const src = c.createBufferSource();
  src.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 4500; bp.Q.value = 0.5;

  const g = c.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  src.connect(bp); bp.connect(g); g.connect(c.destination);
  src.start(now); src.stop(now + 0.04);
}

/* ── Card drop impact (auth modal lands) ── */
export function playCardLand() {
  const c = ctx();
  const now = c.currentTime;

  // Low thud
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.18);

  const thudG = c.createGain();
  thudG.gain.setValueAtTime(0.55, now);
  thudG.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(thudG); thudG.connect(c.destination);
  osc.start(now); osc.stop(now + 0.25);

  // Snap crack
  const snapBuf = c.createBuffer(1, c.sampleRate * 0.025, c.sampleRate);
  const sd = snapBuf.getChannelData(0);
  for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sd.length, 5);
  const snap = c.createBufferSource();
  snap.buffer = snapBuf;
  const snapBp = c.createBiquadFilter();
  snapBp.type = "bandpass"; snapBp.frequency.value = 2800; snapBp.Q.value = 0.4;
  const snapG = c.createGain();
  snapG.gain.setValueAtTime(0.3, now); snapG.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
  snap.connect(snapBp); snapBp.connect(snapG); snapG.connect(c.destination);
  snap.start(now); snap.stop(now + 0.03);

  // High shimmer decay
  const shimBuf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate);
  const shd = shimBuf.getChannelData(0);
  for (let i = 0; i < shd.length; i++) shd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / shd.length, 2.2);
  const shim = c.createBufferSource();
  shim.buffer = shimBuf;
  const shimHp = c.createBiquadFilter();
  shimHp.type = "highpass"; shimHp.frequency.value = 5500;
  const shimG = c.createGain();
  shimG.gain.setValueAtTime(0.08, now); shimG.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  shim.connect(shimHp); shimHp.connect(shimG); shimG.connect(c.destination);
  shim.start(now); shim.stop(now + 0.6);
}

/* ── Robot boot sequence (Spline landing page appears) ── */
export function playRobotBoot() {
  const c = ctx();
  const now = c.currentTime;

  // Stage 1: low hum power-up (0 → 0.4s)
  const hum = c.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.setValueAtTime(55, now);
  hum.frequency.linearRampToValueAtTime(220, now + 0.4);
  const humG = c.createGain();
  humG.gain.setValueAtTime(0, now);
  humG.gain.linearRampToValueAtTime(0.08, now + 0.1);
  humG.gain.linearRampToValueAtTime(0, now + 0.45);
  const humHp = c.createBiquadFilter();
  humHp.type = "bandpass"; humHp.frequency.value = 180; humHp.Q.value = 2;
  hum.connect(humHp); humHp.connect(humG); humG.connect(c.destination);
  hum.start(now); hum.stop(now + 0.5);

  // Stage 2: freq sweep (0.3 → 0.75s)
  const sweep = c.createOscillator();
  sweep.type = "sine";
  sweep.frequency.setValueAtTime(200, now + 0.3);
  sweep.frequency.exponentialRampToValueAtTime(3200, now + 0.75);
  const sweepG = c.createGain();
  sweepG.gain.setValueAtTime(0, now + 0.3);
  sweepG.gain.linearRampToValueAtTime(0.12, now + 0.4);
  sweepG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  sweep.connect(sweepG); sweepG.connect(c.destination);
  sweep.start(now + 0.3); sweep.stop(now + 0.85);

  // Stage 3: digital chatter (0.6 → 1.0s)
  for (let i = 0; i < 8; i++) {
    const t = now + 0.62 + i * 0.05;
    const chBuf = c.createBuffer(1, c.sampleRate * 0.018, c.sampleRate);
    const cd = chBuf.getChannelData(0);
    for (let j = 0; j < cd.length; j++) cd[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / cd.length, 4);
    const ch = c.createBufferSource(); ch.buffer = chBuf;
    const chBp = c.createBiquadFilter(); chBp.type = "bandpass"; chBp.frequency.value = 1800 + i * 300; chBp.Q.value = 1.2;
    const chG = c.createGain();
    chG.gain.setValueAtTime(0.12, t); chG.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    ch.connect(chBp); chBp.connect(chG); chG.connect(c.destination);
    ch.start(t); ch.stop(t + 0.025);
  }

  // Stage 4: "ready" tone arpeggio (1.0 → 1.4s)
  const notes = [440, 554, 660, 880];
  notes.forEach((freq, i) => {
    const t = now + 1.0 + i * 0.09;
    const o = c.createOscillator();
    o.type = "sine"; o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.13, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.18);
  });
}

/* ── Upload progress tick (call repeatedly with 0–100) ── */
export function playUploadTick(progress: number) {
  const c = ctx();
  const now = c.currentTime;
  const freq = 600 + progress * 14;

  const o = c.createOscillator();
  o.type = "square"; o.frequency.value = freq;

  const g = c.createGain();
  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const hp = c.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 400;

  o.connect(hp); hp.connect(g); g.connect(c.destination);
  o.start(now); o.stop(now + 0.045);
}

/* ── Upload complete success fanfare ── */
export function playUploadComplete() {
  const c = ctx();
  const now = c.currentTime;

  const chord = [523, 659, 784, 1047];
  chord.forEach((freq, i) => {
    const t = now + i * 0.07;
    const o = c.createOscillator();
    o.type = "sine"; o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.45);
  });

  // Final shimmer burst
  const sBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const sd = sBuf.getChannelData(0);
  for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sd.length, 3);
  const s = c.createBufferSource(); s.buffer = sBuf;
  const sHp = c.createBiquadFilter(); sHp.type = "highpass"; sHp.frequency.value = 6000;
  const sG = c.createGain(); sG.gain.setValueAtTime(0.06, now + 0.25); sG.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  s.connect(sHp); sHp.connect(sG); sG.connect(c.destination);
  s.start(now + 0.25); s.stop(now + 0.75);
}

/* ── Error / wrong password zap ── */
export function playError() {
  const c = ctx();
  const now = c.currentTime;

  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(280, now);
  o.frequency.exponentialRampToValueAtTime(80, now + 0.2);

  const g = c.createGain();
  g.gain.setValueAtTime(0.18, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  const dist = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x)); }
  dist.curve = curve;

  o.connect(dist); dist.connect(g); g.connect(c.destination);
  o.start(now); o.stop(now + 0.25);
}
