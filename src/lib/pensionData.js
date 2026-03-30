/**
 * Pension system data for the /mirovine page.
 *
 * ALL data comes from real sources:
 *   - HZMO monthly reports: "Korisnici mirovina" (Dec 2021, Dec 2025, Jan 2026)
 *     Files: korisnici-mirovina-01-2022-za-12-2021.xlsx,
 *            korisnici-mirovina-1-2026-za-12-2025.xlsx,
 *            korisnici-mirovina-2-2026-za-1-2026.xlsx
 *   - DZS Census 2021: age structure per county (koeficijent_ovisnosti)
 *
 * County-level worker-to-pensioner ratios are NOT available from these sources
 * and are therefore NOT included.
 */

// ---------------------------------------------------------------------------
// Real HZMO data — national pensioner counts
// ---------------------------------------------------------------------------

export const PENSIONER_TOTALS = {
  '2021-12': {
    label: 'Prosinac 2021.',
    zomo: 1139096,
    dvo: 15881,
    zohbdr: 70836,
    hvo: 6788,
    ukupno: 1232601,
  },
  '2025-12': {
    label: 'Prosinac 2025.',
    zomo: 1132070,
    dvo: 16278,
    zohbdr: 72519,
    hvo: 7880,
    ukupno: 1228747,
  },
  '2026-01': {
    label: 'Siječanj 2026.',
    zomo: 1132830,
    dvo: 16240,
    zohbdr: 72420,
    hvo: 7944,
    ukupno: 1229434,
  },
};

/** Pension type breakdown for Jan 2026 (ZOMO only — col 2 from Sheet 1) */
export const PENSION_TYPE_BREAKDOWN = [
  { tip: 'Starosna', broj: 859494, postotak: 69.9 },
  { tip: 'Invalidska', broj: 86242, postotak: 7.0 },
  { tip: 'Obiteljska', broj: 187094, postotak: 15.2 },
];

/** Pension law breakdown for Jan 2026 (all 4 laws) */
export const PENSION_LAW_BREAKDOWN = [
  { zakon: 'ZOMO', naziv: 'Zakon o mirovinskom osiguranju', broj: 1132830 },
  { zakon: 'ZOHBDR', naziv: 'Zakon o hrvatskim braniteljima', broj: 72420 },
  { zakon: 'DVO', naziv: 'Djelatne vojne osobe / policija', broj: 16240 },
  { zakon: 'HVO', naziv: 'Hrvatsko vijeće obrane (BiH)', broj: 7944 },
];

/** Change in total pensioners: Dec 2021 → Jan 2026 */
export const PENSIONER_CHANGE = {
  od: '2021-12',
  do: '2026-01',
  apsolutno: 1229434 - 1232601,
  postotak: (1229434 - 1232601) / 1232601 * 100,
};

/**
 * National dependency ratio from DZS census 2021.
 * Calculated from national age structure:
 *   (0-14: 14.6% + 65+: 22.4%) / (15-64: 63.0%) = 0.587
 * Source: DZS Popis 2021, dobna struktura.
 */
export const NATIONAL_DEPENDENCY_RATIO = 0.59;
