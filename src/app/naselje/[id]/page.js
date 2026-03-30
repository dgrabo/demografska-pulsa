import Link from 'next/link';
import { notFound } from 'next/navigation';
import naselja from '../../../../public/data/naselja.json';
import zupanije from '../../../../public/data/zupanije.json';
import { getStatusConfig, getPercentileSentence } from '@/lib/settlementUtils';
import { formatNumber, formatPercent } from '@/lib/dataUtils';
import styles from './naselje.module.css';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const naselje = naselja.find((n) => n.id === id);
  if (!naselje) {
    return { title: 'Naselje nije pronađeno' };
  }
  return {
    title: `${naselje.naziv} — demografski profil`,
    description: `Demografski podaci za ${naselje.naziv} (${naselje.opcina_naziv}, ${naselje.zupanija_naziv}). Stanovništvo ${naselje.pop_2021}, promjena ${naselje.promjena_pct > 0 ? '+' : ''}${naselje.promjena_pct}% od 2011.`,
  };
}

export default async function NaseljePage({ params }) {
  const { id } = await params;
  const naselje = naselja.find((n) => n.id === id);

  if (!naselje) {
    notFound();
  }

  const statusConfig = getStatusConfig(naselje.status);
  const zupanija = zupanije.find((z) => z.id === naselje.zupanija_id);
  const contextSentence = getPercentileSentence(naselje.percentil, naselje.naziv);

  const changeColor = naselje.promjena_pct > 0
    ? 'var(--color-positive)'
    : naselje.promjena_pct > -10
      ? 'var(--color-warning)'
      : 'var(--color-primary)';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Natrag na kartu
        </Link>

        <h1 className={styles.name}>{naselje.naziv}</h1>
        <p className={styles.subtitle}>
          {naselje.opcina_naziv}
          {' · '}
            {naselje.zupanija_naziv}
        </p>

        <span
          className={styles.badge}
          style={{ color: statusConfig.color, background: statusConfig.bg }}
        >
          {naselje.status === 'napusteno' && '⚠ '}
          {naselje.status === 'kriticno' && '⚠ '}
          {naselje.status === 'raste' && '✓ '}
          {statusConfig.label}
        </span>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Stanovništvo 2021.</span>
            <span className={styles.statValue}>
              {formatNumber(naselje.pop_2021)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Stanovništvo 2011.</span>
            <span className={styles.statValue}>
              {formatNumber(naselje.pop_2011)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Apsolutna promjena</span>
            <span
              className={styles.statValue}
              style={{ color: changeColor }}
            >
              {naselje.promjena_abs > 0 ? '+' : ''}
              {formatNumber(naselje.promjena_abs)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Relativna promjena</span>
            <span
              className={styles.statValue}
              style={{ color: changeColor }}
            >
              {formatPercent(naselje.promjena_pct)}
            </span>
          </div>
        </div>

        {naselje.pop_2021 > 0 && (
          <div className={styles.ageSection}>
            <h2 className={styles.sectionTitle}>Dobna struktura</h2>
            <div className={styles.ageBar}>
              <div
                className={styles.ageSegment}
                style={{
                  width: `${naselje.mladi_pct}%`,
                  background: 'var(--color-positive)',
                }}
                title={`0-14: ${naselje.mladi_pct}%`}
              />
              <div
                className={styles.ageSegment}
                style={{
                  width: `${naselje.radni_pct}%`,
                  background: 'var(--color-warning)',
                }}
                title={`15-64: ${naselje.radni_pct}%`}
              />
              <div
                className={styles.ageSegment}
                style={{
                  width: `${naselje.stari_pct}%`,
                  background: 'var(--color-primary)',
                }}
                title={`65+: ${naselje.stari_pct}%`}
              />
            </div>
            <div className={styles.ageLegend}>
              <span className={styles.ageLegendItem}>
                <span
                  className={styles.ageLegendDot}
                  style={{ background: 'var(--color-positive)' }}
                />
                0-14: {naselje.mladi_pct}%
              </span>
              <span className={styles.ageLegendItem}>
                <span
                  className={styles.ageLegendDot}
                  style={{ background: 'var(--color-warning)' }}
                />
                15-64: {naselje.radni_pct}%
              </span>
              <span className={styles.ageLegendItem}>
                <span
                  className={styles.ageLegendDot}
                  style={{ background: 'var(--color-primary)' }}
                />
                65+: {naselje.stari_pct}%
              </span>
            </div>
          </div>
        )}

        <p className={styles.context}>{contextSentence}</p>

        
        <p className={styles.source}>
          Izvor: Državni zavod za statistiku, Popis stanovništva 2021.
          &middot; CC BY 4.0
        </p>
      </div>
    </div>
  );
}
