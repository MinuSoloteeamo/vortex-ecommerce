'use client';

import { useState } from 'react';
import styles from './ImageMagnifier.module.css';

export default function ImageMagnifier({ src, alt }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className={styles.magnifierContainer}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Regular Image */}
      {src.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <div className={styles.emojiFallback}>{src}</div>
      )}

      {/* Magnifier Lens */}
      {showMagnifier && src.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) && (
        <div
          className={styles.magnifierLens}
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
          }}
        />
      )}
    </div>
  );
}
