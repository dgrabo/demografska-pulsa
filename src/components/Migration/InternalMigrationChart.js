'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { formatNumber } from '@/lib/dataUtils';
import styles from './InternalMigrationChart.module.css';

Chart.register(...registerables);

export default function InternalMigrationChart({ poZupanijama }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const counties = Object.entries(poZupanijama)
    .map(([id, d]) => ({
      id,
      naziv: d.naziv,
      saldo: d.unutarnja_saldo,
    }))
    .sort((a, b) => b.saldo - a.saldo);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const labels = counties.map((c) => c.naziv);
    const values = counties.map((c) => c.saldo);
    const bgColors = values.map((v) => (v >= 0 ? 'rgba(29, 158, 117, 0.75)' : 'rgba(226, 75, 74, 0.75)'));
    const borderColors = values.map((v) => (v >= 0 ? '#1d9e75' : '#e24b4a'));

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Saldo unutarnje migracije',
            data: values,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed.x;
                return `Saldo: ${val >= 0 ? '+' : ''}${formatNumber(val)}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (v) => {
                if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'k';
                return v;
              },
              font: { size: 10 },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          y: {
            ticks: { font: { size: 10 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [counties]);

  return (
    <div className={styles.section}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>
          Unutarnja migracija — saldo među županijama (2024.)
        </h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
