'use client';

import styles from './ServiceToggles.module.css';

export default function ServiceToggles({
  schoolData,
  healthData,
  showSchool,
  showHealth,
  onToggleSchool,
  onToggleHealth,
}) {
  const schoolRiskCount = schoolData
    ? schoolData.filter((d) => d.rizik_skolski).length
    : 0;

  const healthYellowRedCount = healthData
    ? healthData.filter((d) => d.rizik_zdravstveni !== 'zeleno').length
    : 0;

  return (
    <div className={styles.container}>
      <button
        className={`${styles.toggle} ${showSchool ? styles.toggleActiveSchool : ''}`}
        onClick={onToggleSchool}
        aria-pressed={showSchool}
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
          <path d="M2 10l10-7 10 7" />
          <path d="M4 10v10h16V10" />
          <path d="M9 20v-6h6v6" />
          <path d="M12 3v4" />
        </svg>
        Pad učenika
      </button>

      <button
        className={`${styles.toggle} ${showHealth ? styles.toggleActiveHealth : ''}`}
        onClick={onToggleHealth}
        aria-pressed={showHealth}
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
          <path d="M4.8 2.3A2 2 0 0 0 3 4.3v15.4a2 2 0 0 0 1.8 2h.6a2 2 0 0 0 1.2-.4l3.4-2.4a2 2 0 0 1 2 0l3.4 2.4a2 2 0 0 0 1.2.4h.6a2 2 0 0 0 1.8-2V4.3a2 2 0 0 0-1.8-2z" />
          <path d="M12 8v4" />
          <path d="M10 10h4" />
        </svg>
        Dostupnost liječnika
      </button>

      {showSchool && (
        <p className={styles.counter}>
          <strong>{schoolRiskCount}</strong> županija ima pad upisa veći od 25%
        </p>
      )}
      {showHealth && (
        <p className={styles.counter}>
          <strong>{healthYellowRedCount}</strong> županija ima opterećene liječnike opće prakse
        </p>
      )}
    </div>
  );
}
