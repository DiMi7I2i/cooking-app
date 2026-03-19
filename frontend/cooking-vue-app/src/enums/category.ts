export enum Category {
  APERITIF = 'APERITIF',
  ENTREE = 'ENTREE',
  PLAT = 'PLAT',
  DESSERT = 'DESSERT',
  BOISSON = 'BOISSON',
  DEJ_BRUNCH = 'DEJ_BRUNCH',
}

export const CategoryLabels: Record<Category, string> = {
  [Category.APERITIF]: 'Apéritif',
  [Category.ENTREE]: 'Entrée',
  [Category.PLAT]: 'Plat',
  [Category.DESSERT]: 'Dessert',
  [Category.BOISSON]: 'Boisson',
  [Category.DEJ_BRUNCH]: 'Petit-déj / Brunch',
}
