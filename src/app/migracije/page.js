'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import MigrationOverview from '@/components/Migration/MigrationOverview';
import DestinationChart from '@/components/Migration/DestinationChart';
import OriginChart from '@/components/Migration/OriginChart';
import CountyMigrationChart from '@/components/Migration/CountyMigrationChart';
import InternalMigrationChart from '@/components/Migration/InternalMigrationChart';
import styles from './migracije.module.css';

export default function MigracijePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/migracije.json')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p>Učitavanje podataka o migracijama...</p>
        </main>
      </div>
    );
  }

  // Compute context stats
  const trend = data.nacionalni_trend;
  const totalEmigSince2013 = trend
    .filter((t) => t.godina >= 2013)
    .reduce((s, t) => s + t.odseljeni, 0);

  // Find the nearest city comparison
  const cityComparison = totalEmigSince2013 > 400000
    ? 'više od cjelokupnog stanovništva Splita i Rijeke zajedno'
    : 'koliko žitelja broji grad Split';

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Natrag na početnu</Link>
        <h1 className={styles.pageTitle}>Migracije — Tko odlazi, tko dolazi?</h1>
        <p className={styles.pageSubtitle}>
          Cjelovita slika migracijskih kretanja: iseljavanje Hrvata, useljavanje stranaca
          i unutarnja preraspodjela stanovništva među županijama.
        </p>

        {/* Section 1: National overview */}
        <h2 className={styles.sectionTitle}>Pregled na nacionalnoj razini</h2>
        <MigrationOverview data={data} />

        {/* Section 2: Emigration */}
        <h2 className={styles.sectionTitle}>Emigracija — Kamo Hrvati odlaze?</h2>
        <DestinationChart data={data.drzave_emigracija} />
        <div className={styles.callout}>
          Od pristupanja EU 2013. godine, ukupno je {totalEmigSince2013.toLocaleString('hr-HR')} osoba
          iselilo iz Hrvatske — to je {cityComparison}.
          Njemačka je daleko najpopularnije odredište, iza nje slijede Austrija i Irska.
        </div>

        {/* Section 3: Immigration */}
        <h2 className={styles.sectionTitle}>Imigracija — Tko dolazi u Hrvatsku?</h2>
        <OriginChart data={data.drzave_imigracija} />
        <div className={`${styles.callout} ${styles.calloutPositive}`}>
          Hrvatska sve više ovisi o useljavanju kako bi nadoknadila iseljavanje.
          Bosna i Hercegovina je tradicionalno najveći izvor doseljenika, dok u
          posljednjim godinama snažno raste dolazak radnika iz Azije (Nepal, Indija, Filipini)
          — uglavnom u građevini, turizmu i njezi.
        </div>

        {/* Section 4: County external balance */}
        <h2 className={styles.sectionTitle}>Bilanca po županijama — Vanjska migracija</h2>
        <CountyMigrationChart poZupanijama={data.po_zupanijama} />

        {/* Section 5: Internal migration */}
        <h2 className={styles.sectionTitle}>Unutarnja migracija — Tko kome uzima stanovnike?</h2>
        <InternalMigrationChart poZupanijama={data.po_zupanijama} />
        <div className={styles.callout}>
          Zagreb i obala privlače — slavonske županije gube. Unutarnja migracija
          dodatno produbljuje regionalne nejednakosti: Vukovarsko-srijemska, Brodsko-posavska
          i Osječko-baranjska bilježe najveći odljev prema drugim županijama.
        </div>

        <p className={styles.source}>
          Izvor: DZS — Migracija stanovništva RH 2001.–2024., godišnja priopćenja
          (stan-2021 do stan-2025) &middot; CC BY 4.0
        </p>
      </main>
    </div>
  );
}
