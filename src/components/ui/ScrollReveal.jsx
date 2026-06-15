'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ScrollReveal.module.css';

export default function ScrollReveal({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'fade'
  delay = 0,
  duration = 600,
  distance = 40,
  threshold = 0.15,
  once = true,
  className = '',
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  const transformMap = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    fade: 'none',
  };

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : transformMap[direction],
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
