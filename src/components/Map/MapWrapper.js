'use client';

import dynamic from 'next/dynamic';
import styles from './Map.module.css';

const CroatiaMap = dynamic(() => import('./CroatiaMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      Učitavanje karte...
    </div>
  ),
});

export default function MapWrapper({ zupanije, selectedCountyId, onSelectCounty }) {
  return (
    <CroatiaMap
      zupanije={zupanije}
      selectedCountyId={selectedCountyId}
      onSelectCounty={onSelectCounty}
    />
  );
}
