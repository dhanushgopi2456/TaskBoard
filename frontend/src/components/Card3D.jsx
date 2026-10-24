import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export default function Card3D({
  children,
  className = '',
  maxTilt = 7,
  onClick,
  glowColor = 'rgba(99, 102, 241, 0.18)',
  ...props
}) {
  const cardRef = useRef(null);

  // Normalized motion values for cursor position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isHovered = useMotionValue(0);

  // Smooth springs for rotation physics
  const springConfig = { stiffness: 350, damping: 25 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothGlow = useSpring(isHovered, { stiffness: 400, damping: 30 });

  // Transforms mapped to rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Dynamic light position
  const lightX = useTransform(smoothX, [-0.5, 0.5], ['20%', '80%']);
  const lightY = useTransform(smoothY, [-0.5, 0.5], ['20%', '80%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseEnter = () => {
    isHovered.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    isHovered.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
      className={`relative rounded-3xl will-change-transform ${className}`}
      {...props}
    >
      {/* 3D Specular Sheen Layer that follows cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl z-10 transition-opacity duration-300 overflow-hidden"
        style={{
          opacity: smoothGlow,
          background: useTransform(
            [lightX, lightY],
            ([lx, ly]) =>
              `radial-gradient(circle 280px at ${lx} ${ly}, ${glowColor}, transparent 75%)`
          ),
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
