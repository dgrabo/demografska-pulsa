'use client';

import styles from './ServiceRiskList.module.css';

function getRiskColor(score) {
  if (score >= 60) return '#a32d2d';
  if (score >= 40) return '#ba7517';
  return '#1d9e75';
}

function getRiskLabel(score) {
  if (score >= 60) return 'Visok';
  if (score >= 40) return 'Umjeren';
  return 'Nizak';
}

function getHealthBadge(risk) {
  if (risk === 'crveno') return { label: 'Kritično', cls: 'badgeRed' };
  if (risk === 'zuto') return { label: 'Opterećeno', cls: 'badgeYellow' };
  return { label: 'Normalno', cls: 'badgeGreen' };
}

export default function ServiceRiskList({ uslugeData, zupanijeMap }) {
  if (!uslugeData || uslugeData.length === 0) return null;

  // Already sorted by rizik_ukupni descending from JSON
  const sorted = [...uslugeData].sort((a, b) => b.rizik_ukupni - a.rizik_ukupni);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Rizik od kolapsa javnih usluga</h2>
      <p className={styles.subtitle}>
        Kompozitni indeks: demografski pad (40%) + pad učenika (30%) + opterećenost liječnika (30%)
      </p>
      <div className={styles.list}>
        {sorted.map((item, index) => {
          const county = zupanijeMap[item.id];
          const name = county ? county.naziv : item.id;
          const riskColor = getRiskColor(item.rizik_ukupni);
          const riskLabel = getRiskLabel(item.rizik_ukupni);
          const healthBadge = getHealthBadge(item.rizik_zdravstveni);

          return (
            <div key={item.id} className={styles.row}>
              <span className={styles.rank}>{index + 1}.</span>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{name}</span>
                  <span
                    className={styles.riskBadge}
                    style={{ background: riskColor }}
                  >
                    {riskLabel} ({item.rizik_ukupni})
                  </span>
                </div>
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${item.rizik_ukupni}%`,
                      background: riskColor,
                    }}
                  />
                </div>
                <div className={styles.stats}>
                  <span className={styles.stat}>
                    Učenici: <strong>{item.ucenici_pad_pct > 0 ? '+' : ''}{item.ucenici_pad_pct}%</strong>
                  </span>
                  <span className={styles.stat}>
                    Pacijenti/liječnik: <strong>{item.pacijenti_po_doktoru.toLocaleString('hr-HR')}</strong>
                  </span>
                  <span className={`${styles.healthBadge} ${styles[healthBadge.cls]}`}>
                    {healthBadge.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className={styles.source}>
        Izvor: DZS (Popis 2021., obrazovna statistika 2024./2025.), HZZO (opća praksa, 02/2026)
      </p>
    </section>
  );
}
