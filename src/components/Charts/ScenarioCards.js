'use client';

import { SCENARIOS, KEY_FACTORS } from '@/lib/projectionData';
import styles from './Projections.module.css';

export default function ScenarioCards({ selectedScenario }) {
  const scenario = selectedScenario !== null ? SCENARIOS[selectedScenario] : null;

  return (
    <div className={styles.contextSection}>
      {scenario ? (
        <div
          className={styles.scenarioExplanation}
          style={{ borderLeft: `4px solid ${scenario.color}` }}
        >
          <div className={styles.scenarioName}>{scenario.name}</div>
          <div className={styles.scenarioDesc}>{scenario.description}</div>
        </div>
      ) : (
        <p className={styles.introText}>
          Odaberite scenarij iznad za detaljnije objašnjenje. Sve projekcije polaze od popisa
          2021. godine i razlikuju se prema pretpostavkama o fertilitetu, mortalitetu i
          migracijama.
        </p>
      )}

      <h3 className={styles.factorsTitle}>Ključni demografski čimbenici</h3>
      <div className={styles.factorsGrid}>
        {KEY_FACTORS.map((f) => (
          <div key={f.label} className={styles.factorCard}>
            <div className={styles.factorIcon}>{f.icon}</div>
            <div className={styles.factorLabel}>{f.label}</div>
            <div className={styles.factorValue}>{f.value}</div>
            <div className={styles.factorContext}>{f.context}</div>
          </div>
        ))}
      </div>

      <p className={styles.sourceText}>
        Izvor: Strategija demografske revitalizacije RH, Narodne novine 36/2024
      </p>
    </div>
  );
}
