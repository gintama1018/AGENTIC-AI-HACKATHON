/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DESIGN.md §03 — Warm-neutral editorial palette
        canvas:   '#F5F2EC', // Primary application background
        surface:  '#FCFAF6', // Major surfaces, forms, focused content
        ink:      '#1C1B19', // Primary navigation, strong contrast controls
        charcoal: '#252421', // Headings and high-priority text
        graphite: '#5F5B54', // Descriptive copy, metadata, helper text
        ash:      '#8A847A', // Timestamps, low-priority labels
        stone:    '#D8D2C8', // Structural separators
        mist:     '#E8E3DB', // Light visual boundaries

        // DESIGN.md §03 — Semantic colors (meaning-only, never decorative branding)
        attention: {
          DEFAULT: '#A45636', // Burnt orange / terracotta
          soft:    '#F0E0D7',
        },
        success: {
          DEFAULT: '#68705A', // Muted olive
          soft:    '#E4E7DE',
        },
        critical: {
          DEFAULT: '#7D3F38', // Deep oxblood / brick
          soft:    '#EEDDD9',
        },
      },
      fontFamily: {
        // DESIGN.md §04 — Inter as primary, Source Serif 4 optional editorial accent
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        serif:  ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      fontSize: {
        // DESIGN.md §4.2 — Type scale
        'display': ['48px', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '600' }],
        'page-title': ['32px', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '600' }],
        'section': ['20px', { lineHeight: '1.25', fontWeight: '600' }],
        'subsection': ['16px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.55', fontWeight: '400' }],
        'compact': ['14px', { lineHeight: '1.45', fontWeight: '400' }],
        'meta': ['12px', { lineHeight: '1.35', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      spacing: {
        // DESIGN.md §06 — Base 4px grid
        '13': '52px',
        '18': '72px',
      },
      borderRadius: {
        // DESIGN.md §08 — No exaggerated pill shapes
        'control': '6px',
        'btn':     '7px',
        'field':   '7px',
        'surface': '8px',
        'card':    '10px',
      },
      boxShadow: {
        // DESIGN.md §09 — Single allowed shadow (dropdowns/drawers only)
        'float': '0 8px 28px rgba(28, 27, 25, 0.08)',
        // No glow, no colored shadows
      },
      maxWidth: {
        'workstation': '1280px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
