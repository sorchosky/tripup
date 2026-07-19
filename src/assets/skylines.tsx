/**
 * skylines.tsx — destination art for trip cards (issue #59).
 *
 * User-supplied photos, one per trip in `TRIPS` (CONTENT.md → Other trips). Each renders as a plain
 * `<img>` sized by the parent (`TripCard.module.css` → `.map` / `.rowThumb`, both `object-fit: cover`).
 * Kept as named components (not raw imports) so `TripCard`'s `Skyline: ComponentType` contract and every
 * existing call site (`HomeScreen`, `src/data/mock.ts`) are untouched — swapping the placeholder gradient
 * SVGs for real photos was a like-for-like replacement behind the same prop.
 */

import lisbonPhoto from './photos/lisbon-skyline.jpg';
import tokyoPhoto from './photos/tokyo-skyline.jpg';
import parisPhoto from './photos/paris-skyline.jpg';

export function LisbonSkyline() {
  return <img src={lisbonPhoto} alt="" />;
}

export function TokyoSkyline() {
  return <img src={tokyoPhoto} alt="" />;
}

export function ParisSkyline() {
  return <img src={parisPhoto} alt="" />;
}
