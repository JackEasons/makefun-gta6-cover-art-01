// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, at the export size
// the `size` query names. `photos` picks comma-separated samples,
// `caption` the title, `sub` the subtitle, `layout` and `grade` the look,
// `zoom` (1–2.5) the crop of every photo in the scene.
// window.__shotReady is set once the scene is painted (see main.js).
export async function runShot(shot, query, setup) {
  const files = (query.get('photos') || 'sunset-boulevard.jpg,beach-pier.jpg,skyline.jpg').split(',').slice(0, 3);
  const caption = query.get('caption') || 'VICE NIGHTS';
  const sub = query.get('sub') || 'THREE FRAMES, ONE CITY';
  const layout = query.get('layout') || 'triptych';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || '1920x1080';
  const zoom = Math.min(2.5, Math.max(1, Number(query.get('zoom')) || 1));
  await setup(files, caption, sub, layout, grade, size, zoom);
}
