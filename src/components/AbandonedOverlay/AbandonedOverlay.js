'use client';

import styles from './AbandonedOverlay.module.css';

export default function AbandonedOverlay({ totalAbandoned, isActive, onToggle }) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.toggle} ${isActive ? styles.toggleActive : ''}`}
        onClick={onToggle}
        aria-pressed={isActive}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Napuštena Hrvatska
      </button>
      {isActive && (
        <p className={styles.counter}>
          <strong>{totalAbandoned}</strong> naselja ima manje od 10 stanovnika
        </p>
      )}
    </div>
  );
}
