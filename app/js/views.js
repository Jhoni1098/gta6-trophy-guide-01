// views.js — renders the checklist, a trophy's detail pane, the roadmap
// steps and the missables page. All text comes from the trophy list and
// the roadmap below; nothing is fetched from the network.
import { KIND_LABELS, KIND_ORDER, GRADE_LETTER } from './data.js';
import {
  filterTrophies,
  trophyIsSpoilerHidden,
  spoilerPlaceholder,
} from './filters.js';

export const ROADMAP_STEPS = [
  {
    title: 'Step 1 — Finish the story (60–80 hours)',
    text: 'Play through all five chapters. The 12 story trophies unlock automatically as you go, and none of them can be missed. While you play, scan vehicles and study animals through the binoculars whenever you get the chance — that progress counts toward the 100% checklist later. And do the Chapter 1 balcony meditation for Positive Mental Attitude before Chapter 1 ends: it is the one missable trophy in the game.',
    source: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  {
    title: 'Step 2 — The 100% Completion Checklist (about 100 hours)',
    text: 'After the final mission, open Progress, then Stats, then 100% Completion. You need 70 of the 80 Challenges, and most side quests are not required at all. Only Robberies, Underwater Discoveries, Shooting Ranges, Drone Races and Bret\u2019s Quests need everything. You only need to scan 200 of 277 base-model vehicles and study 100 of 255 animals. This step earns A Long Road, the gold for 100%, and most of the activity and collectible trophies on the way.',
    source: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  {
    title: 'Step 3 — Strangers & Freaks: 8 stranger strands',
    text: 'Finish all 8 stranger mission strands — Andy, Kenton, Billy, Randy and Tyrone each end in a finale with its own trophy, plus three more strangers to find around Leonida. These strands are NOT part of the 100% checklist, so they are a separate step after the story.',
    source: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
  {
    title: 'Step 4 — Clean-up, then the Platinum',
    text: 'Sweep up what is left: WAiNK It at 100 locations, the 3 card sets, the 18 meditation spots, the money trophies (launder $250,000, spend $100,000, buy all 8 garages) and any activities still open. When the last of the other 54 is earned, Vice Got a Price! pops on its own. Total: about 200 hours, difficulty 4/10, one playthrough.',
    source: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
    url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  },
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function medalHtml(grade) {
  return `<span class="medal ${grade}" title="${grade}">${GRADE_LETTER[grade]}</span>`;
}

function countLabel(trophy) {
  if (trophy.count === undefined || trophy.count === null) return '';
  const unit = trophy.kind === 'money' ? '$' : '';
  const value = trophy.kind === 'money'
    ? Number(trophy.count).toLocaleString('en-US')
    : trophy.count;
  return `<span class="tag count">Target: ${unit}${value}</span>`;
}

/** Renders the kind filter chips with their counts. */
export function renderKindChips(container, counts, activeKind, onPick) {
  container.innerHTML = '';
  for (const kind of KIND_ORDER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `kind-chip${kind === activeKind ? ' active' : ''}`;
    button.textContent = `${KIND_LABELS[kind]} (${counts[kind] || 0})`;
    button.addEventListener('click', () => onPick(kind));
    container.appendChild(button);
  }
}

/** Renders the filtered checklist rows into the list element. */
export function renderChecklist(listEl, summaryEl, emptyEl, trophies, state, onToggle, onOpen) {
  const shown = filterTrophies(trophies, state);
  summaryEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies — ${state.earned.size} earned.`;
  emptyEl.hidden = shown.length !== 0;
  listEl.innerHTML = '';
  for (const trophy of shown) {
    const earned = state.earned.has(trophy.id);
    const hidden = trophyIsSpoilerHidden(trophy, state.spoilersHidden, state.earned);
    const shownText = hidden ? spoilerPlaceholder(trophy) : trophy;
    const row = document.createElement('li');
    row.className = `trophy-row${earned ? ' earned' : ''}${hidden ? ' spoiler-hidden' : ''}`;
    row.innerHTML = `
      ${medalHtml(trophy.grade)}
      <input class="trophy-check" type="checkbox" ${earned ? 'checked' : ''}
        aria-label="Mark ${escapeHtml(shownText.name)} as earned">
      <div class="trophy-main">
        <div class="trophy-name">${escapeHtml(shownText.name)}</div>
        <div class="trophy-desc">${escapeHtml(shownText.description)}</div>
        <div class="trophy-tags">
          <span class="tag">${KIND_LABELS[trophy.kind] || trophy.kind}</span>
          ${trophy.hidden ? '<span class="tag">Hidden on PSN</span>' : ''}
          ${trophy.missable ? '<span class="tag missable">Missable</span>' : ''}
          ${countLabel(trophy)}
        </div>
      </div>`;
    const checkbox = row.querySelector('.trophy-check');
    checkbox.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(trophy.id, checkbox.checked);
    });
    row.addEventListener('click', (event) => {
      if (event.target === checkbox) return;
      onOpen(trophy.id);
    });
    listEl.appendChild(row);
  }
}

/** Renders one trophy's full guide, with its sources, into the detail pane. */
export function renderDetail(detailEl, trophy, earned) {
  const sources = (trophy.sources || []).map((source) => {
    const safeName = escapeHtml(source.name);
    const safeUrl = escapeHtml(source.url);
    return `<li><a href="${safeUrl}" target="_blank" rel="noopener">${safeName}</a></li>`;
  }).join('');
  detailEl.innerHTML = `
    <div class="detail-meta">
      ${medalHtml(trophy.grade)}
      <span class="tag">${trophy.grade}</span>
      <span class="tag">${KIND_LABELS[trophy.kind] || trophy.kind}</span>
      ${trophy.hidden ? '<span class="tag">Hidden on PSN until earned</span>' : ''}
      ${trophy.missable ? '<span class="tag missable">Missable — see below</span>' : ''}
      ${countLabel(trophy)}
      <span class="tag">${earned ? 'Earned' : 'Not earned yet'}</span>
    </div>
    <h2>${escapeHtml(trophy.name)}</h2>
    <p><em>${escapeHtml(trophy.description)}</em></p>
    ${trophy.missable && trophy.missableNote
      ? `<div class="missable-callout"><strong>Missable:</strong> ${escapeHtml(trophy.missableNote)}</div>`
      : ''}
    <div class="detail-guide"><p>${escapeHtml(trophy.guide)}</p></div>
    <div class="detail-sources">
      <strong>Sources:</strong>
      <ul>${sources}</ul>
    </div>`;
}

/** Renders the four roadmap steps. */
export function renderRoadmap(stepsEl) {
  stepsEl.innerHTML = '';
  for (const step of ROADMAP_STEPS) {
    const item = document.createElement('li');
    item.innerHTML = `
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.text)}</p>
      <p class="detail-sources">Source: <a href="${escapeHtml(step.url)}" target="_blank" rel="noopener">${escapeHtml(step.source)}</a></p>`;
    stepsEl.appendChild(item);
  }
}

/** Renders the missables page: the flagged trophies, each with its warning. */
export function renderMissables(listEl, trophies) {
  const missable = trophies.filter((t) => t.missable);
  listEl.innerHTML = '';
  for (const trophy of missable) {
    const row = document.createElement('div');
    row.className = 'trophy-row';
    row.innerHTML = `
      ${medalHtml(trophy.grade)}
      <div class="trophy-main">
        <div class="trophy-name">${escapeHtml(trophy.name)} <span class="tag missable">Missable</span></div>
        <div class="trophy-desc">${escapeHtml(trophy.description)}</div>
        <div class="missable-callout">${escapeHtml(trophy.missableNote || '')}</div>
        <p>${escapeHtml(trophy.guide)}</p>
      </div>`;
    listEl.appendChild(row);
  }
}
