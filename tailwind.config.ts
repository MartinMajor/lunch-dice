import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  // darkMode: 'media', // TODO: Enable dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        icon: 'font-variation-settings',
      },
      screens: {
        'mobile-s': '320px',
        'mobile-m': '375px',
        'mobile-l': '425px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '1280px',
      },
    },
  },
  plugins: [
    plugin(({ addComponents }) => {
      addComponents({
        '.icon': {
          'user-select': 'none',
          'font-family': '"Material Symbols Outlined"',
          'font-weight': 'normal',
          'font-style': 'normal',
          'font-size': 'var(--material-symbols-size, 24px)',
          'line-height': '1',
          'letter-spacing': 'normal',
          'text-transform': 'none',
          display: 'inline-block',
          'white-space': 'nowrap',
          'word-wrap': 'normal',
          direction: 'ltr',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'text-rendering': 'optimizeLegibility',
          'font-feature-settings': '"liga"',
          'font-variation-settings': [
            `'FILL' var(--material-symbols-fill, 0)`,
            `'wght' var(--material-symbols-weight, 400)`,
            `'GRAD' var(--material-symbols-grade, 0)`,
            `'opsz' var(--material-symbols-optical-size, 24)`,
          ].join(', '),
        },
        '.icon-fill': {
          '--material-symbols-fill': '1',
        },
        '.icon-no-fill': {
          '--material-symbols-fill': '0',
        },

        '.icon-thin': { '--material-symbols-weight': '100' },
        '.icon-extralight': { '--material-symbols-weight': '200' },
        '.icon-light': { '--material-symbols-weight': '300' },
        '.icon-normal': { '--material-symbols-weight': '400' },
        '.icon-medium': { '--material-symbols-weight': '500' },
        '.icon-semibold': { '--material-symbols-weight': '600' },
        '.icon-bold': { '--material-symbols-weight': '700' },
        '.icon-extrabold': { '--material-symbols-weight': '800' },
        '.icon-black': { '--material-symbols-weight': '900' },

        '.icon-xs': {
          '--material-symbols-size': '1.125rem',
          '--material-symbols-optical-size': '18',
        },
        '.icon-sm': {
          '--material-symbols-size': '1.25rem',
          '--material-symbols-optical-size': '20',
        },
        '.icon-base': {
          '--material-symbols-size': '1.5rem',
          '--material-symbols-optical-size': '24',
        },
        '.icon-lg': {
          '--material-symbols-size': '1.875rem',
          '--material-symbols-optical-size': '30',
        },
        '.icon-xl': {
          '--material-symbols-size': '2.25rem',
          '--material-symbols-optical-size': '36',
        },
        '.icon-2xl': {
          '--material-symbols-size': '3rem',
          '--material-symbols-optical-size': '48',
        },
        '.icon-3xl': {
          '--material-symbols-size': '3.75rem',
          '--material-symbols-optical-size': '60',
        },
        '.icon-4xl': {
          '--material-symbols-size': '4.5rem',
          '--material-symbols-optical-size': '72',
        },
        '.icon-5xl': {
          '--material-symbols-size': '6rem',
          '--material-symbols-optical-size': '96',
        },
        '.icon-6xl': {
          '--material-symbols-size': '8rem',
          '--material-symbols-optical-size': '128',
        },
        '.icon-7xl': {
          '--material-symbols-size': '10rem',
          '--material-symbols-optical-size': '160',
        },
        '.icon-8xl': {
          '--material-symbols-size': '12rem',
          '--material-symbols-optical-size': '192',
        },
        '.icon-9xl': {
          '--material-symbols-size': '16rem',
          '--material-symbols-optical-size': '256',
        },
      });
    }),
  ],
};

export default config;
