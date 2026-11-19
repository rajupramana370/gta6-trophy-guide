// Progress store: the earned set lives in localStorage under one key, so the
// checklist survives a reload. Export writes it to a file; import reads one back.
export function createProgressStore(storageKey) {
  let earnedNames = new Set(readStoredNames());
  let onChange = null;

  function readStoredNames() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string') : [];
    } catch {
      return [];
    }
  }

  function saveStoredNames() {
    window.localStorage.setItem(storageKey, JSON.stringify([...earnedNames]));
  }

  function notify() {
    if (typeof onChange === 'function') onChange();
  }

  return {
    get onChange() {
      return onChange;
    },
    set onChange(handler) {
      onChange = handler;
    },
    isEarned(trophy) {
      return earnedNames.has(trophy.name);
    },
    earnedCount() {
      return earnedNames.size;
    },
    setEarned(trophyName, earned) {
      if (earned) earnedNames.add(trophyName);
      else earnedNames.delete(trophyName);
      saveStoredNames();
      notify();
    },
    clearAll() {
      earnedNames = new Set();
      saveStoredNames();
      notify();
    },
    seedDemoProgress(trophies, trophyIds) {
      // Screenshot helper only: marks a spread of trophies earned so the
      // progress bar and earned styling are visible in a render.
      for (const trophy of trophies) {
        if (trophyIds.includes(trophy.id)) earnedNames.add(trophy.name);
      }
      saveStoredNames();
      notify();
    },
    exportProgress(trophies) {
      const payload = {
        app: 'Leonida Trophy Guide',
        exportedAt: new Date().toISOString(),
        earned: trophies.filter((trophy) => earnedNames.has(trophy.name)).map((trophy) => trophy.name),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'gta6-trophy-progress.json';
      link.click();
      URL.revokeObjectURL(link.href);
    },
    async importProgressFile(file, trophies) {
      if (!file) return false;
      try {
        const parsed = JSON.parse(await file.text());
        const names = Array.isArray(parsed) ? parsed : parsed.earned;
        if (!Array.isArray(names)) return false;
        const known = new Set(trophies.map((trophy) => trophy.name));
        earnedNames = new Set(names.filter((name) => known.has(name)));
        saveStoredNames();
        notify();
        return true;
      } catch {
        return false;
      }
    },
  };
}
