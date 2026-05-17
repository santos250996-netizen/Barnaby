// Combat engine — pure TypeScript, no React, no side effects.
export {
  // Stat calculation functions
  getActiveSets,
  getMaxPieces,
  getAttack,
  getDefense,
  getCrit,
  getSpeed,
  getEquippedSkills,
  findSkillSlot,

  // Combat engine functions
  calculateEnemyIntent,
  startCombat,
  executePlayerAction,
  executeEnemyTurn,
  checkLevelUp,
  calculateCombatRewards,
} from './combat';

// Re-export types for convenience
export type {
  EnemyIntent,
  PreRolledDrop,
  CombatState,
  StartCombatResult,
  ExecutePlayerActionResult,
  PlayerActionVfx,
  ExecuteEnemyTurnResult,
  EnemyTurnVfx,
  CalculateCombatRewardsResult,
  CheckLevelUpResult,
} from './combat';
