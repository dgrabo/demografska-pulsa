'use client';

import styles from './MigrationToggle.module.css';

export default function MigrationToggle({ isActive, onToggle }) {
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
          <path d="M17 3l4 4-4 4" />
          <path d="M3 11h18" />
          <path d="M7 21l-4-4 4-4" />
          <path d="M21 13H3" />
        </svg>
        Migracijska bilanca
      </button>
      {isActive && (
        <p className={styles.hint}>
          Prikazuje neto migraciju po županijama (2024.)
        </p>
      )}
    </div>
  );
}
