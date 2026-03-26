'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { SCENARIOS, CURRENT_POPULATION } from '@/lib/projectionData';
import chartStyles from './Charts.module.css';
import styles from './Projections.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  annotationPlugin
);

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const labels = [2021, 2030, 2040, 2050];

export default function ProjectionChart({ selectedScenario }) {
  const datasets = SCENARIOS.map((s) => {
    const isSelected = selectedScenario === s.id;
    const isFaded = selectedScenario !== null && !isSelected;

    return {
      label: s.shortName,
      data: s.data.map((d) => d.stanovnistvo),
      borderColor: isFaded ? hexToRgba(s.color, 0.15) : s.color,
      backgroundColor: 'transparent',
      borderWidth: isSelected ? 3 : isFaded ? 1.5 : 2,
      pointRadius: isSelected ? 5 : isFaded ? 2 : 4,
      pointBackgroundColor: isFaded ? hexToRgba(s.color, 0.15) : s.color,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: false,
    };
  });

  // Shaded area between worst (S1) and best (S4) scenarios
  datasets.push({
    label: '_shadedArea',
    data: SCENARIOS[3].data.map((d) => d.stanovnistvo),
    borderColor: 'transparent',
    backgroundColor: hexToRgba('#1d9e75', 0.06),
    borderWidth: 0,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: {
      target: 0, // fill toward dataset index 0 (S1)
      above: hexToRgba('#1d9e75', 0.06),
      below: 'transparent',
    },
    tension: 0.3,
  });

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          filter(item) {
            return item.text !== '_shadedArea';
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.dataset.label === '_shadedArea') return null;
            const val = ctx.raw.toLocaleString('hr-HR');
            return `${ctx.dataset.label}: ${val}`;
          },
        },
      },
      annotation: {
        annotations: {
          currentLevel: {
            type: 'line',
            yMin: CURRENT_POPULATION,
            yMax: CURRENT_POPULATION,
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Trenutna razina (3,87M)',
              position: 'end',
              backgroundColor: 'rgba(0,0,0,0.55)',
              color: '#fff',
              font: { size: 11 },
              padding: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        min: 2800000,
        max: 4100000,
        ticks: {
          callback(value) {
            return (value / 1000000).toFixed(1).replace('.', ',') + 'M';
          },
          stepSize: 200000,
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className={chartStyles.chartCard}>
      <h3 className={chartStyles.chartTitle}>Projekcije stanovništva do 2050.</h3>
      <div className={styles.projectionChartContainer}>
        <Line data={data} options={options} />
      </div>
      <p className={chartStyles.chartSource}>
        Izvor: Strategija demografske revitalizacije, Narodne novine 36/2024 &middot; CC BY 4.0
      </p>
    </div>
  );
}
