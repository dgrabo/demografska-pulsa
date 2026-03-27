'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import AreaSelector from '../../components/CompareView/AreaSelector';
import ComparisonTable from '../../components/CompareView/ComparisonTable';
import ComparisonChart from '../../components/CompareView/ComparisonChart';
import zupanijeData from '../../../public/data/zupanije.json';
import opcineData from '../../../public/data/opcine.json';
import styles from './usporedi.module.css';

const allAreas = [
  ...zupanijeData.map((z) => ({
    ...z,
    type: 'zupanija',
    key: z.id,
    displayType: 'Županija',
  })),
  ...opcineData.map((o) => ({
    ...o,
    type: 'opcina',
    key: `${o.zupanija_id}:${o.naziv}`,
    displayType: o.tip,
  })),
];

function findArea(key) {
  if (!key) return null;
  return allAreas.find((a) => a.key === key) || null;
}

const examples = [
  { label: 'Zagreb vs Splitsko-dalmatinska', a: 'ZG', b: 'SD' },
  { label: 'Vukovarsko-srijemska vs Istarska', a: 'VK', b: 'IS' },
  { label: 'Osijek vs Zadar', a: 'OB:Osijek', b: 'ZD:Zadar' },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [areaA, setAreaA] = useState(null);
  const [areaB, setAreaB] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paramA = searchParams.get('a');
    const paramB = searchParams.get('b');
    if (paramA) setAreaA(findArea(decodeURIComponent(paramA)));
    if (paramB) setAreaB(findArea(decodeURIComponent(paramB)));
  }, [searchParams]);

  const updateUrl = useCallback(
    (a, b) => {
      const params = new URLSearchParams();
      if (a) params.set('a', a.key);
      if (b) params.set('b', b.key);
      const qs = params.toString();
      router.replace(qs ? `/usporedi?${qs}` : '/usporedi', { scroll: false });
    },
    [router]
  );

  function handleSelectA(area) {
    setAreaA(area);
    updateUrl(area, areaB);
  }

  function handleSelectB(area) {
    setAreaB(area);
    updateUrl(areaA, area);
  }

  function handleExample(ex) {
    const a = findArea(ex.a);
    const b = findArea(ex.b);
    setAreaA(a);
    setAreaB(b);
    updateUrl(a, b);
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  }

  const bothSelected = areaA && areaB;

  return (
    <>
      <h1 className={styles.title}>Usporedi dva područja</h1>
      <p className={styles.subtitle}>
        Odaberi dvije županije, grada ili općine i usporedi njihove demografske
        pokazatelje.
      </p>

      {!bothSelected && (
        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Primjeri:</span>
          {examples.map((ex) => (
            <button
              key={ex.label}
              className={styles.exampleChip}
              onClick={() => handleExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.selectors}>
        <AreaSelector
          areas={allAreas}
          selected={areaA}
          onSelect={handleSelectA}
          label="Područje A"
        />
        <span className={styles.vs}>vs</span>
        <AreaSelector
          areas={allAreas}
          selected={areaB}
          onSelect={handleSelectB}
          label="Područje B"
        />
      </div>

      {bothSelected && (
        <>
          <ComparisonTable areaA={areaA} areaB={areaB} />
          <ComparisonChart areaA={areaA} areaB={areaB} />

          <div className={styles.shareRow}>
            <button className={styles.shareBtn} onClick={handleShare}>
              {copied ? 'Kopirano!' : 'Kopiraj link za dijeljenje'}
            </button>
          </div>
        </>
      )}

      <p className={styles.source}>
        Izvor: DZS, Popis stanovništva 2021. &middot; CC BY 4.0
      </p>
    </>
  );
}

export default function UsporediPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Natrag na početnu</Link>
        <Suspense fallback={<p>Učitavanje...</p>}>
          <CompareContent />
        </Suspense>
      </main>
    </>
  );
}
