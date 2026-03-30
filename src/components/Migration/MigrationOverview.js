'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { formatNumber } from '@/lib/dataUtils';
import styles from './MigrationOverview.module.css';

Chart.register(...registerables, annotationPlugin);

export default function MigrationOverview({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const trend = data.nacionalni_trend;

  // Compute summary stats
  const totalEmigSince2013 = trend
    .filter((t) => t.godina >= 2013)
    .reduce((s, t) => s + t.odseljeni, 0);
  const totalImigSince2013 = trend
    .filter((t) => t.godina >= 2013)
    .reduce((s, t) => s + t.doseljeni, 0);
  const latest = trend[trend.length - 1];

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const labels = trend.map((t) => t.godina);
    const doseljeni = trend.map((t) => t.doseljeni);
    const odseljeni = trend.map((t) => t.odseljeni);

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Doseljeni (imigracija)',
            data: doseljeni,
            borderColor: '#1d9e75',
            backgroundColor: 'rgba(29, 158, 117, 0.08)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2.5,
          },
          {
            label: 'Odseljeni (emigracija)',
            data: odseljeni,
            borderColor: '#e24b4a',
            backgroundColor: 'rgba(226, 75, 74, 0.08)',
            fill: false,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11 }, usePointStyle: true, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = formatNumber(context.parsed.y);
                return `${context.dataset.label}: ${val}`;
              },
              afterBody: (items) => {
                if (items.length >= 2) {
                  const dos = items[0].parsed.y;
                  const ods = items[1].parsed.y;
                  const saldo = dos - ods;
                  const sign = saldo >= 0 ? '+' : '';
                  return `Saldo: ${sign}${formatNumber(saldo)}`;
                }
                return '';
              },
            },
          },
          annotation: {
            annotations: {
              euLine: {
                type: 'line',
                xMin: '2013',
                xMax: '2013',
                borderColor: 'rgba(186, 117, 23, 0.6)',
                borderWidth: 2,
                borderDash: [6, 4],
                label: {
                  display: true,
                  content: 'Pristupanje EU',
                  position: 'start',
                  backgroundColor: 'rgba(186, 117, 23, 0.85)',
                  color: '#fff',
                  font: { size: 10, weight: 600 },
                  padding: { x: 6, y: 3 },
                },
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => {
                if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
                return v;
              },
              font: { size: 11 },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              maxRotation: 45,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [trend]);

  return (
    <section className={styles.overview}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Iselilo od 2013.</span>
          <span className={`${styles.cardValue} ${styles.negative}`}>
            {formatNumber(totalEmigSince2013)}
          </span>
          <span className={styles.cardContext}>ukupno odseljenih u inozemstvo</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Doselilo od 2013.</span>
          <span className={`${styles.cardValue} ${styles.positive}`}>
            {formatNumber(totalImigSince2013)}
          </span>
          <span className={styles.cardContext}>ukupno doseljenih iz inozemstva</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Saldo {latest.godina}.</span>
          <span className={`${styles.cardValue} ${latest.saldo >= 0 ? styles.positive : styles.negative}`}>
            {latest.saldo >= 0 ? '+' : ''}{formatNumber(latest.saldo)}
          </span>
          <span className={styles.cardContext}>neto migracija u posljednjoj godini</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>
          Vanjska migracija 2001. – 2024. (doseljeni i odseljeni)
        </h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </section>
  );
}
