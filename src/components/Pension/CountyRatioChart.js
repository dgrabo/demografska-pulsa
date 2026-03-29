'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { getCountyTrend } from '@/lib/pensionData';
import { formatRatio } from '@/lib/dataUtils';
import styles from './CountyRatioChart.module.css';

Chart.register(...registerables);

function getBarColor(value) {
  if (value >= 1.3) return '#1d9e75';
  if (value >= 1.0) return '#ba7517';
  return '#e24b4a';
}

export default function CountyRatioChart({ zupanije }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState(null);

  const sorted = useMemo(
    () => [...zupanije].sort(
      (a, b) => a.omjer_radnici_umirovljenici - b.omjer_radnici_umirovljenici
    ),
    [zupanije]
  );

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = sorted.map((z) => z.naziv);
    const values = sorted.map((z) => z.omjer_radnici_umirovljenici);
    const colors = values.map(getBarColor);

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Omjer radnika i umirovljenika',
            data: values,
            backgroundColor: colors,
            borderRadius: 4,
            barThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            setSelectedCounty(sorted[idx]);
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.x.toFixed(2)} : 1`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 1.8,
            ticks: {
              callback: (v) => `${v.toFixed(1)}`,
              font: { size: 11 },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          y: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [sorted]);

  const trend = selectedCounty
    ? getCountyTrend(selectedCounty.omjer_radnici_umirovljenici)
    : null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Omjer radnika i umirovljenika po županijama</h2>
      <p className={styles.subtitle}>
        Kliknite na županiju za detalje. Zeleno: &ge;1,3 | Narančasto: 1,0–1,3 | Crveno: &lt;1,0
      </p>

      <div className={styles.layout}>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>

        {selectedCounty && trend && (
          <div className={styles.detail}>
            <h3 className={styles.detailName}>{selectedCounty.naziv}</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Trenutni omjer</span>
                <span
                  className={styles.detailValue}
                  style={{ color: getBarColor(selectedCounty.omjer_radnici_umirovljenici) }}
                >
                  {formatRatio(selectedCounty.omjer_radnici_umirovljenici)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Omjer 2011.</span>
                <span className={styles.detailValue}>{formatRatio(trend.ratio2011)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Projekcija 2035.</span>
                <span
                  className={styles.detailValue}
                  style={{ color: getBarColor(trend.ratio2035) }}
                >
                  {formatRatio(trend.ratio2035)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Koef. ovisnosti</span>
                <span className={styles.detailValue}>
                  {selectedCounty.koeficijent_ovisnosti.toFixed(2)}
                </span>
              </div>
            </div>
            <p className={styles.detailContext}>
              {trend.ratio2035 < 0.8
                ? `Prema trenutnim trendovima, do 2035. u ovoj će županiji manje od 0,8 radnika financirati svakog umirovljenika — sustav postaje neodrživ bez reformi.`
                : trend.ratio2035 < 1.0
                  ? `Do 2035. manje od jednog radnika po umirovljeniku — značajan pritisak na mirovinski sustav.`
                  : `Omjer ostaje iznad 1:1, ali nastavlja padati. Potrebne su mjere za zadržavanje radne snage.`}
            </p>
            <button
              className={styles.detailClose}
              onClick={() => setSelectedCounty(null)}
            >
              Zatvori
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
