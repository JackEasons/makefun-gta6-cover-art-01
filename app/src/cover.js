// The poster engine: turns photos, a layout, a colour grade and a caption
// into GTA-style cover art on any canvas. Everything is drawn with the
// canvas 2D API, so the preview and the exported PNG are the same picture
// at different sizes. No Rockstar artwork, logo or font is used anywhere:
// the lettering is Anton, an OFL font shipped under app/fonts/.

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    washTop: 'rgba(255, 64, 128, 0.10)',
    washBottom: 'rgba(255, 138, 42, 0.30)',
    band: '#ff2e88',
    accent: '#ffc46b',
    glow: 'rgba(255, 170, 60, 0.55)',
  },
  neon: {
    label: 'Neon Nights',
    washTop: 'rgba(0, 224, 255, 0.14)',
    washBottom: 'rgba(255, 0, 170, 0.32)',
    band: '#00d5ff',
    accent: '#ff5ce1',
    glow: 'rgba(0, 229, 255, 0.50)',
  },
  dusk: {
    label: 'Palm Dusk',
    washTop: 'rgba(96, 44, 180, 0.20)',
    washBottom: 'rgba(0, 190, 170, 0.24)',
    band: '#7b4dff',
    accent: '#8ef5e0',
    glow: 'rgba(150, 90, 255, 0.50)',
  },
  gold: {
    label: 'Gold Hour',
    washTop: 'rgba(255, 190, 80, 0.16)',
    washBottom: 'rgba(0, 140, 150, 0.38)',
    band: '#ffb347',
    accent: '#2dd4c4',
    glow: 'rgba(255, 180, 60, 0.55)',
  },
};

export const LAYOUTS = {
  triptych: { label: 'Triptych · 3 panels', panels: 3 },
  grid: { label: 'Grid · 2 × 2', panels: 4 },
  hero: { label: 'Hero + strip', panels: 3 },
  diagonal: { label: 'Diagonal split · 2 panels', panels: 2 },
  single: { label: 'Single photo', panels: 1 },
};

