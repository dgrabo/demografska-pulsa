import { formatNumber, formatPercent } from '@/lib/dataUtils';
import styles from './CountyPanel.module.css';

function getDeclineColor(pad) {
  if (pad > -5) return '#1d9e75';
  if (pad > -10) return '#ba7517';
  if (pad > -15) return '#e24b4a';
  return '#a32d2d';
}

export default function CountyPanel({ county, onClose, onViewMunicipalities }) {
  if (!county) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>&#x1F5FA;</div>
        <div className={styles.placeholderTitle}>Odaberite županiju</div>
        <div className={styles.placeholderText}>
          Kliknite na županiju na karti za prikaz detaljnih podataka.
        </div>
      </div>
    );
  }

  const declineColor = getDeclineColor(county.pad_postotak);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.countyName}>{county.naziv}</h2>
          <div className={styles.countySubtitle}>Županija</div>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Zatvori"
        >
          &#x2715;
        </button>
      </div>

      <div className={styles.declineBig} style={{ color: declineColor }}>
        {formatPercent(county.pad_postotak)}
      </div>
      <div className={styles.declineLabel}>
        Promjena stanovništva 2011. — 2021.
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Stanovništvo 2021.</span>
          <span className={styles.statValue}>
            {formatNumber(county.stanovnistvo_2021)}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Stanovništvo 2011.</span>
          <span className={styles.statValue}>
            {formatNumber(county.stanovnistvo_2011)}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Apsolutni pad</span>
          <span className={styles.statValue} style={{ color: declineColor }}>
            {formatNumber(county.pad_apsolutni)}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Indeks starenja</span>
          <span className={styles.statValue}>
            {county.indeks_starenja.toLocaleString('hr-HR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Udio 65+</span>
          <span className={styles.statValue}>
            {county.stari_65plus_postotak}%
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Udio 0–14</span>
          <span className={styles.statValue}>
            {county.mladi_0_14_postotak}%
          </span>
        </div>
      </div>

      {onViewMunicipalities && (
        <button
          className={styles.viewOpcineButton}
          onClick={onViewMunicipalities}
        >
          Pregledaj općine &rarr;
        </button>
      )}
    </div>
  );
}
