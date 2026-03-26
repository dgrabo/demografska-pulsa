'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import StatCard from '@/components/StatCard/StatCard';
import MapWrapper from '@/components/Map/MapWrapper';
import CountyPanel from '@/components/CountyPanel/CountyPanel';
import TrendChart from '@/components/Charts/TrendChart';
import PyramidChart from '@/components/Charts/PyramidChart';
import chartStyles from '@/components/Charts/Charts.module.css';
import OpcineList from '@/components/OpcineList/OpcineList';
import zupanije from '../../../public/data/zupanije.json';
import opcine from '../../../public/data/opcine.json';
import styles from './karta.module.css';

// Compute national totals
const ukupno2021 = zupanije.reduce((s, z) => s + z.stanovnistvo_2021, 0);
const ukupno2011 = zupanije.reduce((s, z) => s + z.stanovnistvo_2011, 0);
const padApsolutni = ukupno2021 - ukupno2011;
const padPostotak = ((padApsolutni / ukupno2011) * 100).toFixed(2);
const udio65 = (
  zupanije.reduce((s, z) => s + z.stari_65plus_postotak * z.stanovnistvo_2021, 0) / ukupno2021
).toFixed(1);
const udio014 = (
  zupanije.reduce((s, z) => s + z.mladi_0_14_postotak * z.stanovnistvo_2021, 0) / ukupno2021
).toFixed(1);

function formatNum(n) {
  return n.toLocaleString('hr-HR');
}

export default function KartaPage() {
  const [selectedCountyId, setSelectedCountyId] = useState(null);
  const [showOpcine, setShowOpcine] = useState(false);

  const selectedCounty = selectedCountyId
    ? zupanije.find((z) => z.id === selectedCountyId)
    : null;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Interaktivna karta</h1>
        <p className={styles.pageSubtitle}>
          Kliknite na županiju za detaljne podatke o promjeni stanovništva.
        </p>

        <div className={styles.statsRow}>
          <StatCard
            label="Stanovništvo 2021."
            value={formatNum(ukupno2021)}
          />
          <StatCard
            label="Pad od 2011."
            value={`${padPostotak}%`}
            negative
          />
          <StatCard
            label="Udio 65+"
            value={`${udio65}%`}
            negative
          />
          <StatCard
            label="Udio 0–14"
            value={`${udio014}%`}
          />
        </div>

        <div className={styles.mapLayout}>
          <MapWrapper
            zupanije={zupanije}
            selectedCountyId={selectedCountyId}
            onSelectCounty={setSelectedCountyId}
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
