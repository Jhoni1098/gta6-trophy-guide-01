// store.js — the checklist's saved progress. Everything lives in this
// browser's localStorage; export writes a file, import reads one back.
// No account, no server, nothing leaves the machine.
export const STORAGE_KEY = 'gta6-trophy-guide-v1';
export const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';

/** Reads the earned trophy ids as a Set of numbers. */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch (err) {
    return new Set();
  }
}

/** Saves the earned trophy ids. */
export function saveEarned(earned) {
  const ids = [...earned].sort((a, b) => a - b);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Reads the spoiler setting (true = hide story trophies until earned). */
export function loadSpoilersHidden() {
  try {
    return localStorage.getItem(SPOILER_KEY) !== 'shown';
  } catch (err) {
    return true;
  }
}

/** Saves the spoiler setting. */
export function saveSpoilersHidden(hidden) {
  localStorage.setItem(SPOILER_KEY, hidden ? 'hidden' : 'shown');
}

/** Downloads the progress as a JSON file. */
export function exportProgress(earned) {
  const payload = {
    app: 'gta6-trophy-guide-01',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Reads an exported progress file and returns its earned ids as a Set. */
export function importProgressFile(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) {
      throw new Error('that file holds no earned list');
    }
    return new Set(ids.filter((id) => Number.isInteger(id)));
  });
}
