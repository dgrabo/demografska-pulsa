'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  PENSIONER_TOTALS,
  PENSION_TYPE_BREAKDOWN,
  PENSION_LAW_BREAKDOWN,
  PENSIONER_CHANGE,
} from '@/lib/pensionData';
import { formatNumber } from '@/lib/dataUtils';
import styles from './PensionOverview.module.css';

Chart.register(...registerables);

export default function PensionOverview() {
  const trendRef = useRef(null);
  const trendInstance = useRef(null);
  const typeRef = useRef(null);
  const typeInstance = useRef(null);

  // Trend chart: Dec 2021 vs Dec 2025 vs Jan 2026 (real data points)
  useEffect(() => {
    if (!trendRef.current) return;

    if (trendInstance.current) trendInstance.current.destroy();

    const periods = ['2021-12', '2025-12', '2026-01'];
    const labels = periods.map((p) => PENSIONER_TOTALS[p].label);
    const values = periods.map((p) => PENSIONER_TOTALS[p].ukupno);

    const ctx = trendRef.current.getContext('2d');
    trendInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ukupno korisnika mirovina',
            data: values,
            backgroundColor: ['#e24b4a', '#ba7517', '#ba7517'],
            borderRadius: 6,
            barThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => formatNumber(context.parsed.y) + ' korisnika',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 1200000,
            max: 1250000,
            ticks: {
              callback: (v) => (v / 1000000).toFixed(2) + 'M',
              font: { size: 11 },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      if (trendInstance.current) trendInstance.current.destroy();
    };
  }, []);

  // Doughnut: pension type breakdown (ZOMO)
  useEffect(() => {
    if (!typeRef.current) return;

    if (typeInstance.current) typeInstance.current.destroy();

    const ctx = typeRef.current.getContext('2d');
    typeInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: PENSION_TYPE_BREAKDOWN.map((t) => t.tip),
        datasets: [
          {
            data: PENSION_TYPE_BREAKDOWN.map((t) => t.broj),
            backgroundColor: ['#e24b4a', '#ba7517', '#2e86c1'],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 }, padding: 12 },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const t = PENSION_TYPE_BREAKDOWN[context.dataIndex];
                return `${t.tip}: ${formatNumber(t.broj)} (${t.postotak}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (typeInstance.current) typeInstance.current.destroy();
    };
  }, []);

  const latest = PENSIONER_TOTALS['2026-01'];

  return (
    <section className={styles.overview}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Ukupno umirovljenika (sij. 2026.)</span>
          <span className={styles.cardValue}>{formatNumber(latest.ukupno)}</span>
          <span className={styles.cardContext}>svi zakoni (ZOMO + ZOHBDR + DVO + HVO)</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Promjena od prosinca 2021.</span>
          <span className={`${styles.cardValue} ${styles.positive}`}>
            {formatNumber(PENSIONER_CHANGE.apsolutno)}
          </span>
          <span className={styles.cardContext}>{PENSIONER_CHANGE.postotak.toFixed(2)}% korisnika mirovina</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>ZOMO (redovne mirovine)</span>
          <span className={styles.cardValue}>{formatNumber(latest.zomo)}</span>
          <span className={styles.cardContext}>
            {(latest.zomo / latest.ukupno * 100).toFixed(1)}% svih korisnika
          </span>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>
            Broj korisnika mirovina (HZMO podatci)
          </h3>
          <div className={styles.chartContainer}>
            <canvas ref={trendRef} />
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>
            Struktura mirovina po vrsti — ZOMO (sij. 2026.)
          </h3>
          <div className={styles.chartContainerSmall}>
            <canvas ref={typeRef} />
          </div>
          <div className={styles.typeDetails}>
            {PENSION_LAW_BREAKDOWN.map((l) => (
              <span key={l.zakon}>{l.zakon}: {formatNumber(l.broj)}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
