// Colors and fonts of the toy look (D-005, D-008, D-014, D-016). Values are written as CSS hex strings.

export interface ChipTheme {
  /** Color of the top face. */
  readonly face: string
  /** Color of the side of the chip. */
  readonly edge: string
  /** Color of the dashed notches near the rim. */
  readonly ring: string
  /** Color of the number. */
  readonly text: string
}

// One color per value, see docs/concept.md section 3. Text colors keep a good contrast on every face.
export const CHIP_THEMES: Readonly<Record<number, ChipTheme>> = {
  2: { face: '#FFFFFF', edge: '#D8D2C4', ring: '#9CC9EE', text: '#4A3320' },
  4: { face: '#8FD3F4', edge: '#5FB3DC', ring: '#FFFFFF', text: '#12394F' },
  8: { face: '#6CCB6E', edge: '#3FA244', ring: '#FFFFFF', text: '#0F3A12' },
  16: { face: '#D7372F', edge: '#A32620', ring: '#FFFFFF', text: '#FFFFFF' },
  32: { face: '#2F6BDB', edge: '#1F4DA8', ring: '#FFFFFF', text: '#FFFFFF' },
  64: { face: '#7A47C9', edge: '#55308F', ring: '#FFFFFF', text: '#FFFFFF' },
  128: { face: '#FF9F1C', edge: '#D97E00', ring: '#FFFFFF', text: '#3A2200' },
  256: { face: '#2B2B33', edge: '#14141A', ring: '#FFFFFF', text: '#FFFFFF' },
  512: { face: '#C4CAD3', edge: '#8E96A3', ring: '#FFFFFF', text: '#2B2B33' },
  1024: { face: '#F5C518', edge: '#C99A00', ring: '#FFFFFF', text: '#3A2A00' },
  2048: { face: '#FFD23F', edge: '#E0A800', ring: '#FFFFFF', text: '#3A2A00' },
}

const FALLBACK_THEME: ChipTheme = { face: '#FFD23F', edge: '#E0A800', ring: '#FFFFFF', text: '#3A2A00' }

export function chipTheme(value: number): ChipTheme {
  return CHIP_THEMES[value] ?? FALLBACK_THEME
}

export const BOARD_THEME = {
  /** Top of the wooden frame. */
  frame: '#EFC995',
  /** Floor of the recessed cells. */
  slotFloor: '#DDB07B',
  /** Sides of the wooden base. */
  base: '#C99A62',
} as const

// Fredoka is the proposed font (P-2). Until it is loaded, a rounded system font takes over.
export const FONT_FAMILY = "'Fredoka', ui-rounded, 'Arial Rounded MT Bold', 'Varela Round', system-ui, sans-serif"
