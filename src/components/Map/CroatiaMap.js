'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, ZoomControl, CircleMarker, Tooltip } from 'react-leaflet';
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
  { color: '#f09595', label: '5% - 10%' },
  { color: '#e24b4a', label: '10% - 15%' },
  { color: '#a32d2d', label: '15% - 20%' },
  { color: '#501313', label: 'Pad > 20%' },
];

const CROATIA_CENTER = [44.5, 16.4];
const CROATIA_ZOOM = 7;

// Calculate the centroid of a GeoJSON feature (supports Polygon and MultiPolygon)
function getFeatureCentroid(feature) {
  const coords = [];
  const geometry = feature.geometry;

  function collectCoords(ring) {
    for (const point of ring) {
      coords.push(point);
    }
  }

  if (geometry.type === 'Polygon') {
    collectCoords(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      collectCoords(polygon[0]);
    }
  }

  if (coords.length === 0) return null;

  const sumLng = coords.reduce((s, c) => s + c[0], 0);
  const sumLat = coords.reduce((s, c) => s + c[1], 0);
  return [sumLat / coords.length, sumLng / coords.length];
}

export default function CroatiaMap({ zupanije, selectedCountyId, onSelectCounty, abandonedByCounty, schoolByCounty, healthByCounty }) {
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
    const abandonedCount = abandonedByCounty ? (abandonedByCounty[county.id] || 0) : 0;
    const abandonedLine = abandonedByCounty && abandonedCount > 0
      ? `<div class="county-tooltip-abandoned">${abandonedCount} napuštenih naselja</div>`
      : '';
    const schoolInfo = schoolByCounty && schoolByCounty[county.id]
      ? `<div class="county-tooltip-school">Učenici: ${schoolByCounty[county.id].ucenici_pad_pct}%</div>`
      : '';
    const healthInfo = healthByCounty && healthByCounty[county.id]
      ? `<div class="county-tooltip-health">Pacijenti/liječnik: ${healthByCounty[county.id].pacijenti_po_doktoru.toLocaleString('hr-HR')}</div>`
      : '';
    const tooltipContent = `
      <div class="county-tooltip-name">${county.naziv}</div>
      <div class="county-tooltip-value">${county.pad_postotak.toLocaleString('hr-HR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%</div>
      ${abandonedLine}
      ${schoolInfo}
      ${healthInfo}
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

  // Force re-render of GeoJSON layer when selection or overlay changes
  const geoJsonKey = `geojson-${selectedCountyId || 'none'}-${abandonedByCounty ? 'ab' : 'no'}-${schoolByCounty ? 'sc' : 'ns'}-${healthByCounty ? 'he' : 'nh'}`;

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
        {abandonedByCounty && geojsonData && geojsonData.features.map((feature) => {
          const countyId = feature.properties.id;
          const count = abandonedByCounty[countyId];
          if (!count) return null;
          const center = getFeatureCentroid(feature);
          if (!center) return null;
          // Scale radius: min 6, max 28, based on count
          const radius = Math.min(28, Math.max(6, 4 + Math.sqrt(count) * 3));
          return (
            <CircleMarker
              key={`abandoned-${countyId}`}
              center={center}
              radius={radius}
              pathOptions={{
                color: '#501313',
                fillColor: '#e24b4a',
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <div className="county-tooltip-name">
                  {dataMap.current[countyId]?.naziv || countyId}
                </div>
                <div className="county-tooltip-abandoned">
                  {count} napuštenih naselja
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
        {/* School enrollment decline overlay */}
        {schoolByCounty && geojsonData && geojsonData.features.map((feature) => {
          const countyId = feature.properties.id;
          const data = schoolByCounty[countyId];
          if (!data || !data.rizik_skolski) return null;
          const center = getFeatureCentroid(feature);
          if (!center) return null;
          const decline = Math.abs(data.ucenici_pad_pct);
          const radius = Math.min(24, Math.max(8, 4 + decline * 0.5));
          return (
            <CircleMarker
              key={`school-${countyId}`}
              center={[center[0] + 0.08, center[1] - 0.08]}
              radius={radius}
              pathOptions={{
                color: '#7a5c00',
                fillColor: '#e8b931',
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <div className="county-tooltip-name">
                  {dataMap.current[countyId]?.naziv || countyId}
                </div>
                <div className="county-tooltip-school">
                  Učenici 2010: {data.ucenici_2010.toLocaleString('hr-HR')}
                </div>
                <div className="county-tooltip-school">
                  Učenici 2024: {data.ucenici_2024.toLocaleString('hr-HR')}
                </div>
                <div className="county-tooltip-school" style={{ fontWeight: 700 }}>
                  Pad: {data.ucenici_pad_pct}%
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Healthcare GP availability overlay */}
        {healthByCounty && geojsonData && geojsonData.features.map((feature) => {
          const countyId = feature.properties.id;
          const data = healthByCounty[countyId];
          if (!data) return null;
          const center = getFeatureCentroid(feature);
          if (!center) return null;
          const ratio = data.pacijenti_po_doktoru;
          const fillColor = data.rizik_zdravstveni === 'crveno'
            ? '#e24b4a'
            : data.rizik_zdravstveni === 'zuto'
              ? '#e8b931'
              : '#1d9e75';
          const borderColor = data.rizik_zdravstveni === 'crveno'
            ? '#a32d2d'
            : data.rizik_zdravstveni === 'zuto'
              ? '#7a5c00'
              : '#0e6e4e';
          const radius = Math.min(22, Math.max(8, (ratio - 1000) / 50));
          return (
            <CircleMarker
              key={`health-${countyId}`}
              center={[center[0] - 0.08, center[1] + 0.08]}
              radius={radius}
              pathOptions={{
                color: borderColor,
                fillColor: fillColor,
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                <div className="county-tooltip-name">
                  {dataMap.current[countyId]?.naziv || countyId}
                </div>
                <div className="county-tooltip-health">
                  Liječnika: {data.br_doktora}
                </div>
                <div className="county-tooltip-health">
                  Pacijenata: {data.br_pacijenata.toLocaleString('hr-HR')}
                </div>
                <div className="county-tooltip-health" style={{ fontWeight: 700 }}>
                  Po liječniku: {ratio.toLocaleString('hr-HR')}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
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
