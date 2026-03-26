'use client';

import styles from './Projections.module.css';

export default function ScenarioSelector({ scenarios, selectedScenario, onSelect }) {
  return (
    <div className={styles.selectorRow}>
      {scenarios.map((s) => {
        const isActive = selectedScenario === s.id;
        return (
          <button
            key={s.id}
            className={`${styles.selectorButton}${isActive ? ` ${styles.selected}` : ''}`}
            style={
              isActive
                ? { borderColor: s.color, backgroundColor: `${s.color}10` }
                : undefined
            }
            onClick={() => onSelect(isActive ? null : s.id)}
          >
            <span className={styles.selectorDot} style={{ backgroundColor: s.color }} />
            {s.shortName}
          </button>
        );
      })}
    </div>
  );
}
