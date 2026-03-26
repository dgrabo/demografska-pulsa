'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import ProjectionChart from '@/components/Charts/ProjectionChart';
import ScenarioSelector from '@/components/Charts/ScenarioSelector';
import ScenarioCards from '@/components/Charts/ScenarioCards';
import { SCENARIOS } from '@/lib/projectionData';
import styles from './projekcije.module.css';

export default function ProjekcijeePage() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Natrag na početnu</Link>
        <h1 className={styles.pageTitle}>Projekcije do 2050.</h1>
        <p className={styles.pageSubtitle}>
          Četiri scenarija budućeg kretanja stanovništva prema Strategiji demografske
          revitalizacije.
        </p>

        <ScenarioSelector
          scenarios={SCENARIOS}
          selectedScenario={selectedScenario}
          onSelect={setSelectedScenario}
        />

        <ProjectionChart selectedScenario={selectedScenario} />

        <ScenarioCards selectedScenario={selectedScenario} />

        <p className={styles.source}>
          Izvor: Državni zavod za statistiku &middot; Narodne novine 36/2024 &middot; CC BY 4.0
        </p>
      </main>
    </div>
  );
}
