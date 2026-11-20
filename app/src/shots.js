// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, at the export size
// the `size` query names. `photos` picks comma-separated samples — up to
// seven, the cast grid's full roster — `caption` the title, `sub` the
// handwritten subtitle, `tagline` the line above the title, `layout` and
// `grade` the look, `zoom` (1–2.5) the crop of every photo in the scene,
// `fy` (0–1) the vertical focus point shared by every photo — 0.35 keeps
// a cast portrait's face in a wide panel. A caption written as
// "NEON / TIDE" stacks onto two lines.
// window.__shotReady is set once the scene is painted (see main.js).
export async function runShot(shot, query, setup) {
  const files = (query.get('photos') || 'sunset-boulevard.jpg,beach-pier.jpg,skyline.jpg').split(',').slice(0, 7);
  const caption = query.get('caption') || 'NEON TIDE';
  const sub = query.get('sub') || 'one last summer on the coast';
  const tagline = query.get('tagline') || 'SEVEN FRIENDS · ONE COAST · NO WAY OUT';
  const layout = query.get('layout') || 'cast';
  const grade = query.get('grade') || 'midnight';
  const size = query.get('size') || '1920x1080';
  const zoom = Math.min(2.5, Math.max(1, Number(query.get('zoom')) || 1));
  const fy = Math.min(1, Math.max(0, Number(query.get('fy')) || 0.35));
  await setup(files, caption, sub, layout, grade, size, zoom, fy, tagline);
}
