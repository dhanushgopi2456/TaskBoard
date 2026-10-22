import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Card3D({
  children,
  className = '',
  maxTilt = 6,
  onClick,
  glowColor = 'rgba(99, 102, 241, 0.15)',
  ...props
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
    setSheenPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.012 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
      className={`relative rounded-2xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      {/* 3D Specular Sheen Layer */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${sheenPos.x}% ${sheenPos.y}%, ${glowColor}, transparent 75%)`,
          }}
        />
      )}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
