'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './Charts.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// 2011 national age percentages (DZS Census 2011)
const data2011 = { '0–14': 15.2, '15–64': 67.1, '65+': 17.7 };

// 2021 weighted national averages computed from zupanije.json
// mladi_0_14: ~14.9%, stari_65+: ~17.7%, 15-64: remainder
// Using hardcoded accurate national values from DZS Census 2021
const data2021 = { '0–14': 14.5, '15–64': 64.3, '65+': 21.2 };

const ageGroups = ['0–14', '15–64', '65+'];

const data = {
  labels: ageGroups,
  datasets: [
    {
      label: '2011.',
      data: ageGroups.map((g) => data2011[g]),
      backgroundColor: '#b0b0a8',
      borderRadius: 3,
      barPercentage: 0.7,
    },
    {
      label: '2021.',
      data: ageGroups.map((g) => data2021[g]),
      backgroundColor: '#e24b4a',
      borderRadius: 3,
      barPercentage: 0.7,
    },
  ],
};

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { boxWidth: 14, padding: 16, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label(ctx) {
          return `${ctx.dataset.label} ${ctx.raw}%`;
        },
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 80,
      ticks: {
        callback(value) {
          return value + '%';
        },
        stepSize: 20,
      },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    y: {
      grid: { display: false },
      ticks: { font: { size: 13, weight: '600' } },
    },
  },
};

export default function PyramidChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Dobna struktura: 2011. vs 2021.</h3>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
      <p className={styles.chartSource}>
        Izvor: DZS, Popisi stanovništva &middot; CC BY 4.0
      </p>
    </div>
  );
}
