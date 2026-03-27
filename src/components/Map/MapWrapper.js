'use client';

import dynamic from 'next/dynamic';
import styles from './Map.module.css';

const CroatiaMap = dynamic(() => import('./CroatiaMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <div className={styles.spinner} />
      <span>Učitavanje karte...</span>
    </div>
  ),
});

export default function MapWrapper({ zupanije, selectedCountyId, onSelectCounty, abandonedByCounty, schoolByCounty, healthByCounty }) {
  return (
    <CroatiaMap
      zupanije={zupanije}
      selectedCountyId={selectedCountyId}
      onSelectCounty={onSelectCounty}
      abandonedByCounty={abandonedByCounty}
      schoolByCounty={schoolByCounty}
      healthByCounty={healthByCounty}
    />
  );
}
