/* Single source of truth for brand colors.
   Use these in JS contexts (recharts, inline styles).
   CSS contexts: use Tailwind utilities (bg-ember, text-teal, etc.) */

export const COLORS = {
  /* Brand */
  ember:      '#E8925A',
  emberLight: '#FAF0E8',
  emberDark:  '#B5622A',

  /* AI accent */
  teal:       '#1D9E75',
  tealLight:  '#E1F5EE',
  tealDark:   '#0F6E56',

  /* Status badge variants */
  status: {
    indexed:    { bg: '#EAF3DE', text: '#3B6D11', darkBg: '#27500A', darkText: '#C0DD97' },
    parsing:    { bg: '#FAEEDA', text: '#854F0B', darkBg: '#633806', darkText: '#FAC775' },
    failed:     { bg: '#FCEBEB', text: '#A32D2D', darkBg: '#501313', darkText: '#F09595' },
    aiAnswered: { bg: '#E1F5EE', text: '#0F6E56', darkBg: '#04342C', darkText: '#9FE1CB' },
  },
} as const;
