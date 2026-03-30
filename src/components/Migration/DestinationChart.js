'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { formatNumber } from '@/lib/dataUtils';
import styles from './DestinationChart.module.css';

Chart.register(...registerables);

const COLORS = {
  'Njemačka': '#1a5276',
  'Austrija': '#c0392b',
  'Irska': '#27ae60',
  'Švicarska': '#8e44ad',
  'Švedska': '#2980b9',
  'Slovenija': '#d4ac0d',
  'Ostale': '#95a5a6',
};

export default function DestinationChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const countries = Object.keys(data);
    // Use years from 2011 onward to show EU accession effect
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
        <h3 className={styles.chartTitle}>Kamo Hrvati odlaze? Emigracija po odredišnim zemljama</h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
