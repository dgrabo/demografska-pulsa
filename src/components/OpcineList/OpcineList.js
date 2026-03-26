'use client';

import { useState, useMemo } from 'react';
import { formatNumber, formatPercent } from '@/lib/dataUtils';
import styles from './OpcineList.module.css';

function getBarColor(pad) {
  if (pad > -5) return '#fef0f0';
  if (pad > -10) return '#f09595';
  if (pad > -15) return '#e24b4a';
  if (pad > -20) return '#a32d2d';
  return '#501313';
}

const SORT_OPTIONS = [
  { value: 'pad_postotak', label: 'Po padu' },
  { value: 'stanovnistvo_2021', label: 'Po veličini' },
  { value: 'indeks_starenja', label: 'Po starenju' },
];

export default function OpcineList({ countyId, countyName, opcine, onClose }) {
  const [sortBy, setSortBy] = useState('pad_postotak');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filtered = useMemo(() => {
    let list = opcine.filter((o) => o.zupanija_id === countyId);

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((o) => o.naziv.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      if (sortBy === 'pad_postotak') return a.pad_postotak - b.pad_postotak;
      if (sortBy === 'stanovnistvo_2021') return b.stanovnistvo_2021 - a.stanovnistvo_2021;
      if (sortBy === 'indeks_starenja') return b.indeks_starenja - a.indeks_starenja;
      return 0;
    });

    return list;
  }, [opcine, countyId, searchTerm, sortBy]);

  const maxDecline = useMemo(() => {
    const countyList = opcine.filter((o) => o.zupanija_id === countyId);
    if (countyList.length === 0) return 1;
    return Math.abs(Math.min(...countyList.map((o) => o.pad_postotak)));
  }, [opcine, countyId]);

  const totalCount = opcine.filter((o) => o.zupanija_id === countyId).length;

  function handleRowClick(index) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{countyName}</h2>
            <span className={styles.count}>
              {totalCount} {totalCount === 1 ? 'jedinica' : 'jedinica'}
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Zatvori"
          >
            &#x2715;
          </button>
        </div>

        <div className={styles.controls}>
          <input
            type="text"
            className={styles.search}
            placeholder="Pretraži po imenu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setExpandedIndex(null);
            }}
          />
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setExpandedIndex(null);
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 && (
            <div className={styles.empty}>Nema rezultata za &ldquo;{searchTerm}&rdquo;</div>
          )}
          {filtered.map((o, i) => {
            const barWidth =
              maxDecline > 0
                ? Math.min((Math.abs(o.pad_postotak) / maxDecline) * 100, 100)
                : 0;
            const isExpanded = expandedIndex === i;

            return (
              <div key={o.naziv} className={styles.row}>
                <button
                  className={styles.rowMain}
                  onClick={() => handleRowClick(i)}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.rowTop}>
                    <div className={styles.rowName}>
                      <span className={styles.name}>{o.naziv}</span>
                      <span className={styles.badge}>{o.tip}</span>
                    </div>
                    <span className={styles.rowDecline}>
                      {formatPercent(o.pad_postotak)}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: getBarColor(o.pad_postotak),
                      }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Stanovništvo 2021.</span>
                      <span className={styles.detailValue}>
                        {formatNumber(o.stanovnistvo_2021)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Stanovništvo 2011.</span>
                      <span className={styles.detailValue}>
                        {formatNumber(o.stanovnistvo_2011)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Apsolutni pad</span>
                      <span className={styles.detailValue}>
                        {formatNumber(o.pad_apsolutni)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Udio 65+</span>
                      <span className={styles.detailValue}>{o.stari_65plus_postotak}%</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Udio 0–14</span>
                      <span className={styles.detailValue}>{o.mladi_0_14_postotak}%</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Indeks starenja</span>
                      <span className={styles.detailValue}>
                        {o.indeks_starenja.toLocaleString('hr-HR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button className={styles.backButton} onClick={onClose}>
            &larr; Natrag na županiju
          </button>
        </div>
      </div>
    </div>
  );
}
