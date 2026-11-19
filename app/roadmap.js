// Roadmap view: the seven stages to the platinum, each with its trophies,
// its advice, and a live earned count drawn from the progress store.
export function renderRoadmap(roadmapData, byId, progressStore, onSelectTrophy) {
  document.getElementById('roadmapTitle').textContent = roadmapData.title;
  document.getElementById('roadmapIntro').textContent = roadmapData.intro;
  document.getElementById('roadmapMissable').textContent = `⚠ Missable watch: ${roadmapData.missableNote}`;
  const stagesList = document.getElementById('roadmapStages');
  stagesList.replaceChildren();
  for (const stage of roadmapData.stages) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    const earnedInStage = stage.trophies.filter((id) => progressStore.isEarned(byId.get(id))).length;
    heading.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${earnedInStage} of ${stage.trophies.length} trophies earned in this stage`;
    const advice = document.createElement('p');
    advice.textContent = stage.advice;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const trophy = byId.get(id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = `${progressStore.isEarned(trophy) ? '✓ ' : ''}${trophy.name} (${trophy.grade})`;
      if (progressStore.isEarned(trophy)) chip.classList.add('earned');
      chip.addEventListener('click', () => onSelectTrophy(id));
      chips.append(chip);
    }
    item.append(heading, count, advice, chips);
    stagesList.append(item);
  }
}
