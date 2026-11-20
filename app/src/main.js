// Wires the editor: photo slots, layout and grade pickers, caption fields,
// drag-to-pan on the preview, zoom sliders and PNG export. A `?shot=`
// query sets up a fixed scene for a screenshot instead (see shots.js).

import { GRADES, LAYOUTS, SIZES, exportPoster, paintPoster, panelPhotos, posterPanels } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { file: 'hero-driver.jpg', label: 'Sunset Driver' },
  { file: 'neon-alley.jpg', label: 'Neon Street' },
  { file: 'sunset-boulevard.jpg', label: 'Sunset Boulevard' },
  { file: 'beach-pier.jpg', label: 'Beach Pier' },
  { file: 'skyline.jpg', label: 'Skyline' },
  { file: 'boulevard.jpg', label: 'Boulevard' },
  { file: 'pier.jpg', label: 'Pier' },
];

const state = {
  layout: 'triptych',
  grade: 'sunset',
  title: 'VICE NIGHTS',
  subtitle: 'THREE FRAMES, ONE CITY',
  size: '1920x1080',
  photos: [null, null, null],
  active: 0,
};

const preview = document.getElementById('preview');
const statusBox = document.getElementById('status');
const slotBox = document.getElementById('slots');

function say(text) {
  statusBox.textContent = text;
}

/** Load an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function currentSize() {
  return SIZES[state.size];
}

function redraw() {
  const size = currentSize();
  if (preview.width !== size.w || preview.height !== size.h) {
    preview.width = size.w;
    preview.height = size.h;
  }
  paintPoster(preview, state);
}

function photoState(i) {
  return state.photos[i];
}

/** Put an image into slot i, keeping its crop where it was if it had one. */
function setPhoto(i, img, name) {
  const old = state.photos[i];
  state.photos[i] = {
    img,
    name,
    zoom: old ? old.zoom : 1,
    fx: old ? old.fx : 0.5,
    fy: old ? old.fy : 0.5,
  };
  state.active = i;
  buildSlots();
  redraw();
}

async function loadSample(i, file) {
  try {
    const img = await loadImage(`samples/${file}`);
    setPhoto(i, img, file);
    say(`${SAMPLES.find((s) => s.file === file)?.label || file} loaded into photo ${i + 1}.`);
  } catch (e) {
    say(`Could not load ${file}.`);
  }
}

function buildSlots() {
  slotBox.textContent = '';
  for (let i = 0; i < 3; i++) {
    const photo = photoState(i);
    const slot = document.createElement('div');
    slot.className = `slot${state.active === i ? ' active' : ''}`;

    const head = document.createElement('div');
    head.className = 'slot-head';
    const name = document.createElement('strong');
    name.textContent = `Photo ${i + 1}`;
    const picked = document.createElement('span');
    picked.className = 'slot-name';
    picked.textContent = photo ? photo.name : 'empty';
    head.append(name, picked);
    slot.append(head);

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (photo) {
      const img = document.createElement('img');
      img.src = photo.img.src;
      img.alt = `Photo ${i + 1}`;
      thumb.append(img);
    } else {
      thumb.textContent = 'No photo yet';
    }
    thumb.addEventListener('click', () => { state.active = i; buildSlots(); });
    slot.append(thumb);

    const fileLabel = document.createElement('label');
    fileLabel.className = 'file-btn';
    fileLabel.textContent = 'Upload a photo';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const img = await loadImage(URL.createObjectURL(file));
        setPhoto(i, img, file.name);
        say(`${file.name} loaded into photo ${i + 1}.`);
      } catch (err) {
        say('That file could not be read as a photo.');
      }
    });
    fileLabel.append(fileInput);
    slot.append(fileLabel);

    const sampleRow = document.createElement('div');
    sampleRow.className = 'sample-row';
    const sampleLabel = document.createElement('span');
    sampleLabel.textContent = 'Sample:';
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Sample photo for photo ${i + 1}`);
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'Pick one…';
    select.append(none);
    for (const s of SAMPLES) {
      const opt = document.createElement('option');
      opt.value = s.file;
      opt.textContent = s.label;
      select.append(opt);
    }
    select.addEventListener('change', () => {
      if (select.value) loadSample(i, select.value);
      select.value = '';
    });
    sampleRow.append(sampleLabel, select);
    slot.append(sampleRow);

    const zoomRow = document.createElement('div');
    zoomRow.className = 'zoom-row';
    const zoomLabel = document.createElement('label');
    zoomLabel.textContent = 'Zoom';
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '2.5';
    zoom.step = '0.05';
    zoom.value = String(photo ? photo.zoom : 1);
    zoom.setAttribute('aria-label', `Zoom for photo ${i + 1}`);
    zoom.addEventListener('input', () => {
      if (state.photos[i]) {
        state.photos[i].zoom = Number(zoom.value);
        redraw();
      }
    });
    zoomRow.append(zoomLabel, zoom);
    slot.append(zoomRow);

    const fillBtn = document.createElement('button');
    fillBtn.type = 'button';
    fillBtn.className = 'ghost';
    fillBtn.textContent = 'Use in every panel';
    fillBtn.disabled = !photo;
    fillBtn.addEventListener('click', () => {
      const src = state.photos[i];
      if (!src) return;
      for (let j = 0; j < 3; j++) {
        state.photos[j] = { img: src.img, name: src.name, zoom: src.zoom, fx: src.fx, fy: src.fy };
      }
      buildSlots();
      redraw();
      say(`${src.name} now fills every panel.`);
    });
    slot.append(fillBtn);
    slotBox.append(slot);
  }
}

function buildPickers() {
  const layoutBox = document.getElementById('layouts');
  for (const [key, def] of Object.entries(LAYOUTS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${state.layout === key ? ' on' : ''}`;
    btn.textContent = def.label;
    if (key === 'diagonal') btn.dataset.new = '1';
    btn.addEventListener('click', () => {
      state.layout = key;
      buildPickers();
      redraw();
    });
    layoutBox.append(btn);
  }
  const gradeBox = document.getElementById('grades');
  for (const [key, def] of Object.entries(GRADES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${state.grade === key ? ' on' : ''}`;
    btn.style.setProperty('--swatch', def.band);
    btn.textContent = def.label;
    if (key === 'midnight') btn.dataset.new = '1';
    btn.addEventListener('click', () => {
      state.grade = key;
      buildPickers();
      redraw();
    });
    gradeBox.append(btn);
  }
  const sizeBox = document.getElementById('sizes');
  for (const [key, def] of Object.entries(SIZES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${state.size === key ? ' on' : ''}`;
    btn.textContent = def.label;
    btn.addEventListener('click', () => {
      state.size = key;
      buildPickers();
      redraw();
    });
    sizeBox.append(btn);
  }
}

