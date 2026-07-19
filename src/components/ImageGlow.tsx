/**
 * ImageGlow — reusable blurred-photo backdrop (DESIGN.md → Component patterns, issue #59).
 *
 * Renders only the blurred, bled-out copy of a photo. Drop it as the first child of a
 * `position: relative` wrapper, sized/rounded via `className`, then stack the sharp photo/card on top —
 * it becomes an ambient colored drop shadow instead of a neutral box-shadow.
 */

import styles from './ImageGlow.module.css';

interface ImageGlowProps {
  src: string;
  className?: string;
}

export function ImageGlow({ src, className }: ImageGlowProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={className ? `${styles.glow} ${className}` : styles.glow}
    />
  );
}
