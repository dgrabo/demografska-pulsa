'use client';

import { formatNumber, formatPercent } from '../../lib/dataUtils';
import styles from './ComparisonTable.module.css';

const metrics = [
  {
    label: 'Stanovništvo 2021.',
    key: 'stanovnistvo_2021',
    format: formatNumber,
    higherIsBetter: true,
  },
  {
    label: 'Stanovništvo 2011.',
    key: 'stanovnistvo_2011',
    format: formatNumber,
    higherIsBetter: true,
  },
  {
    label: 'Pad (%)',
    key: 'pad_postotak',
    format: formatPercent,
    higherIsBetter: true, // less negative = better, so higher value is better
  },
  {
    label: 'Udio 65+',
    key: 'stari_65plus_postotak',
    format: (v) => v.toLocaleString('hr-HR', { minimumFractionDigits: 1 }) + '%',
    higherIsBetter: false,
  },
  {
    label: 'Udio 0-14',
    key: 'mladi_0_14_postotak',
    format: (v) => v.toLocaleString('hr-HR', { minimumFractionDigits: 1 }) + '%',
    higherIsBetter: true,
  },
  {
    label: 'Indeks starenja',
    key: 'indeks_starenja',
    format: (v) => v.toLocaleString('hr-HR', { minimumFractionDigits: 1 }),
    higherIsBetter: false,
  },
];

function getSummary(areaA, areaB) {
  let aWins = 0;
  let bWins = 0;
  metrics.forEach((m) => {
    const a = areaA[m.key];
    const b = areaB[m.key];
    if (a == null || b == null) return;
    if (m.higherIsBetter) {
      if (a > b) aWins++;
      else if (b > a) bWins++;
    } else {
      if (a < b) aWins++;
      else if (b < a) bWins++;
    }
  });
  return { aWins, bWins };
}

export default function ComparisonTable({ areaA, areaB }) {
  const { aWins, bWins } = getSummary(areaA, areaB);

  let summaryText = '';
  if (aWins > bWins) {
    summaryText = `${areaA.naziv} ima bolji demografski trend od ${areaB.naziv} u ${aWins} od ${metrics.length} pokazatelja.`;
  } else if (bWins > aWins) {
    summaryText = `${areaB.naziv} ima bolji demografski trend od ${areaA.naziv} u ${bWins} od ${metrics.length} pokazatelja.`;
  } else {
    summaryText = `${areaA.naziv} i ${areaB.naziv} su izjednačeni po demografskim pokazateljima.`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <p className={styles.summaryText}>{summaryText}</p>
        <div className={styles.summaryScore}>
          <span className={styles.scoreA}>{aWins}</span>
          <span className={styles.scoreSep}>:</span>
          <span className={styles.scoreB}>{bWins}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.metricHeader}>Pokazatelj</th>
              <th className={styles.valueHeader}>{areaA.naziv}</th>
              <th className={styles.valueHeader}>{areaB.naziv}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const a = areaA[m.key];
              const b = areaB[m.key];
              const aVal = a != null ? m.format(a) : '—';
              const bVal = b != null ? m.format(b) : '—';

              let aClass = '';
              let bClass = '';
              if (a != null && b != null && a !== b) {
                if (m.higherIsBetter) {
                  aClass = a > b ? styles.better : styles.worse;
                  bClass = b > a ? styles.better : styles.worse;
                } else {
                  aClass = a < b ? styles.better : styles.worse;
                  bClass = b < a ? styles.better : styles.worse;
                }
              }

              return (
                <tr key={m.key}>
                  <td className={styles.metricCell}>{m.label}</td>
                  <td className={`${styles.valueCell} ${aClass}`}>{aVal}</td>
                  <td className={`${styles.valueCell} ${bClass}`}>{bVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
