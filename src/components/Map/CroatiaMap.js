'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import styles from './Map.module.css';

// Fix Leaflet default icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color scale based on population decline percentage
function getColor(padPostotak) {
  if (padPostotak > -5) return '#fef0f0';
  if (padPostotak > -10) return '#f09595';
  if (padPostotak > -15) return '#e24b4a';
  if (padPostotak > -20) return '#a32d2d';
  return '#501313';
}

const LEGEND_ITEMS = [
  { color: '#fef0f0', label: 'Pad < 5%' },
  { color: '#f09595', label: '5% – 10%' },
  { color: '#e24b4a', label: '10% – 15%' },
  { color: '#a32d2d', label: '15% – 20%' },
  { color: '#501313', label: 'Pad > 20%' },
];

const CROATIA_CENTER = [44.5, 16.4];
const CROATIA_ZOOM = 7;

export default function CroatiaMap({ zupanije, selectedCountyId, onSelectCounty }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const geoJsonRef = useRef(null);

  // Build lookup map from zupanije data
  const dataMap = useRef({});
  useEffect(() => {
    const map = {};
    zupanije.forEach((z) => {
      map[z.id] = z;
    });
    dataMap.current = map;
  }, [zupanije]);

  // Load GeoJSON
  useEffect(() => {
    fetch('/geojson/zupanije.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Style each county feature
  function style(feature) {
    const county = dataMap.current[feature.properties.id];
    const pad = county ? county.pad_postotak : 0;
    const isSelected = feature.properties.id === selectedCountyId;

    return {
      fillColor: getColor(pad),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#ba7517' : '#ffffff',
      fillOpacity: 0.85,
    };
  }

  // Attach events to each county feature
  function onEachFeature(feature, layer) {
    const county = dataMap.current[feature.properties.id];
    if (!county) return;

    // Tooltip
    const tooltipContent = `
      <div class="county-tooltip-name">${county.naziv}</div>
      <div class="county-tooltip-value">${county.pad_postotak.toLocaleString('hr-HR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%</div>
    `;
    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: 'top',
      offset: [0, -10],
    });

    // Hover
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#ba7517',
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        onSelectCounty(feature.properties.id);
      },
    });
  }

  // Force re-render of GeoJSON layer when selection changes
  const geoJsonKey = `geojson-${selectedCountyId || 'none'}`;

  if (!geojsonData) {
    return (
      <div className={styles.loadingPlaceholder}>
        Učitavanje karte...
      </div>
    );
  }

  return (
    <div className={styles.mapSection}>
      <MapContainer
        center={CROATIA_CENTER}
        zoom={CROATIA_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <ZoomControl position="topright" />
        <GeoJSON
          key={geoJsonKey}
          ref={geoJsonRef}
          data={geojsonData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Color legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Pad stanovništva 2011–2021</div>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ background: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
