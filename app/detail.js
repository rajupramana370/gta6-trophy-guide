// Checklist and detail panel: the trophy cards, the guide shown beside them,
// and the spoiler masking that hides story trophies until they are earned.
import { isSpoilerHidden, spoilerPlaceholderText } from './filters.js';

function gradeLabel(trophy) {
  return trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
}

function cardTitle(trophy, filterState, progressStore) {
  if (isSpoilerHidden(trophy, filterState, progressStore)) return '??? — hidden story trophy';
  return trophy.name;
}

function cardDescription(trophy, filterState, progressStore) {
  if (isSpoilerHidden(trophy, filterState, progressStore)) return spoilerPlaceholderText();
  return trophy.description;
}

export function renderTrophyList(listElement, visibleTrophies, progressStore, filterState, onSelect) {
  listElement.replaceChildren();
  for (const trophy of visibleTrophies) {
    const earned = progressStore.isEarned(trophy);
    const card = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `trophy-card${earned ? ' earned' : ''}`;
    button.dataset.trophyId = String(trophy.id);

    const top = document.createElement('span');
    top.className = 'card-top';
    const name = document.createElement('h3');
    name.textContent = cardTitle(trophy, filterState, progressStore);
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${trophy.grade}`;
    badge.textContent = gradeLabel(trophy);
    top.append(name, badge);

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = cardDescription(trophy, filterState, progressStore);

    const meta = document.createElement('span');
    meta.className = 'card-meta';
    const kind = document.createElement('span');
    kind.textContent = trophy.kind;
    meta.append(kind);
    if (trophy.hidden) {
      const hidden = document.createElement('span');
      hidden.className = 'hidden-flag';
      hidden.textContent = 'Hidden on PSN';
      meta.append(hidden);
    }
    if (trophy.count) {
      const count = document.createElement('span');
      count.textContent = `Target: ${trophy.count.toLocaleString()}`;
      meta.append(count);
    }
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'missable-flag';
      flag.textContent = '⚠ MISSABLE';
      meta.append(flag);
    }
    const tick = document.createElement('span');
    tick.className = 'earned-tick';
    tick.textContent = earned ? '✓ Earned' : '○ Not earned';
    meta.append(tick);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = earned;
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    checkbox.addEventListener('click', (event) => {
      event.stopPropagation();
      progressStore.setEarned(trophy.name, event.target.checked);
    });

    button.append(top, desc, meta);
    button.addEventListener('click', () => onSelect(trophy.id));
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'flex-start';
    checkbox.style.marginTop = '16px';
    row.append(checkbox, button);
    card.append(row);
    listElement.append(card);
  }
}

export function renderTrophyDetail(trophy, progressStore, filterState) {
  const empty = document.getElementById('detailEmpty');
  const card = document.getElementById('detailCard');
  if (!trophy) {
    empty.hidden = false;
    card.hidden = true;
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  const hidden = isSpoilerHidden(trophy, filterState, progressStore);
  document.getElementById('detailGradeBadge').textContent = gradeLabel(trophy);
  document.getElementById('detailGradeBadge').className = `grade-badge grade-${trophy.grade}`;
  document.getElementById('detailKind').textContent = `Kind: ${trophy.kind}${trophy.hidden ? ' · Hidden on PSN' : ''}`;
  document.getElementById('detailMissable').hidden = !trophy.missable;
  document.getElementById('detailName').textContent = hidden ? '??? — hidden story trophy' : trophy.name;
  document.getElementById('detailDesc').textContent = hidden ? spoilerPlaceholderText() : trophy.description;
  const countLine = document.getElementById('detailCount');
  countLine.hidden = !trophy.count;
  if (trophy.count) countLine.textContent = `Target to reach: ${trophy.count.toLocaleString()}`;
  document.getElementById('detailGuide').textContent = hidden
    ? 'Turn off the spoiler setting, or earn this trophy, to read its guide.'
    : trophy.guide;
  document.getElementById('detailSource').textContent = trophy.source;
  const verdict = document.getElementById('detailVerdict');
  verdict.hidden = !trophy.missable;
  if (trophy.missable) {
    verdict.textContent = '⚠ MISSABLE — do the first meditation in Chapter 1 when it is offered. PowerPyx flags this as the only confirmed missable trophy on the list.';
  }
  document.getElementById('detailEarned').checked = progressStore.isEarned(trophy);
}
