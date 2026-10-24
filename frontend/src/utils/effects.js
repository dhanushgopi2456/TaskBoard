import confetti from 'canvas-confetti';

// Global Sound state (synced with localStorage & navbar state)
let isSoundGloballyEnabled = (() => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taskboard_sound') : null;
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
})();

export function setGlobalSoundEnabled(enabled) {
  isSoundGloballyEnabled = Boolean(enabled);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskboard_sound', isSoundGloballyEnabled.toString());
    }
  } catch {}
}

export function getGlobalSoundEnabled() {
  return isSoundGloballyEnabled;
}

// Lightweight Web Audio API synthesized sounds (zero network latency, pure Web Audio)
let audioCtx = null;

export function getAudioContext() {
  try {
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AudioContextClass) return null;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Ensure audio context is ready on initial user touch/click
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

// Crisp dual-harmonic bell chime for task completion
export function playSuccessSound() {
  if (!isSoundGloballyEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => triggerSuccessSound(ctx)).catch(() => {});
    } else {
      triggerSuccessSound(ctx);
    }
  } catch {
    // Audio might be blocked by browser policy until user interacts
  }
}

function triggerSuccessSound(ctx) {
  const now = ctx.currentTime;
  
  // First high chime
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(587.33, now); // D5
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.35);

  // Second bell harmonic
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
  gain2.gain.setValueAtTime(0.1, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.08);
  osc2.stop(now + 0.4);
}

// Gentle pleasant double chime for popups / notifications
export function playNotificationSound() {
  if (!isSoundGloballyEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => triggerNotificationSound(ctx)).catch(() => {});
    } else {
      triggerNotificationSound(ctx);
    }
  } catch {
    // ignore
  }
}

function triggerNotificationSound(ctx) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

// Subtle cheerful pop sound for card interactions / tab switch
export function playPopSound() {
  if (!isSoundGloballyEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => triggerPopSound(ctx)).catch(() => {});
    } else {
      triggerPopSound(ctx);
    }
  } catch {
    // ignore
  }
}

function triggerPopSound(ctx) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

  gain.gain.setValueAtTime(0.07, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

// Soft descending tone for deletion
export function playDeleteSound() {
  if (!isSoundGloballyEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => triggerDeleteSound(ctx)).catch(() => {});
    } else {
      triggerDeleteSound(ctx);
    }
  } catch {
    // ignore
  }
}

function triggerDeleteSound(ctx) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

// 3D Multi-color Confetti Explosion
export function triggerConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 70,
    spread: 80,
    origin: { x: originX, y: originY },
    colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#38bdf8'],
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}

// Subtle confetti burst
export function triggerSubtleConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 35,
    spread: 50,
    origin: { x: originX, y: originY },
    colors: ['#10b981', '#6366f1', '#f59e0b'],
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}
