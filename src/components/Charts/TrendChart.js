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
import trendData from '../../../public/data/trend.json';
import styles from './Charts.module.css';
import { correctBorderRadius } from 'framer-motion';

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

const popisi = trendData.popisi;
const labels = popisi.map((p) => p.godina);
const values = popisi.map((p) => p.stanovnistvo);

// Pre-compute % change from previous census for tooltips
const pctChanges = values.map((v, i) =>
  i === 0 ? null : (((v - values[i - 1]) / values[i - 1]) * 100).toFixed(2)
);

const data = {
  labels,
  datasets: [
    {
      label: 'Stanovništvo',
      data: values,
      borderColor: '#e24b4a',
      backgroundColor: 'rgba(226, 75, 74, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: '#e24b4a',
      pointHoverRadius: 7,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label(ctx) {
          const val = ctx.raw.toLocaleString('hr-HR');
          const idx = ctx.dataIndex;
          const change = pctChanges[idx];
          if (change !== null) {
            const sign = change > 0 ? '+' : '';
            return `${val} (${sign}${change}%)`;
          }
          return val;
        },
      },
    },
    annotation: {
      annotations: {
        warBox: {
          type: 'box',
          xMin: 4,
          xMax: 4.4,
          backgroundColor: 'rgba(226, 75, 74, 0.08)',
          borderColor: 'rgba(226, 75, 74, 0.3)',
          borderWidth: 1,
        },
        warLabel: {
          type: 'label',
          xValue: 4.2,
          yValue: 3540000,
          content: ['Domovinski', 'rat (1991-1995)'],
          backgroundColor: 'rgba(0,0,0,0.55)',
          color: '#fff',
          font: { size: 10 },
          padding: { x: 8, y: 5 },
          textAlign: 'center',
          borderRadius: 6,
        },
        eu: {
          type: 'line',
          // 2013 = 2/10 between 2011(index 6) and 2021(index 7) = 6.2
          xMin: 6.2,
          xMax: 6.2,
          borderColor: 'rgba(0, 0, 0, 0.35)',
          borderWidth: 1.5,
          borderDash: [6, 4],
          label: {
            display: true,
            content: 'Ulazak u EU (2013)',
            position: 'start',
            backgroundColor: 'rgba(0,0,0,0.6)',
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
      min: 3400000,
      max: 5000000,
      ticks: {
        callback(value) {
          return (value / 1000000).toFixed(1).replace('.', ',') + 'M';
        },
        stepSize: 500000,
      },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    x: {
      grid: { display: false },
    },
  },
};

export default function TrendChart() {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Stanovništvo Hrvatske (1953–2021)</h3>
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
      </div>
      <p className={styles.chartSource}>
        Izvor: DZS, Popisi stanovništva &middot; CC BY 4.0
      </p>
    </div>
  );
}
