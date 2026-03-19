export enum Cost {
  CHEAP = 'CHEAP',
  MIDDLE = 'MIDDLE',
  EXPENSIVE = 'EXPENSIVE',
}

export const CostLabels: Record<Cost, string> = {
  [Cost.CHEAP]: 'Bon marché',
  [Cost.MIDDLE]: 'Moyen',
  [Cost.EXPENSIVE]: 'Coûteux',
}
