export enum Difficulty {
  EASY = 'EASY',
  MIDDLE = 'MIDDLE',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
  EXPERT = 'EXPERT',
}

export const DifficultyLabels: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Facile',
  [Difficulty.MIDDLE]: 'Moyen',
  [Difficulty.HARD]: 'Difficile',
  [Difficulty.VERY_HARD]: 'Très difficile',
  [Difficulty.EXPERT]: 'Expert',
}
