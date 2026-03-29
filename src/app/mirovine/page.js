'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import PensionOverview from '@/components/Pension/PensionOverview';
import CountyRatioChart from '@/components/Pension/CountyRatioChart';
import PensionCalculator from '@/components/Pension/PensionCalculator';
import styles from './mirovine.module.css';

export default function MirovinePage() {
  const [zupanije, setZupanije] = useState([]);

  useEffect(() => {
    fetch('/data/zupanije.json')
      .then((res) => res.json())
      .then(setZupanije)
      .catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Natrag na početnu</Link>
        <h1 className={styles.pageTitle}>Održivost mirovinskog sustava</h1>
        <p className={styles.pageSubtitle}>
          Koliko radnika financira jednog umirovljenika u vašoj županiji — i što to
          znači za budućnost?
        </p>

        <PensionOverview />

        {zupanije.length > 0 && (
          <>
            <CountyRatioChart zupanije={zupanije} />
            <PensionCalculator zupanije={zupanije} />
          </>
        )}

        <p className={styles.source}>
          Izvori: HZMO godišnje izvješće &middot; DZS Popis stanovništva 2021. &middot; Eurostat &middot; CC BY 4.0
        </p>
      </main>
    </div>
  );
}
