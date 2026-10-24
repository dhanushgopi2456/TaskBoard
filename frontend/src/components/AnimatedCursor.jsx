import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity, AnimatePresence } from 'motion/react';

export default function AnimatedCursor() {
  // Device capability check: true only for devices with a real mouse/trackpad pointer
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState('default'); // 'default' | 'hover' | 'text' | 'click'
  const [ripples, setRipples] = useState([]);

  // Raw mouse coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorOpacity = useSpring(0, { stiffness: 400, damping: 30 });

  // Spring physics for trailing aura ring
  const springConfig = { stiffness: 380, damping: 28, mass: 0.6 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Velocity-driven hydrodynamic stretch
  const velocityX = useVelocity(cursorX);
  const velocityY = useVelocity(cursorY);

  const speed = useTransform([velocityX, velocityY], ([vx, vy]) => {
    const v = Math.sqrt(vx * vx + vy * vy);
    return Math.min(v / 900, 0.45);
  });

  const stretchX = useTransform(speed, (s) => 1 + s * 0.8);
  const stretchY = useTransform(speed, (s) => 1 - s * 0.4);
  const rotateAngle = useTransform([velocityX, velocityY], ([vx, vy]) => {
    if (Math.abs(vx) < 1 && Math.abs(vy) < 1) return 0;
    return (Math.atan2(vy, vx) * 180) / Math.PI;
  });

  // Positions mapped to center of cursor
  const dotX = useTransform(cursorX, (x) => x - 4);
  const dotY = useTransform(cursorY, (y) => y - 4);

  const ringSize = cursorState === 'hover' ? 52 : cursorState === 'text' ? 32 : cursorState === 'click' ? 28 : 36;
  const ringOffset = ringSize / 2;

  const ringX = useTransform(smoothX, (x) => x - ringOffset);
  const ringY = useTransform(smoothY, (y) => y - ringOffset);

  // Check device capabilities on mount
  useEffect(() => {
    const checkPointer = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
      setIsPointerFine(hasFinePointer);
      if (hasFinePointer) {
        document.documentElement.classList.add('custom-cursor-enabled');
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled');
      }
    };

    checkPointer();
    window.addEventListener('resize', checkPointer);

    return () => {
      window.removeEventListener('resize', checkPointer);
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, []);

  // Pointer movement and hover detection
  useEffect(() => {
    // If not a fine pointer, we only listen for touch/tap ripples
    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') {
        setIsPointerFine(false);
        document.documentElement.classList.remove('custom-cursor-enabled');
        return;
      }

      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      cursorOpacity.set(1);
      setIsVisible(true);
    };

    const handlePointerOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      if (
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        setCursorState('text');
      } else if (
        target.closest(
          'button, a, [role="button"], select, [data-cursor-hover], .cursor-pointer, .glass-card, input[type="checkbox"], input[type="radio"]'
        )
      ) {
        setCursorState('hover');
      } else {
        setCursorState('default');
      }
    };

    const handlePointerDown = (e) => {
      setCursorState('click');

      // Spawn click/tap ripple (compatible with both mouse clicks and mobile touches)
      const newRipple = {
        id: 'rip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const handlePointerUp = () => {
      setCursorState('default');
    };

    const handleMouseLeave = () => {
      cursorOpacity.set(0);
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      cursorOpacity.set(1);
      setIsVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, cursorOpacity]);

  // Clean up finished ripples after animation duration
  const removeRipple = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      {/* 1. Mobile & Web Tap Ripples (Works everywhere, 100% touch friendly) */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0.2, opacity: 0.65 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                left: ripple.x - 18,
                top: ripple.y - 18,
              }}
              className="absolute w-9 h-9 rounded-full border border-indigo-500/70 dark:border-indigo-400/80 bg-indigo-500/15 pointer-events-none backdrop-blur-[1px] shadow-3d-glow"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Desktop Mouse Following Elements (Only shown on fine pointer devices, hidden on mobile/touch) */}
      {isPointerFine && (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
          {/* A. Outer Chasing Aura Ring with Velocity Stretch */}
          <motion.div
            style={{
              x: ringX,
              y: ringY,
              opacity: cursorOpacity,
              width: ringSize,
              height: ringSize,
              scaleX: stretchX,
              scaleY: stretchY,
              rotate: rotateAngle,
            }}
            transition={{
              width: { type: 'spring', stiffness: 450, damping: 25 },
              height: { type: 'spring', stiffness: 450, damping: 25 },
            }}
            className={`fixed rounded-full pointer-events-none will-change-transform transition-colors duration-200 border ${
              cursorState === 'hover'
                ? 'border-indigo-500/80 dark:border-indigo-400/90 bg-indigo-500/15 backdrop-blur-[2px] shadow-3d-glow'
                : cursorState === 'text'
                ? 'border-purple-500/60 dark:border-purple-400/70 bg-purple-500/10'
                : cursorState === 'click'
                ? 'border-emerald-500/80 bg-emerald-500/20 scale-90'
                : 'border-slate-400/50 dark:border-slate-500/50 bg-indigo-500/5'
            }`}
          />

          {/* B. Precision Center Core Dot */}
          <motion.div
            style={{
              x: dotX,
              y: dotY,
              opacity: cursorOpacity,
            }}
            className={`fixed w-2 h-2 rounded-full pointer-events-none shadow-sm will-change-transform ${
              cursorState === 'hover'
                ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] scale-125'
                : cursorState === 'click'
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                : cursorState === 'text'
                ? 'bg-purple-500 h-3 w-1 -translate-y-0.5 rounded-sm'
                : 'bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]'
            }`}
          />
        </div>
      )}
    </>
  );
}

