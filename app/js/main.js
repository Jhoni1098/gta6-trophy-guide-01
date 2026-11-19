// main.js — boots the guide: loads the trophy list, restores saved
// progress, wires the toolbar and the hash routing, and renders the views.
import { loadTrophies, countByKind } from './data.js';
import {
  loadEarned,
  saveEarned,
  loadSpoilersHidden,
  saveSpoilersHidden,
  exportProgress,
  importProgressFile,
} from './store.js';
import {
  renderKindChips,
  renderChecklist,
  renderDetail,
  renderRoadmap,
  renderMissables,
} from './views.js';

const state = {
  trophies: [],
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  query: '',
  earnedOnly: false,
  spoilersHidden: true,
  view: 'checklist',
  openId: null,
};

const els = {
  earnedCount: document.getElementById('earnedCount'),
  progressFill: document.getElementById('progressFill'),
  progressPct: document.getElementById('progressPct'),
  platinumHint: document.getElementById('platinumHint'),
  searchInput: document.getElementById('searchInput'),
  kindFilters: document.getElementById('kindFilters'),
  gradeFilter: document.getElementById('gradeFilter'),
  earnedOnly: document.getElementById('earnedOnly'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  toolbar: document.getElementById('toolbar'),
  listSummary: document.getElementById('listSummary'),
  trophyList: document.getElementById('trophyList'),
  emptyNote: document.getElementById('emptyNote'),
  detailView: document.getElementById('detailView'),
  trophyDetail: document.getElementById('trophyDetail'),
  backBtn: document.getElementById('backBtn'),
  roadmapSteps: document.getElementById('roadmapSteps'),
  missableList: document.getElementById('missableList'),
};

const VIEWS = ['checklist', 'roadmap', 'missables', 'about'];

function updateProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length || 55;
  const pct = Math.round((earned / total) * 100);
  els.earnedCount.textContent = String(earned);
  els.progressFill.style.width = `${pct}%`;
  els.progressPct.textContent = `${pct}%`;
  els.platinumHint.textContent = earned === total
    ? 'Platinum earned — Leonida Legend!'
    : 'Platinum: Vice Got a Price!';
}

function showView(view) {
  for (const name of VIEWS) {
    const section = document.getElementById(`${name}View`);
    if (section) section.hidden = name !== view;
  }
  els.detailView.hidden = view !== 'detail';
  els.toolbar.style.display = view === 'checklist' ? '' : 'none';
  for (const link of document.querySelectorAll('#mainNav .nav-link')) {
    link.classList.toggle('active', link.dataset.view === view);
  }
}

function renderAll() {
  updateProgress();
  renderKindChips(els.kindFilters, countByKind(state.trophies), state.kind, (kind) => {
    state.kind = kind;
    renderAll();
  });
  renderChecklist(
    els.trophyList, els.listSummary, els.emptyNote,
    state.trophies, state,
    (id, checked) => toggleEarned(id, checked),
    (id) => { location.hash = `#/trophy/${id}`; },
  );
  renderRoadmap(els.roadmapSteps);
  renderMissables(els.missableList, state.trophies);
}

function toggleEarned(id, checked) {
  if (checked) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  const scrollY = window.scrollY;
  renderAll();
  window.scrollTo(0, scrollY);
}

function openDetail(id) {
  const trophy = state.trophies.find((t) => t.id === id);
  if (!trophy) {
    location.hash = '#/';
    return;
  }
  renderDetail(els.trophyDetail, trophy, state.earned.has(id));
  showView('detail');
  window.scrollTo(0, 0);
}

function routeFromHash() {
  const hash = location.hash || '#/';
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)$/);
  if (trophyMatch) {
    state.view = 'detail';
    openDetail(Number(trophyMatch[1]));
    return;
  }
  const view = hash.replace(/^#\//, '').split('/')[0] || 'checklist';
  state.view = VIEWS.includes(view) ? view : 'checklist';
  showView(state.view);
  if (state.view === 'checklist') renderAll();
}

function wireToolbar() {
  els.searchInput.addEventListener('input', () => {
    state.query = els.searchInput.value;
    renderAll();
  });
  els.gradeFilter.addEventListener('change', () => {
    state.grade = els.gradeFilter.value;
    renderAll();
  });
  els.earnedOnly.addEventListener('change', () => {
    state.earnedOnly = els.earnedOnly.checked;
    renderAll();
  });
  els.spoilerToggle.addEventListener('change', () => {
    state.spoilersHidden = els.spoilerToggle.checked;
    saveSpoilersHidden(state.spoilersHidden);
    renderAll();
  });
  els.exportBtn.addEventListener('click', () => exportProgress(state.earned));
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', () => {
    const file = els.importFile.files && els.importFile.files[0];
    if (!file) return;
    importProgressFile(file)
      .then((earned) => {
        state.earned = earned;
        saveEarned(state.earned);
        renderAll();
      })
      .catch((err) => {
        alert(`Could not import that file: ${err.message}`);
      })
      .finally(() => {
        els.importFile.value = '';
      });
  });
  els.backBtn.addEventListener('click', () => { location.hash = '#/'; });
  window.addEventListener('hashchange', routeFromHash);
}

async function bootGuide() {
  state.earned = loadEarned();
  state.spoilersHidden = loadSpoilersHidden();
  els.spoilerToggle.checked = state.spoilersHidden;
  wireToolbar();
  try {
    const { trophies } = await loadTrophies();
    state.trophies = trophies;
  } catch (err) {
    els.listSummary.textContent = `Could not load the trophy list: ${err.message}`;
    return;
  }
  renderAll();
  routeFromHash();
}

bootGuide();
