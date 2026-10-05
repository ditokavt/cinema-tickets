/**
 * Design scale.
 *
 * Every Figma frame of Kino XII is 1728px wide. The brief asks for the build to
 * be checked at 1920×1080, so from 1728px up the whole page is scaled by
 * viewport / 1728 (capped at 1920): at 1920 the screen shows the 1728 frame
 * exactly, just 11% larger, instead of the frame floating in empty margins.
 * Below 1728 nothing is scaled and the layout is fluid as usual.
 *
 * To turn the scaling off (content then simply centres at 1728), set
 * SCALE_TO_VIEWPORT to false. That is the only switch.
 */
export const SCALE_TO_VIEWPORT = true;
export const DESIGN_WIDTH = 1728;
export const MAX_SCALED_WIDTH = 1920;

function apply() {
  const root = document.documentElement;
  const width = window.innerWidth;
  const zoom = SCALE_TO_VIEWPORT && width > DESIGN_WIDTH ? Math.min(width, MAX_SCALED_WIDTH) / DESIGN_WIDTH : 1;
  root.style.zoom = zoom === 1 ? '' : String(zoom);
  root.style.setProperty('--zoom', String(zoom));
}

export function initScale() {
  apply();
  window.addEventListener('resize', apply);
}
