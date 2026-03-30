'use client';

import { useState, useMemo } from 'react';
import { PENSIONER_TOTALS, PENSIONER_CHANGE } from '@/lib/pensionData';
import { formatNumber } from '@/lib/dataUtils';
import styles from './PensionCalculator.module.css';

export default function PensionCalculator({ zupanije }) {
  const [countyId, setCountyId] = useState('ZG');

  const sorted = useMemo(
    () => [...zupanije].sort((a, b) => a.naziv.localeCompare(b.naziv, 'hr')),
    [zupanije]
  );

  const county = zupanije.find((z) => z.id === countyId);
  const latest = PENSIONER_TOTALS['2026-01'];

  const radnoSposobniPct = county
    ? (100 - county.mladi_0_14_postotak - county.stari_65plus_postotak).toFixed(1)
    : '0';
  const radnoSposobniAbs = county
    ? Math.round(county.stanovnistvo_2021 * (100 - county.mladi_0_14_postotak - county.stari_65plus_postotak) / 100)
    : 0;

  // National: total pensioners per 100 working-age persons
  // Working-age population ~ sum of all county pop * (100 - mladi% - stari%) / 100
  const totalRadnoSposobni = zupanije.reduce((sum, z) => {
    return sum + Math.round(z.stanovnistvo_2021 * (100 - z.mladi_0_14_postotak - z.stari_65plus_postotak) / 100);
  }, 0);
  const pensionersPerHundredWorkers = (latest.ukupno / totalRadnoSposobni * 100).toFixed(1);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Usporedba vaše županije</h2>
      <p className={styles.subtitle}>
        Odaberite županiju da vidite njezinu dobnu strukturu u kontekstu nacionalnog mirovinskog opterećenja.
      </p>

      <div className={styles.calculator}>
        <div className={styles.inputs}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="pension-county">
              Odaberite županiju
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

          {county && (
            <div className={styles.countyStats}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Stanovništvo (2021.): </span>
                <span className={styles.statValue}>{formatNumber(county.stanovnistvo_2021)}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Radno sposobni (15-64): </span>
                <span className={styles.statValue}>{formatNumber(radnoSposobniAbs)} ({radnoSposobniPct}%)</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Stariji od 65: </span>
                <span className={styles.statValue}>{county.stari_65plus_postotak}%</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Mlađi od 14: </span>
                <span className={styles.statValue}>{county.mladi_0_14_postotak}%</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Koef. ovisnosti: </span>
                <span className={styles.statValue}>{county.koeficijent_ovisnosti.toFixed(2)}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Pad stanovništva: </span>
                <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
                  {county.pad_postotak.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <span className={styles.resultLabel}>Nacionalno opterećenje</span>
            <span className={styles.resultRatio}>{pensionersPerHundredWorkers}</span>
            <span className={styles.resultContext}>umirovljenika na 100 radno sposobnih</span>
          </div>

          <div className={styles.nationalStats}>
            <div className={styles.nationalRow}>
              <span>Ukupno umirovljenika (sij. 2026.): </span>
              <strong>{formatNumber(latest.ukupno)}</strong>
            </div>
            <div className={styles.nationalRow}>
              <span>Radno sposobnih (15-64, popis 2021.): </span>
              <strong>{formatNumber(totalRadnoSposobni)}</strong>
            </div>
            <div className={styles.nationalRow}>
              <span>Promjena umirovljenika od 2021.:</span>
              <strong>{formatNumber(PENSIONER_CHANGE.apsolutno)} ({PENSIONER_CHANGE.postotak.toFixed(2)}%)</strong>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.disclaimer}>
        Izvor podataka o umirovljenicima: HZMO, mjesečna izvješća (pros. 2021., pros. 2025., sij. 2026.).
        Dobna struktura: DZS, Popis stanovništva 2021.
      </p>
    </section>
  );
}
