export enum Tag {
  GLUTEN_FREE = 'GLUTEN_FREE',
  LACTOSE_FREE = 'LACTOSE_FREE',
  VEGAN = 'VEGAN',
  VEGETARIAN = 'VEGETARIAN',
  NUT_FREE = 'NUT_FREE',
  HALAL = 'HALAL',
  KOSHER = 'KOSHER',
  BIO = 'BIO',
}

export const TagLabels: Record<Tag, string> = {
  [Tag.GLUTEN_FREE]: 'Sans gluten',
  [Tag.LACTOSE_FREE]: 'Sans lactose',
  [Tag.VEGAN]: 'Végan',
  [Tag.VEGETARIAN]: 'Végétarien',
  [Tag.NUT_FREE]: 'Sans noix',
  [Tag.HALAL]: 'Halal',
  [Tag.KOSHER]: 'Casher',
  [Tag.BIO]: 'Bio',
}
