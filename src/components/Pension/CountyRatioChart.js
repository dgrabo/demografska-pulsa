'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { formatNumber } from '@/lib/dataUtils';
import styles from './CountyRatioChart.module.css';

Chart.register(...registerables);

function getBarColor(value) {
  if (value >= 0.55) return '#e24b4a';
  if (value >= 0.50) return '#ba7517';
  return '#1d9e75';
}

export default function CountyRatioChart({ zupanije }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedCounty, setSelectedCounty] = useState(null);

  const sorted = useMemo(
    () => [...zupanije].sort(
      (a, b) => b.koeficijent_ovisnosti - a.koeficijent_ovisnosti
    ),
    [zupanije]
  );

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = sorted.map((z) => z.naziv);
    const values = sorted.map((z) => z.koeficijent_ovisnosti);
    const colors = values.map(getBarColor);

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Koeficijent ovisnosti',
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
              label: (ctx) => `Koef. ovisnosti: ${ctx.parsed.x.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 0.75,
            ticks: {
              callback: (v) => v.toFixed(2),
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

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Koeficijent dobne ovisnosti po županijama</h2>
      <p className={styles.subtitle}>
        Omjer uzdržavanog (0-14 i 65+) i radno sposobnog (15-64) stanovništva.
        Kliknite na županiju za detalje. Crveno: &ge;0,55 | Narančasto: 0,50-0,55 | Zeleno: &lt;0,50
      </p>

      <div className={styles.layout}>
        <div className={styles.chartContainer}>
          <canvas ref={chartRef} />
        </div>

        {selectedCounty && (
          <div className={styles.detail}>
            <h3 className={styles.detailName}>{selectedCounty.naziv}</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Koef. ovisnosti</span>
                <span
                  className={styles.detailValue}
                  style={{ color: getBarColor(selectedCounty.koeficijent_ovisnosti) }}
                >
                  {selectedCounty.koeficijent_ovisnosti.toFixed(2)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Stanovništvo 2021.</span>
                <span className={styles.detailValue}>
                  {formatNumber(selectedCounty.stanovnistvo_2021)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Udio 65+</span>
                <span className={styles.detailValue}>
                  {selectedCounty.stari_65plus_postotak}%
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Udio 0-14</span>
                <span className={styles.detailValue}>
                  {selectedCounty.mladi_0_14_postotak}%
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Indeks starenja</span>
                <span className={styles.detailValue}>
                  {selectedCounty.indeks_starenja}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Pad stanovništva</span>
                <span className={styles.detailValue} style={{ color: '#e24b4a' }}>
                  {selectedCounty.pad_postotak.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={styles.detailContext}>
              {selectedCounty.koeficijent_ovisnosti >= 0.55
                ? `Više od 55% stanovništva čine uzdržavane dobne skupine (mladi i stariji). To znači ogroman pritisak na radno sposobno stanovništvo i mirovinski sustav.`
                : selectedCounty.koeficijent_ovisnosti >= 0.50
                  ? `Oko polovice stanovništva pripada uzdržavanim dobnim skupinama. Udio starijih raste, što povećava opterećenje mirovinskog sustava.`
                  : `Relativno povoljniji omjer, ali i dalje pod pritiskom demografskih trendova. Udio radno sposobnih opada.`}
            </p>
            <p className={styles.detailNote}>
              Izvor: DZS, Popis stanovništva 2021.
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
