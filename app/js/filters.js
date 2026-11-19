// filters.js — which trophies the checklist shows, and how story spoilers
// are hidden. A story trophy stays hidden (name and description replaced)
// while spoilers are hidden and the trophy is not yet earned.
export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function trophyMatchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
  return haystack.includes(needle);
}

/** Applies the checklist's kind, grade, search and earned-only filters. */
export function filterTrophies(trophies, state) {
  return trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, state.kind)) return false;
    if (!trophyMatchesGrade(trophy, state.grade)) return false;
    if (!trophyMatchesSearch(trophy, state.query)) return false;
    if (state.earnedOnly && !state.earned.has(trophy.id)) return false;
    return true;
  });
}

/** Whether this trophy's name and description must stay hidden for now. */
export function trophyIsSpoilerHidden(trophy, spoilersHidden, earned) {
  return spoilersHidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

/** The text shown for a story trophy while it is still hidden. */
export function spoilerPlaceholder(trophy) {
  return {
    name: 'Hidden story trophy',
    description: `A story trophy — Chapter ${trophy.chapter || '?'} — hidden until earned. Turn spoilers off to see its name.`,
  };
}
