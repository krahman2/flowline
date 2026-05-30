import type { AccentKey } from '../types';

type Scale = Record<string, string>;

export const ACCENTS: Record<AccentKey, { label: string; swatch: string; scale: Scale }> = {
  indigo: {
    label: 'Indigo',
    swatch: '#4f6bf6',
    scale: {
      50: '#eef4ff',
      100: '#dce7ff',
      200: '#c0d3ff',
      300: '#97b5ff',
      400: '#6c8eff',
      500: '#4f6bf6',
      600: '#3a4fe3',
      700: '#2f3dc4',
      800: '#2a359e',
      900: '#28337d',
    },
  },
  blue: {
    label: 'Blue',
    swatch: '#0c87eb',
    scale: {
      50: '#eff8ff',
      100: '#dbeefe',
      200: '#b9ddfe',
      300: '#7cc2fd',
      400: '#36a3f9',
      500: '#0c87eb',
      600: '#0069c9',
      700: '#0154a3',
      800: '#064786',
      900: '#0b3c6f',
    },
  },
  emerald: {
    label: 'Emerald',
    swatch: '#10b981',
    scale: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
  },
  violet: {
    label: 'Violet',
    swatch: '#8b5cf6',
    scale: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  amber: {
    label: 'Amber',
    swatch: '#f59e0b',
    scale: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  rose: {
    label: 'Rose',
    swatch: '#f43f5e',
    scale: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    },
  },
};

export function applyAccent(accent: AccentKey) {
  const scale = ACCENTS[accent]?.scale ?? ACCENTS.indigo.scale;
  const root = document.documentElement;
  for (const [step, hex] of Object.entries(scale)) {
    root.style.setProperty(`--color-flow-${step}`, hex);
  }
}
