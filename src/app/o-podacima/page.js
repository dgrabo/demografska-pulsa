import Header from '@/components/Layout/Header';
import styles from './o-podacima.module.css';

export const metadata = {
  title: 'O podacima',
  description:
    'Izvori podataka, metodologija izračuna i licenca za DemografskaPulsa.',
};

export default function OPodacimaPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>O podacima</h1>
        <p className={styles.pageSubtitle}>
          Transparentnost izvora i metodologije ključna je za vjerodostojnost podataka.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Izvori podataka</h2>
          <ul className={styles.sourceList}>
            <li>
              <strong>Popis stanovništva 2021.</strong> — Državni zavod za statistiku (DZS).
              Podatci o broju stanovnika, dobnoj strukturi i gustoći naseljenosti po gradovima
              i općinama.{' '}
              <a
                href="https://podaci.dzs.hr/hr/podaci/stanovnistvo/popis-stanovnistva/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                podaci.dzs.hr
              </a>
            </li>
            <li>
              <strong>Popis stanovništva 2011.</strong> — DZS. Koristi se za usporedbu s
              popisom 2021. i izračun pada stanovništva.{' '}
              <a
                href="https://web.dzs.hr/Hrv/censuses/census2011/results/censustabshtm.htm"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                web.dzs.hr
              </a>
            </li>
            <li>
              <strong>Strategija demografske revitalizacije do 2033.</strong> — Narodne novine
              36/2024. Sadrži projekcije stanovništva do 2050. po četiri scenarija.{' '}
              <a
                href="https://narodne-novine.nn.hr/clanci/sluzbeni/2024_03_36_581.html"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                narodne-novine.nn.hr
              </a>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Metodologija</h2>
          <div className={styles.methodGrid}>
            <div className={styles.methodCard}>
              <h3>Pad stanovništva</h3>
              <p>
                Apsolutni pad izračunava se kao razlika broja stanovnika 2021. i 2011.
                godine. Relativni pad (postotak) izračunava se formulom:
              </p>
              <code className={styles.formula}>
                pad_% = ((stanovnistvo_2021 - stanovnistvo_2011) / stanovnistvo_2011) × 100
              </code>
            </div>
            <div className={styles.methodCard}>
              <h3>Indeks starenja</h3>
              <p>
                Omjer broja starijih (65+) i mladih (0–14). Vrijednost iznad 1.0 znači da
                ima više starijih od mladih.
              </p>
              <code className={styles.formula}>
                indeks_starenja = stanovnistvo_65plus / stanovnistvo_0_14
              </code>
            </div>
            <div className={styles.methodCard}>
              <h3>Gustoća naseljenosti</h3>
              <p>
                Broj stanovnika po kvadratnom kilometru. Izračunava se kao omjer ukupnog
                broja stanovnika i površine u km².
              </p>
              <code className={styles.formula}>
                gustoca = stanovnistvo / povrsina_km2
              </code>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Licenca</h2>
          <div className={styles.licenceGrid}>
            <div className={styles.licenceCard}>
              <h3>Podatci</h3>
              <p>
                Svi podatci Državnog zavoda za statistiku objavljeni su pod licencom{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/deed.hr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Creative Commons CC BY 4.0
                </a>
                . Slobodno ih koristite uz navođenje izvora.
              </p>
            </div>
            <div className={styles.licenceCard}>
              <h3>Izvorni kod</h3>
              <p>
                Izvorni kod aplikacije DemografskaPulsa objavljen je pod{' '}
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  MIT licencom
                </a>
                . Slobodno ga koristite, modificirajte i distribuirajte.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
