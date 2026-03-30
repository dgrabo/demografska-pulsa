'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { formatNumber } from '@/lib/dataUtils';
import styles from './CountyMigrationChart.module.css';

Chart.register(...registerables);

export default function CountyMigrationChart({ poZupanijama }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const miniRef = useRef(null);
  const miniInstance = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState(null);

  // Sort counties by external saldo (latest year)
  const counties = Object.entries(poZupanijama)
    .map(([id, d]) => {
      const latest = d.vanjska[d.vanjska.length - 1];
      return {
        id,
        naziv: d.naziv,
        saldo: latest ? latest.saldo : 0,
        doseljeni: latest ? latest.doseljeni : 0,
        odseljeni: latest ? latest.odseljeni : 0,
        vanjska: d.vanjska,
      };
    })
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
            label: 'Neto vanjska migracija',
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
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            setSelectedCounty(counties[idx]);
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const c = counties[context.dataIndex];
                return [
                  `Saldo: ${c.saldo >= 0 ? '+' : ''}${formatNumber(c.saldo)}`,
                  `Doseljeni: ${formatNumber(c.doseljeni)}`,
                  `Odseljeni: ${formatNumber(c.odseljeni)}`,
                ];
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

  // Mini trend chart for selected county
  useEffect(() => {
    if (!miniRef.current || !selectedCounty) return;
    if (miniInstance.current) miniInstance.current.destroy();

    const years = selectedCounty.vanjska.map((v) => v.godina);
    const saldos = selectedCounty.vanjska.map((v) => v.saldo);

    const ctx = miniRef.current.getContext('2d');
    miniInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Saldo',
            data: saldos,
            borderColor: saldos[saldos.length - 1] >= 0 ? '#1d9e75' : '#e24b4a',
            backgroundColor: saldos[saldos.length - 1] >= 0
              ? 'rgba(29, 158, 117, 0.1)'
              : 'rgba(226, 75, 74, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
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
              label: (context) => `Saldo: ${context.parsed.y >= 0 ? '+' : ''}${formatNumber(context.parsed.y)}`,
            },
          },
        },
        scales: {
          y: {
            ticks: { font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (miniInstance.current) miniInstance.current.destroy();
    };
  }, [selectedCounty]);

  return (
    <div className={styles.section}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Bilanca vanjske migracije po županijama (2024.)</h3>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>

        {selectedCounty && (
          <div className={styles.detailPanel}>
            <h4 className={styles.detailTitle}>{selectedCounty.naziv}</h4>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Doseljeni</span>
                <span className={`${styles.detailValue}`} style={{ color: '#1d9e75' }}>
                  {formatNumber(selectedCounty.doseljeni)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Odseljeni</span>
                <span className={`${styles.detailValue}`} style={{ color: '#e24b4a' }}>
                  {formatNumber(selectedCounty.odseljeni)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Saldo</span>
                <span
                  className={styles.detailValue}
                  style={{ color: selectedCounty.saldo >= 0 ? '#1d9e75' : '#e24b4a' }}
                >
                  {selectedCounty.saldo >= 0 ? '+' : ''}{formatNumber(selectedCounty.saldo)}
                </span>
              </div>
            </div>
            <div className={styles.miniChartContainer}>
              <canvas ref={miniRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
