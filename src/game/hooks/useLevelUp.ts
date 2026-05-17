// useLevelUp — DEPRECATED (level/XP system removed)
// Kept as stub for any remaining imports

export function useLevelUp() {
  return {
    addExpWithLevelUp: (_amount: number, _playSound: (type: string) => void) => ({
      leveledUp: false,
    }),
    checkLevelUp: () => false,
  };
}
