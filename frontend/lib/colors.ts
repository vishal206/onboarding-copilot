/* Single source of truth for brand colors.
   Use these in JS contexts (recharts, inline styles).
   CSS contexts: use Tailwind utilities (bg-ember, text-teal, etc.) */

export const COLORS = {
  /* Primary action */
  ember:      '#111111',
  emberLight: '#f0fdf4',
  emberDark:  '#15803d',

  /* AI accent / green */
  teal:       '#4ADE80',
  tealLight:  '#f0fdf4',
  tealDark:   '#15803d',

  /* Status badge variants */
  status: {
    indexed:    { bg: '#EAF3DE', text: '#3B6D11', darkBg: '#27500A', darkText: '#C0DD97' },
    parsing:    { bg: '#FAEEDA', text: '#854F0B', darkBg: '#633806', darkText: '#FAC775' },
    failed:     { bg: '#FCEBEB', text: '#A32D2D', darkBg: '#501313', darkText: '#F09595' },
    aiAnswered: { bg: '#f0fdf4', text: '#15803d', darkBg: '#04342C', darkText: '#9FE1CB' },
  },
} as const;
