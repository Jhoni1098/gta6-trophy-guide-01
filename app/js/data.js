// data.js — loads the trophy list the app ships with and names its kinds.
// The list is app/data/trophies.json: the 55 official PlayStation 5 trophies
// with each trophy's official name, description and grade, plus this guide's
// own guide text, kind, missable flag and sources.
export const DATA_URL = 'data/trophies.json';

export const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  robbery: 'Robberies',
  money: 'Money',
  side: 'Side quests',
  completion: '100% completion',
  platinum: 'Platinum',
};

export const KIND_ORDER = [
  'all', 'story', 'missable', 'collectible', 'activity',
  'robbery', 'money', 'side', 'completion', 'platinum',
];

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LETTER = {
  platinum: 'P',
  gold: 'G',
  silver: 'S',
  bronze: 'B',
};

/** Fetches the trophy list. Throws when the file cannot be read. */
export async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`could not load ${DATA_URL}: ${response.status}`);
  }
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) {
    throw new Error(`${DATA_URL} holds no trophies`);
  }
  return { trophies, meta: data };
}

/** Counts the trophies of each kind, for the filter chips. */
export function countByKind(trophies) {
  const counts = { all: trophies.length };
  for (const trophy of trophies) {
    if (trophy.kind === 'story' || trophy.missable) {
      // A trophy can be both a kind and missable; the Missable chip counts flags.
    }
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
  }
  counts.missable = trophies.filter((t) => t.missable).length;
  return counts;
}
