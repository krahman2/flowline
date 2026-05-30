export const MARK_IDS = [
  'path',
  'pulse',
  'orbit',
  'layers',
  'spark',
  'target',
  'wave',
  'book',
  'code',
] as const;

export type MarkId = (typeof MARK_IDS)[number];
