'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { PENSION_HISTORY, NATIONAL_RATIO, EU_AVERAGE_RATIO } from '@/lib/pensionData';
import { formatRatio } from '@/lib/dataUtils';
import styles from './PensionOverview.module.css';

Chart.register(...registerables);

export default function PensionOverview() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: PENSION_HISTORY.map((d) => d.godina),
        datasets: [
          {
            label: 'Omjer radnika i umirovljenika',
            data: PENSION_HISTORY.map((d) => d.omjer),
            borderColor: '#e24b4a',
            backgroundColor: 'rgba(226, 75, 74, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#e24b4a',
            borderWidth: 2,
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
              label: (ctx) => `${ctx.parsed.y.toFixed(2)} : 1`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0.5,
            max: 3.0,
            ticks: {
              callback: (v) => `${v.toFixed(1)} : 1`,
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
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const changeSince2011 = ((NATIONAL_RATIO - 1.28) / 1.28 * 100).toFixed(1);

  return (
    <section className={styles.overview}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Trenutni omjer (Hrvatska)</span>
          <span className={styles.cardValue}>{formatRatio(NATIONAL_RATIO)}</span>
          <span className={styles.cardContext}>radnika po umirovljeniku</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Promjena od 2011.</span>
          <span className={`${styles.cardValue} ${styles.negative}`}>{changeSince2011}%</span>
          <span className={styles.cardContext}>pad omjera radnika</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Prosjek EU</span>
          <span className={`${styles.cardValue} ${styles.positive}`}>{formatRatio(EU_AVERAGE_RATIO)}</span>
          <span className={styles.cardContext}>radnika po umirovljeniku</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Kretanje omjera radnika i umirovljenika (1991. — 2021.)</h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </section>
  );
}
