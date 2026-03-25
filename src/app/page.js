import Header from '@/components/Layout/Header';
import StatCard from '@/components/StatCard/StatCard';
import styles from './page.module.css';
import zupanije from '../../public/data/zupanije.json';

// Compute national totals from county data
const ukupno2021 = zupanije.reduce((s, z) => s + z.stanovnistvo_2021, 0);
const ukupno2011 = zupanije.reduce((s, z) => s + z.stanovnistvo_2011, 0);
const padApsolutni = ukupno2021 - ukupno2011;
const padPostotak = ((padApsolutni / ukupno2011) * 100).toFixed(2);

// Weighted averages for age groups
const udio65 = (
  zupanije.reduce((s, z) => s + z.stari_65plus_postotak * z.stanovnistvo_2021, 0) / ukupno2021
).toFixed(1);
const udio014 = (
  zupanije.reduce((s, z) => s + z.mladi_0_14_postotak * z.stanovnistvo_2021, 0) / ukupno2021
).toFixed(1);

function formatNum(n) {
  return n.toLocaleString('hr-HR');
}

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.hero}>
        <h1 className={styles.title}>
          Demografska<span className={styles.accent}>Pulsa</span>
        </h1>
        <p className={styles.subtitle}>
          Interaktivna vizualizacija demografskih podataka Republike Hrvatske.
          Popis stanovništva 2021., trendovi i projekcije.
        </p>

        <div className={styles.statsGrid}>
          <StatCard
            label="Stanovništvo 2021."
            value={formatNum(ukupno2021)}
            description="Prema Popisu stanovništva 2021."
          />
          <StatCard
            label="Pad od 2011."
            value={`${formatNum(padApsolutni)} (${padPostotak}%)`}
            description="Apsolutni i relativni pad u 10 godina"
            negative
          />
          <StatCard
            label="Udio 65+"
            value={`${udio65}%`}
            description="Starije stanovništvo (65 i više godina)"
            negative
          />
          <StatCard
            label="Udio 0–14"
            value={`${udio014}%`}
            description="Mlado stanovništvo (0 do 14 godina)"
          />
        </div>

        <p className={styles.source}>
          Izvor: Državni zavod za statistiku, Popis stanovništva 2021. &middot; CC BY 4.0
        </p>
      </main>
    </div>
  );
}
