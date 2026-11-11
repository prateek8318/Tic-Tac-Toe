import { useSyncExternalStore } from 'react';
import { load, save } from './storage';

// Small Web Audio synth: no audio files to load, works offline, instant on mobile.
let ctx = null;
let muted = load('arcade-muted', false);
const listeners = new Set();

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

const tone = (freq, duration = 0.12, { type = 'sine', volume = 0.12, delay = 0, slide } = {}) => {
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    const start = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch {
    /* audio not available */
  }
};

const notes = (list, gap = 0.09, opts) => list.forEach((f, i) => tone(f, 0.16, { ...opts, delay: i * gap }));

export const sfx = {
  tap: () => tone(660, 0.05, { type: 'triangle', volume: 0.08 }),
  move: () => tone(520, 0.08, { type: 'triangle', volume: 0.1 }),
  pop: () => tone(380, 0.1, { type: 'sine', volume: 0.14, slide: 760 }),
  good: () => notes([660, 880], 0.07, { type: 'triangle' }),
  bad: () => tone(200, 0.22, { type: 'sawtooth', volume: 0.07, slide: 110 }),
  draw: () => notes([440, 392], 0.12, { type: 'sine' }),
  win: () => notes([523, 659, 784, 1047], 0.1, { type: 'triangle', volume: 0.13 }),
  lose: () => notes([392, 330, 262], 0.14, { type: 'sine', volume: 0.12 }),
  note: (freq) => tone(freq, 0.32, { type: 'sine', volume: 0.16 }),
};

export const haptic = (pattern = 10) => {
  if (muted) return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
};

export const setMuted = (value) => {
  muted = value;
  save('arcade-muted', value);
  listeners.forEach((fn) => fn());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useMuted = () => useSyncExternalStore(subscribe, () => muted, () => muted);
