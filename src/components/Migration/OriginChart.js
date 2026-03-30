'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { formatNumber } from '@/lib/dataUtils';
import styles from './OriginChart.module.css';

Chart.register(...registerables);

const COLORS = {
  'Bosna i Hercegovina': '#2e86c1',
  'Srbija': '#c0392b',
  'Azija': '#e67e22',
  'Sjeverna Makedonija': '#8e44ad',
  'Ostale': '#95a5a6',
};

export default function OriginChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const countries = Object.keys(data);
    const allYears = data[countries[0]].map((d) => d.godina);
    const startIdx = allYears.indexOf(2011);
    const years = allYears.slice(startIdx >= 0 ? startIdx : 0);

    const datasets = countries.map((country) => {
      const series = data[country];
      const values = years.map((y) => {
        const entry = series.find((d) => d.godina === y);
        return entry ? entry.broj : 0;
      });
      return {
        label: country,
        data: values,
        backgroundColor: COLORS[country] || '#bdc3c7',
      };
    });

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 10 }, usePointStyle: true, padding: 12 },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            stacked: true,
            ticks: {
              callback: (v) => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
              font: { size: 11 },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);

  return (
    <div className={styles.section}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Tko dolazi u Hrvatsku? Imigracija po zemlji podrijetla</h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