export const SIZES = {
  '1920x1080': { w: 1920, h: 1080, label: '1920 × 1080' },
  '1080x1080': { w: 1080, h: 1080, label: '1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: '1080 × 1350' },
};

/** The panel rectangles for a layout inside a W×H poster, with gutters. */
export function posterPanels(layout, w, h) {
  const gap = Math.round(Math.min(w, h) * 0.012);
  const edge = Math.round(Math.min(w, h) * 0.02);
  const innerW = w - edge * 2;
  const innerH = h - edge * 2;
  if (layout === 'triptych') {
    const pw = (innerW - gap * 2) / 3;
    return [0, 1, 2].map((i) => ({ x: edge + i * (pw + gap), y: edge, w: pw, h: innerH }));
  }
  if (layout === 'grid') {
    const pw = (innerW - gap) / 2;
    const ph = (innerH - gap) / 2;
    return [
      { x: edge, y: edge, w: pw, h: ph },
      { x: edge + pw + gap, y: edge, w: pw, h: ph },
      { x: edge, y: edge + ph + gap, w: pw, h: ph },
      { x: edge + pw + gap, y: edge + ph + gap, w: pw, h: ph },
    ];
  }
  if (layout === 'hero') {
    const heroW = innerW * 0.62;
    const sideW = innerW - heroW - gap;
    const sideH = (innerH - gap) / 2;
    return [
      { x: edge, y: edge, w: heroW, h: innerH },
      { x: edge + heroW + gap, y: edge, w: sideW, h: sideH },
      { x: edge + heroW + gap, y: edge + sideH + gap, w: sideW, h: sideH },
    ];
  }
  if (layout === 'diagonal') {
    // Two quadrilaterals split by one rising diagonal: the top panel
    // holds the sky, the bottom one the street. Each panel keeps its
    // bounding box in x/y/w/h (for photo cover-fit and hit-testing) and
    // its true shape in poly (for clipping and the white seam).
    const cutTop = edge + innerH * 0.30;
    const cutBottom = edge + innerH * 0.70;
    const top = {
      x: edge, y: edge, w: innerW, h: cutBottom - edge,
      poly: [[edge, edge], [edge + innerW, edge], [edge + innerW, cutTop], [edge, cutBottom]],
    };
    const bottom = {
      x: edge, y: cutTop, w: innerW, h: edge + innerH - cutTop,
      poly: [[edge, cutBottom], [edge + innerW, cutTop], [edge + innerW, edge + innerH], [edge, edge + innerH]],
    };
    return [top, bottom];
  }
  return [{ x: edge, y: edge, w: innerW, h: innerH }];
}

/** Which photo fills each panel: the layout cycles the loaded photos. */
export function panelPhotos(layout, photoCount) {
  const n = LAYOUTS[layout].panels;
  const out = [];
  for (let i = 0; i < n; i++) out.push(photoCount === 0 ? -1 : i % photoCount);
  return out;
}

/** Draw one photo into a panel, cover-fit, at its zoom and focus point. */
function paintPhoto(ctx, img, panel, zoom, fx, fy) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(panel.w / iw, panel.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = panel.x + (panel.w - dw) * fx;
  const dy = panel.y + (panel.h - dh) * fy;
  ctx.save();
  ctx.beginPath();
  if (panel.poly) {
    panel.poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
  } else {
    ctx.rect(panel.x, panel.y, panel.w, panel.h);
  }
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

/** A soft radial darkening towards the edges, for the poster feel. */
function paintVignette(ctx, w, h) {
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  g.addColorStop(0, 'rgba(8, 0, 18, 0)');
  g.addColorStop(1, 'rgba(8, 0, 18, 0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Split a caption into at most two lines that fit the width. */
function wrapCaption(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !line) line = trial;
    else {
      lines.push(line);
      line = word;
    }
    if (lines.length === 2) break;
  }
  if (line && lines.length < 2) lines.push(line);
  if (lines.length === 2 && words.length > 0) {
    const used = lines.join(' ').split(/\s+/).length;
    if (used < words.length) lines[1] = `${lines[1]}…`;
  }
  return lines;
}

/** The bold display lettering: Anton, white fill, dark outline, slight lean. */
function paintTitle(ctx, title, subtitle, grade, w, h) {
  const bandH = h * 0.24;
  const bandY = h - bandH;
  const fade = ctx.createLinearGradient(0, bandY - h * 0.12, 0, h);
  fade.addColorStop(0, 'rgba(10, 2, 20, 0)');
  fade.addColorStop(0.45, 'rgba(10, 2, 20, 0.72)');
  fade.addColorStop(1, 'rgba(10, 2, 20, 0.92)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, bandY - h * 0.12, w, h - bandY + h * 0.12);

  const margin = w * 0.045;
  const maxW = w - margin * 2;
  const clean = title.trim().toUpperCase();
  if (clean) {
    let size = h * 0.155;
    ctx.font = `${size}px Anton, sans-serif`;
    while (size > 20 && ctx.measureText(clean).width > maxW) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const lines = wrapCaption(ctx, clean, maxW);
    const lineH = size * 1.02;
    let y = h - margin * 0.9 - (lines.length - 1) * lineH;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (const lineText of lines) {
      ctx.save();
      ctx.translate(margin, y);
      ctx.transform(1, 0, -0.07, 1, 0, 0);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(16, 2, 28, 0.95)';
      ctx.lineWidth = Math.max(4, size * 0.14);
      ctx.strokeText(lineText, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 46, 136, 0.55)';
      ctx.shadowBlur = size * 0.18;
      ctx.fillText(lineText, 0, 0);
      ctx.restore();
      y += lineH;
    }
    const sub = subtitle.trim().toUpperCase();
    if (sub) {
      const subSize = Math.max(16, size * 0.24);
      ctx.font = `${subSize}px Anton, sans-serif`;
      try { ctx.letterSpacing = `${Math.round(subSize * 0.28)}px`; } catch (e) { /* older canvas: no letter spacing */ }
      const subY = h - margin * 0.9 - lines.length * lineH - subSize * 1.5;
      const subW = ctx.measureText(sub).width;
      ctx.fillStyle = grade.band;
      const pad = subSize * 0.7;
      ctx.fillRect(margin, subY - subSize - pad * 0.4, subW + pad * 2, subSize + pad);
      ctx.fillStyle = '#14081f';
      ctx.fillText(sub, margin + pad, subY);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* reset */ }
    }
  }
}

/** Paint the whole poster onto `canvas` from `state`. */
export function paintPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.12, 0, w * 0.5, h * 0.12, w * 0.55);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const panels = posterPanels(state.layout, w, h);
  const assignment = panelPhotos(state.layout, state.photos.length);
  const gap = Math.min(w, h) * 0.012;
  panels.forEach((panel, i) => {
    const photo = state.photos[assignment[i]];
    if (photo && photo.img) {
      paintPhoto(ctx, photo.img, panel, photo.zoom || 1, photo.fx ?? 0.5, photo.fy ?? 0.5);
    } else {
      ctx.fillStyle = '#241335';
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = `${Math.round(panel.h * 0.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('ADD A PHOTO', panel.x + panel.w / 2, panel.y + panel.h / 2);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(2, gap * 0.35);
    if (panel.poly) {
      ctx.beginPath();
      panel.poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    }
  });

  // The diagonal split gets its slash redrawn once, thicker, so the cut
  // reads as one bold design line instead of two panel edges meeting.
  if (state.layout === 'diagonal' && panels[0].poly) {
    const seam = panels[0].poly;
    ctx.beginPath();
    ctx.moveTo(seam[3][0], seam[3][1]);
    ctx.lineTo(seam[2][0], seam[2][1]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = Math.max(3, gap * 1.1);
    ctx.stroke();
  }

  const wash = ctx.createLinearGradient(0, 0, w * 0.25, h);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  paintVignette(ctx, w, h);
  paintTitle(ctx, state.title, state.subtitle, grade, w, h);
}

/** A fresh canvas with the poster rendered at exactly w×h. */
export function exportPoster(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  paintPoster(canvas, state);
  return canvas;
}
