// Calcul des quantités d'ingrédients selon le nombre de personnes choisi.
// Partagé entre l'écran de détail et l'export PDF pour qu'ils affichent la même chose.

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.33, '⅓'],
  [0.5, '½'],
  [0.67, '⅔'],
  [0.75, '¾']
]

export function toFraction(value: number): string {
  const whole = Math.floor(value)
  const decimal = value - whole

  if (decimal < 0.01) return String(whole)

  for (const [threshold, symbol] of FRACTIONS) {
    if (Math.abs(decimal - threshold) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol
    }
  }

  return value.toFixed(1)
}

function adjust(quantity: number, baseServings: number | undefined, servings: number): number {
  return baseServings ? (quantity * servings) / baseServings : quantity
}

/** Vrai si la quantité ajustée s'affiche sous forme de fraction (¼, ½…). */
export function isFraction(
  quantity: number,
  baseServings: number | undefined,
  servings: number
): boolean {
  if (!baseServings) return false
  const adjusted = adjust(quantity, baseServings, servings)
  return adjusted < 1 && adjusted % 1 !== 0
}

/** Quantité ajustée au nombre de personnes, formatée pour l'affichage. */
export function formatQuantity(
  quantity: number,
  hasUnit: boolean,
  baseServings: number | undefined,
  servings: number
): string {
  if (!baseServings) return String(quantity)
  const adjusted = adjust(quantity, baseServings, servings)

  if (adjusted % 1 === 0) return String(adjusted)
  if (!hasUnit && adjusted < 1) return toFraction(adjusted)
  return adjusted.toFixed(1)
}
