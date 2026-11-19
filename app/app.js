// Leonida Trophy Guide — app bootstrap: loads the trophy data and the roadmap,
// wires the toolbar, the views and the detail panel, and honours deep links
// (#/roadmap, #/trophy/<id>) plus demo query params used for screenshots.
import { createProgressStore } from './tracker.js';
import { createFilterState, applyTrophyFilter } from './filters.js';
import { renderRoadmap } from './roadmap.js';
import { renderTrophyList, renderTrophyDetail } from './detail.js';

const trophyData = await (await fetch('data/trophies.json')).json();
const roadmapData = await (await fetch('data/roadmap.json')).json();
const trophies = trophyData.trophies;
const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
const progressStore = createProgressStore('leonida-trophy-progress-v1');
const filterState = createFilterState();

const listElement = document.getElementById('trophyList');
const countLine = document.getElementById('countLine');
const emptyState = document.getElementById('emptyState');
const filterNote = document.getElementById('filterNote');
const spoilerNote = document.getElementById('spoilerNote');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');

let selectedId = null;

function updateProgressDisplay() {
  const earnedCount = progressStore.earnedCount();
  const total = trophies.length;
  const pct = Math.round((earnedCount / total) * 100);
  progressText.textContent = `${earnedCount} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', String(earnedCount));
}

function renderAll() {
  const visible = applyTrophyFilter(trophies, filterState, progressStore);
  renderTrophyList(listElement, visible, progressStore, filterState, selectTrophy);
  countLine.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${progressStore.earnedCount()} earned`;
  emptyState.hidden = visible.length > 0;
  filterNote.textContent = filterState.describeActiveFilter();
  spoilerNote.hidden = !filterState.spoilerMode;
  updateProgressDisplay();
  if (selectedId !== null) renderTrophyDetail(byId.get(selectedId), progressStore, filterState);
}

function selectTrophy(id) {
  selectedId = id;
  renderTrophyDetail(byId.get(id), progressStore, filterState);
  renderAll();
}

function showView(viewName) {
  const checklist = document.getElementById('checklistView');
  const roadmap = document.getElementById('roadmapView');
  const checklistTab = document.getElementById('viewChecklist');
  const roadmapTab = document.getElementById('viewRoadmap');
  const isRoadmap = viewName === 'roadmap';
  checklist.hidden = isRoadmap;
  roadmap.hidden = !isRoadmap;
  checklistTab.classList.toggle('active', !isRoadmap);
  roadmapTab.classList.toggle('active', isRoadmap);
  if (isRoadmap) renderRoadmap(roadmapData, byId, progressStore, selectTrophy);
}

function applyHashRoute() {
  const hash = window.location.hash || '';
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)/);
  if (hash === '#/roadmap') {
    showView('roadmap');
  } else if (trophyMatch) {
    showView('checklist');
    selectTrophy(Number(trophyMatch[1]));
  } else {
    showView('checklist');
  }
}

function applyDemoParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'progress' && progressStore.earnedCount() === 0) {
    progressStore.seedDemoProgress(trophies, [1, 2, 3, 4, 5, 8, 15, 16, 21, 28, 35, 42]);
  }
  if (params.get('spoiler') === 'on') filterState.spoilerMode = true;
  const filter = params.get('filter');
  if (filter) filterState.activeFilter = filter;
  document.getElementById('spoilerToggle').checked = filterState.spoilerMode;
}

document.getElementById('searchBox').addEventListener('input', (event) => {
  filterState.searchText = event.target.value;
  renderAll();
});
document.getElementById('gradeSelect').addEventListener('change', (event) => {
  filterState.grade = event.target.value;
  renderAll();
});
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  filterState.spoilerMode = event.target.checked;
  renderAll();
});
document.getElementById('filterChips').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-filter]');
  if (!chip) return;
  filterState.activeFilter = chip.dataset.filter;
  document.querySelectorAll('#filterChips .chip').forEach((button) => {
    button.classList.toggle('active', button === chip);
  });
  renderAll();
});
document.getElementById('viewChecklist').addEventListener('click', () => showView('checklist'));
document.getElementById('viewRoadmap').addEventListener('click', () => showView('roadmap'));
document.getElementById('exportBtn').addEventListener('click', () => progressStore.exportProgress(trophies));
document.getElementById('importFile').addEventListener('change', async (event) => {
  await progressStore.importProgressFile(event.target.files[0], trophies);
  renderAll();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies?')) {
    progressStore.clearAll();
    renderAll();
  }
});
document.getElementById('detailEarned').addEventListener('change', (event) => {
  if (selectedId === null) return;
  progressStore.setEarned(byId.get(selectedId).name, event.target.checked);
  renderAll();
});
window.addEventListener('hashchange', applyHashRoute);

progressStore.onChange = renderAll;
applyDemoParams();
renderAll();
applyHashRoute();
