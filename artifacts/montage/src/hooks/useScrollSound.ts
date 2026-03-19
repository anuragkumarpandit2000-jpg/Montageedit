import { useEffect, useRef } from "react";

export function useScrollSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastScrollY = useRef(0);
  const lastTickTime = useRef(0);
  const accumulatedDelta = useRef(0);

  const getAudioCtx = (): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playMechanicalClick = (intensity: number = 1) => {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const vol = Math.min(0.18 + intensity * 0.06, 0.28);

    // White noise burst
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter — gives it the "click" character
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 3200;
    bandpass.Q.value = 0.6;

    // High-pass to remove muddiness
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 1400;

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.04);
  };

  useEffect(() => {
    const TICK_INTERVAL_MS = 80;
    const DELTA_THRESHOLD = 18;

    const onScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;

      accumulatedDelta.current += delta;

      if (
        now - lastTickTime.current >= TICK_INTERVAL_MS &&
        accumulatedDelta.current >= DELTA_THRESHOLD
      ) {
        const intensity = Math.min(accumulatedDelta.current / 80, 1);
        playMechanicalClick(intensity);
        lastTickTime.current = now;
        accumulatedDelta.current = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
