import m from './frames.json'
export type SeqSet = 'desktop' | 'mobile'
export const frames = m
export const frameUrl = (set: SeqSet, i: number) =>
  `${import.meta.env.BASE_URL}frames/${set}/${String(i).padStart(3, '0')}.webp`
/** Desktop indices of the clearest source frames (see sourceFrames in frames.json). */
export const SHOT = { rest: 0, reveal: 64, settle: 92 }
