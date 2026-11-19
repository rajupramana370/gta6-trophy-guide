// Filter state: one active kind filter, one grade, a search string, and the
// spoiler mode that hides story trophy names and descriptions until earned.
const FILTER_LABELS = {
  all: 'all trophies',
  story: 'story trophies',
  missable: 'missable trophies',
  collectible: 'collectible trophies',
  activity: 'activity trophies',
  online: 'online trophies',
  earned: 'trophies you have earned',
  remaining: 'trophies still to earn',
};

export function createFilterState() {
  return {
    activeFilter: 'all',
    grade: 'all',
    searchText: '',
    spoilerMode: false,
    describeActiveFilter() {
      if (this.activeFilter === 'online') {
        return 'Online filter: this list has no online trophies — all 55 are single-player, so the list is empty by design.';
      }
      if (this.activeFilter === 'missable') {
        return 'Missable filter: only Positive Mental Attitude is confirmed missable (PowerPyx). No other missable trophy is verified yet.';
      }
      if (this.activeFilter === 'all' && this.grade === 'all' && !this.searchText) return '';
      return `Filtering: ${FILTER_LABELS[this.activeFilter] ?? 'trophies'}${this.grade !== 'all' ? ` · ${this.grade} grade` : ''}${this.searchText ? ` · matching “${this.searchText}”` : ''}.`;
    },
  };
}

export function applyTrophyFilter(trophies, filterState, progressStore) {
  const query = filterState.searchText.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filterState.grade !== 'all' && trophy.grade !== filterState.grade) return false;
    switch (filterState.activeFilter) {
      case 'story':
        if (trophy.kind !== 'story') return false;
        break;
      case 'missable':
        if (!trophy.missable) return false;
        break;
      case 'collectible':
        if (trophy.kind !== 'collectible') return false;
        break;
      case 'activity':
        if (trophy.kind !== 'activity') return false;
        break;
      case 'online':
        return false;
      case 'earned':
        if (!progressStore.isEarned(trophy)) return false;
        break;
      case 'remaining':
        if (progressStore.isEarned(trophy)) return false;
        break;
      default:
        break;
    }
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function isSpoilerHidden(trophy, filterState, progressStore) {
  return filterState.spoilerMode && trophy.kind === 'story' && !progressStore.isEarned(trophy);
}

export function spoilerPlaceholderText() {
  return 'Hidden story trophy — earn it to reveal its name and description.';
}
