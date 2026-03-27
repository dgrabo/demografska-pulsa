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
import styles from './ComparisonChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ComparisonChart({ areaA, areaB }) {
  const data = {
    labels: ['2011.', '2021.'],
    datasets: [
      {
        label: areaA.naziv,
        data: [areaA.stanovnistvo_2011, areaA.stanovnistvo_2021],
        backgroundColor: '#e24b4a',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
      {
        label: areaB.naziv,
        data: [areaB.stanovnistvo_2011, areaB.stanovnistvo_2021],
        backgroundColor: '#1d9e75',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 3,
          useBorderRadius: true,
          font: { size: 12 },
          color: '#1a1a18',
        },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            return `${ctx.dataset.label}: ${ctx.raw.toLocaleString('hr-HR')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1).replace('.', ',') + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'k';
            }
            return value;
          },
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Usporedba stanovništva</h3>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
      <p className={styles.chartSource}>
        Izvor: DZS, Popisi stanovništva 2011. i 2021. &middot; CC BY 4.0
      </p>
    </div>
  );
}
