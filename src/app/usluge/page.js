'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import MapWrapper from '@/components/Map/MapWrapper';
import CountyPanel from '@/components/CountyPanel/CountyPanel';
import ServiceToggles from '@/components/ServiceToggles/ServiceToggles';
import ServiceRiskList from '@/components/ServiceRiskList/ServiceRiskList';
import zupanije from '../../../public/data/zupanije.json';
import uslugeData from '../../../public/data/usluge.json';
import styles from './usluge.module.css';

export default function UslugePage() {
  const [selectedCountyId, setSelectedCountyId] = useState(null);
  const [showSchoolDeserts, setShowSchoolDeserts] = useState(true);
  const [showHealthcareDeserts, setShowHealthcareDeserts] = useState(false);

  const selectedCounty = selectedCountyId
    ? zupanije.find((z) => z.id === selectedCountyId)
    : null;

  const zupanijeMap = useMemo(() => {
    const m = {};
    zupanije.forEach((z) => { m[z.id] = z; });
    return m;
  }, []);

  const schoolByCounty = useMemo(() => {
    const m = {};
    uslugeData.forEach((d) => { m[d.id] = d; });
    return m;
  }, []);

  const healthByCounty = useMemo(() => {
    const m = {};
    uslugeData.forEach((d) => { m[d.id] = d; });
    return m;
  }, []);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Natrag na početnu</Link>
        <h1 className={styles.title}>Školske i zdravstvene pustinje</h1>
        <p className={styles.subtitle}>
          Gdje nestaju učenici i liječnici? Pregledajte koje županije gube škole i
          imaju opterećenu primarnu zdravstvenu zaštitu.
        </p>

        <ServiceToggles
          schoolData={uslugeData}
          healthData={uslugeData}
          showSchool={showSchoolDeserts}
          showHealth={showHealthcareDeserts}
          onToggleSchool={() => setShowSchoolDeserts((prev) => !prev)}
          onToggleHealth={() => setShowHealthcareDeserts((prev) => !prev)}
        />

        <div className={styles.mapLayout}>
          <MapWrapper
            zupanije={zupanije}
            selectedCountyId={selectedCountyId}
            onSelectCounty={setSelectedCountyId}
            schoolByCounty={showSchoolDeserts ? schoolByCounty : null}
            healthByCounty={showHealthcareDeserts ? healthByCounty : null}
          />
          <CountyPanel
            county={selectedCounty}
            onClose={() => setSelectedCountyId(null)}
          />
        </div>

        <ServiceRiskList uslugeData={uslugeData} zupanijeMap={zupanijeMap} />

        <p className={styles.source}>
          Izvor: DZS (Popis 2021., obrazovna statistika 2024./2025.), HZZO (opća praksa, 02/2026) &middot; CC BY 4.0
        </p>
      </main>
    </>
  );
}
