/**
 * Settlement status labels, colors, and helper functions.
 */

export const STATUS_CONFIG = {
  raste: {
    label: 'Raste',
    color: '#1d9e75',
    bg: '#e8f7f1',
    description: 'Stanovništvo raste (> +2%)',
  },
  stagnira: {
    label: 'Stagnira',
    color: '#ba7517',
    bg: '#fef5e7',
    description: 'Stanovništvo stagnira (±2%)',
  },
  pada: {
    label: 'Pada',
    color: '#e24b4a',
    bg: '#fef0f0',
    description: 'Stanovništvo pada (> −2%)',
  },
  kriticno: {
    label: 'Kritično',
    color: '#a32d2d',
    bg: '#f9e4e4',
    description: 'Izgubilo više od 30% stanovnika',
  },
  napusteno: {
    label: 'Napušteno',
    color: '#501313',
    bg: '#f0dada',
    description: 'Manje od 10 stanovnika',
  },
};

/**
 * Get status config for a given status key.
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pada;
}

/**
 * Get a context sentence about the settlement's percentile ranking.
 */
export function getPercentileSentence(percentil, naziv) {
  if (percentil <= 10) {
    return `${naziv} je među 10% najugroženijih naselja u Hrvatskoj po demografskom trendu.`;
  }
  if (percentil <= 25) {
    return `${naziv} je u donjih 25% naselja po demografskom trendu.`;
  }
  if (percentil <= 50) {
    return `${naziv} je ispod prosjeka po demografskom trendu.`;
  }
  if (percentil <= 75) {
    return `${naziv} je iznad prosjeka po demografskom trendu.`;
  }
  return `${naziv} je među 25% naselja s najboljim demografskim trendom u Hrvatskoj.`;
}

/**
 * Count abandoned settlements per county from naselja array.
 */
export function countAbandonedByCounty(naselja) {
  const counts = {};
  let total = 0;
  for (const n of naselja) {
    if (n.status === 'napusteno') {
      counts[n.zupanija_id] = (counts[n.zupanija_id] || 0) + 1;
      total++;
    }
  }
  return { counts, total };
}