/** Ray-casting point-in-polygon test, for the diagonal layout's panels. */
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Which panel (and photo) sits under a point on the preview canvas. */
function panelAt(clientX, clientY) {
  const rect = preview.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * preview.width;
  const y = ((clientY - rect.top) / rect.height) * preview.height;
  const panels = posterPanels(state.layout, preview.width, preview.height);
  const assignment = panelPhotos(state.layout, state.photos.length);
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const inside = p.poly
      ? pointInPoly(x, y, p.poly)
      : (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (inside) {
      return { panel: p, photoIndex: assignment[i], x, y };
    }
  }
  return null;
}

let drag = null;
preview.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit || hit.photoIndex < 0) return;
  const photo = state.photos[hit.photoIndex];
  if (!photo) return;
  state.active = hit.photoIndex;
  buildSlots();
  drag = { photo, x: e.clientX, y: e.clientY, fx: photo.fx, fy: photo.fy, panel: hit.panel };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = preview.getBoundingClientRect();
  const scaleX = preview.width / rect.width;
  const dx = (e.clientX - drag.x) * scaleX;
  const dy = (e.clientY - drag.y) * scaleX;
  drag.photo.fx = Math.min(1, Math.max(0, drag.fx - dx / drag.panel.w));
  drag.photo.fy = Math.min(1, Math.max(0, drag.fy - dy / drag.panel.h));
  redraw();
});
preview.addEventListener('pointerup', () => { drag = null; });
preview.addEventListener('pointercancel', () => { drag = null; });

document.getElementById('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
document.getElementById('subtitle').addEventListener('input', (e) => {
  state.subtitle = e.target.value;
  redraw();
});

document.getElementById('export').addEventListener('click', () => {
  const size = currentSize();
  const canvas = exportPoster(state, size.w, size.h);
  canvas.toBlob((blob) => {
    if (!blob) {
      say('Export failed: the browser could not make the PNG.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${size.w}x${size.h}.png`;
    a.click();
    say(`Saved vice-city-cover-${size.w}x${size.h}.png`);
  }, 'image/png');
});

/** The same export as a data URL, for automated checks and screenshots. */
window.__exportPNG = (sizeKey) => {
  const size = SIZES[sizeKey] || currentSize();
  return exportPoster(state, size.w, size.h).toDataURL('image/png');
};

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
buildPickers();
buildSlots();

async function boot() {
  try {
    await document.fonts.load('100px Anton');
  } catch (e) { /* lettering falls back to a heavy sans */ }
  if (shot) {
    await runShot(shot, query, async (files, text, sub, layout, grade, size, zoom, fy) => {
      state.layout = layout;
      state.grade = grade;
      state.title = text;
      state.subtitle = sub;
      state.size = size;
      for (let i = 0; i < files.length; i++) {
        state.photos[i] = { img: await loadImage(`samples/${files[i]}`), name: files[i], zoom: zoom || 1, fx: 0.5, fy: fy ?? 0.5 };
      }
      buildPickers();
      buildSlots();
      redraw();
    });
    if (shot === 'cover') document.body.classList.add('shot-cover');
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  } else {
    await loadSample(0, 'sunset-boulevard.jpg');
    redraw();
  }
  document.fonts.ready.then(() => redraw());
}
boot();
