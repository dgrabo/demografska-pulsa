'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Layout/Header';
import StatCard from '@/components/StatCard/StatCard';
import MapWrapper from '@/components/Map/MapWrapper';
import CountyPanel from '@/components/CountyPanel/CountyPanel';
import TrendChart from '@/components/Charts/TrendChart';
import PyramidChart from '@/components/Charts/PyramidChart';
import chartStyles from '@/components/Charts/Charts.module.css';
import OpcineList from '@/components/OpcineList/OpcineList';
import SettlementSearch from '@/components/SettlementSearch/SettlementSearch';
import AbandonedOverlay from '@/components/AbandonedOverlay/AbandonedOverlay';
import MigrationToggle from '@/components/MigrationToggle/MigrationToggle';
import { countAbandonedByCounty } from '@/lib/settlementUtils';
import zupanije from '../../public/data/zupanije.json';
import opcine from '../../public/data/opcine.json';
import naselja from '../../public/data/naselja.json';
import migracijeData from '../../public/data/migracije.json';
import styles from './page.module.css';

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

const statCards = [
  {
    label: 'Stanovništvo 2021.',
    value: formatNum(ukupno2021),
    description: 'Prema Popisu stanovništva 2021.',
  },
  {
    label: 'Pad od 2011.',
    value: `${formatNum(padApsolutni)} (${padPostotak}%)`,
    description: 'Apsolutni i relativni pad u 10 godina',
    negative: true,
  },
  {
    label: 'Udio 65+',
    value: `${udio65}%`,
    description: 'Starije stanovništvo (65 i više godina)',
    negative: true,
  },
  {
    label: 'Udio 0-14',
    value: `${udio014}%`,
    description: 'Mlado stanovništvo (0 do 14 godina)',
  },
];

export default function Home() {
  const [selectedCountyId, setSelectedCountyId] = useState(null);
  const [showOpcine, setShowOpcine] = useState(false);
  const [showAbandoned, setShowAbandoned] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  const selectedCounty = selectedCountyId
    ? zupanije.find((z) => z.id === selectedCountyId)
    : null;

  const abandoned = useMemo(() => countAbandonedByCounty(naselja), []);

  const migrationByCounty = useMemo(() => {
    const m = {};
    const pz = migracijeData.po_zupanijama;
    for (const [id, d] of Object.entries(pz)) {
      const latest = d.vanjska[d.vanjska.length - 1];
      m[id] = {
        saldo: d.ukupni_saldo_zadnja_godina,
        doseljeni: latest ? latest.doseljeni : 0,
        odseljeni: latest ? latest.odseljeni : 0,
      };
    }
    return m;
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Hrvatska nestaje.{' '}
            <span className={styles.accent}>Pogledaj koliko brzo.</span>
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            413.000 manje Hrvata u 10 godina. Svaka županija bilježi pad.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SettlementSearch naselja={naselja} />
          </motion.div>
        </section>

        <div className={styles.statsGrid}>
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.15 }}
            >
              <StatCard
                label={card.label}
                value={card.value}
                description={card.description}
                negative={card.negative}
              />
            </motion.div>
          ))}
        </div>

        <AbandonedOverlay
          totalAbandoned={abandoned.total}
          isActive={showAbandoned}
          onToggle={() => setShowAbandoned((prev) => !prev)}
        />

        <MigrationToggle
          isActive={showMigration}
          onToggle={() => setShowMigration((prev) => !prev)}
        />

        <div className={styles.mapLayout}>
          <MapWrapper
            zupanije={zupanije}
            selectedCountyId={selectedCountyId}
            onSelectCounty={setSelectedCountyId}
            abandonedByCounty={showAbandoned ? abandoned.counts : null}
            migrationByCounty={showMigration ? migrationByCounty : null}
          />
          <CountyPanel
            county={selectedCounty}
            onClose={() => setSelectedCountyId(null)}
            onViewMunicipalities={selectedCounty ? () => setShowOpcine(true) : undefined}
          />
        </div>

        <section className={chartStyles.chartsSection}>
          <h2 className={chartStyles.chartsSectionTitle}>Trendovi i struktura</h2>
          <div className={chartStyles.chartsGrid}>
            <TrendChart />
            <PyramidChart />
          </div>
        </section>

        {showOpcine && selectedCounty && (
          <OpcineList
            countyId={selectedCounty.id}
            countyName={selectedCounty.naziv}
            opcine={opcine}
            onClose={() => setShowOpcine(false)}
          />
        )}

        <p className={styles.source}>
          Izvor: Državni zavod za statistiku, Popis stanovništva 2021. &middot; CC BY 4.0
        </p>
      </main>
    </div>
  );
}
