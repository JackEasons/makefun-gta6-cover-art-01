// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone, at the export size
// the `size` query names. `photos` picks comma-separated samples,
// `caption` the title, `sub` the subtitle, `layout` and `grade` the look.
// window.__shotReady is set once the scene is painted (see main.js).
export async function runShot(shot, query, setup) {
  const files = (query.get('photos') || 'sunset-boulevard.jpg,beach-pier.jpg,skyline.jpg').split(',').slice(0, 3);
  const caption = query.get('caption') || 'VICE NIGHTS';
  const sub = query.get('sub') || 'THREE FRAMES, ONE CITY';
  const layout = query.get('layout') || 'triptych';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || '1920x1080';
  await setup(files, caption, sub, layout, grade, size);
}
