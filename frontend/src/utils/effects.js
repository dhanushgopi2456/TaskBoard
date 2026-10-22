import confetti from 'canvas-confetti';

// Lightweight Web Audio API chime sound
let audioCtx = null;

export function playSuccessSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // First high chime
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell harmonic
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch (e) {
    // Audio might be blocked by browser policy until user interacts
  }
}

// 3D Multi-color Confetti Explosion
export function triggerConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'],
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}
