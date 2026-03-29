'use client';

import { useState, useMemo } from 'react';
import { calculateRetirementProjection } from '@/lib/pensionData';
import { formatRatio } from '@/lib/dataUtils';
import styles from './PensionCalculator.module.css';

export default function PensionCalculator({ zupanije }) {
  const [age, setAge] = useState(35);
  const [countyId, setCountyId] = useState('ZG');

  const sorted = useMemo(
    () => [...zupanije].sort((a, b) => a.naziv.localeCompare(b.naziv, 'hr')),
    [zupanije]
  );

  const selectedCounty = zupanije.find((z) => z.id === countyId);
  const countyRatio = selectedCounty?.omjer_radnici_umirovljenici || 1.18;

  const result = useMemo(
    () => calculateRetirementProjection(age, countyRatio),
    [age, countyRatio]
  );

  const ratioColor =
    result.projectedRatio >= 1.0
      ? 'var(--color-positive)'
      : result.projectedRatio >= 0.7
        ? 'var(--color-warning)'
        : 'var(--color-primary)';

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Osobni kalkulator umirovljenja</h2>
      <p className={styles.subtitle}>
        Unesite svoju dob i županiju da vidite projekciju omjera radnika i umirovljenika
        u trenutku vašeg umirovljenja.
      </p>

      <div className={styles.calculator}>
        <div className={styles.inputs}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="pension-age">
              Vaša dob: <strong>{age}</strong> godina
            </label>
            <input
              id="pension-age"
              type="range"
              min={20}
              max={60}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>20</span>
              <span>60</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="pension-county">
              Vaša županija
            </label>
            <select
              id="pension-county"
              value={countyId}
              onChange={(e) => setCountyId(e.target.value)}
              className={styles.select}
            >
              {sorted.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.naziv}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <span className={styles.resultLabel}>Kad se umirovite ({result.retirementYear}.)</span>
            <span className={styles.resultRatio} style={{ color: ratioColor }}>
              {formatRatio(result.projectedRatio)}
            </span>
            <span className={styles.resultContext}>radnika po umirovljeniku</span>
          </div>

          <div className={styles.comparison}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Danas</span>
              <span className={styles.comparisonValue}>{formatRatio(result.currentRatio)}</span>
            </div>
            <div className={styles.comparisonArrow}>&rarr;</div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>{result.retirementYear}.</span>
              <span className={styles.comparisonValue} style={{ color: ratioColor }}>
                {formatRatio(result.projectedRatio)}
              </span>
            </div>
          </div>

          <p className={styles.explanation}>
            {result.projectedRatio < 0.7
              ? `U godini vašeg umirovljenja, manje od 0,7 radnika financirat će svakog umirovljenika u vašoj županiji. To je duboko neodrživo bez temeljite reforme mirovinskog sustava.`
              : result.projectedRatio < 1.0
                ? `U godini vašeg umirovljenja, manje od jednog radnika financirat će svakog umirovljenika u vašoj županiji. Sustav će biti pod značajnim pritiskom.`
                : `Omjer ostaje iznad 1:1, ali je niži nego danas. Demografski trendovi postavljaju dugoročni izazov za mirovinski sustav.`}
          </p>
        </div>
      </div>

      <p className={styles.disclaimer}>
        Ovo je ilustrativna projekcija temeljena na javnim podatcima DZS-a i HZMO-a.
        Ne predstavlja financijski savjet niti garanciju budućeg stanja mirovinskog sustava.
        Stvarni ishodi ovise o ekonomskim, demografskim i političkim čimbenicima.
      </p>
    </section>
  );
}
