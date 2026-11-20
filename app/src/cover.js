// The poster engine: turns photos, a layout, a colour grade and a caption
// into GTA-style cover art on any canvas. Everything is drawn with the
// canvas 2D API, so the preview and the exported PNG are the same picture
// at different sizes. No Rockstar artwork, logo or font is used anywhere:
// the lettering is Anton, an OFL font shipped under app/fonts/, and the
// sample photos are original images made with an image model.
//
// v4: a cast-grid layout (seven character panels with role tags), poster
// furniture (quote bar, gold BEST CAST seal, billing block with a drawn
// barcode, COMING SOON), a striped-gradient title grown to about two
// thirds of the poster width, a letterspaced tagline above it and a
// handwritten-style subtitle below it. The default title is the original
// "NEON TIDE" — no Rockstar city name anywhere on the cover now.
// A caption written as "NEON / TIDE" stacks onto two lines.

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
  midnight: {
    label: 'Midnight Vice',
    washTop: 'rgba(64, 16, 120, 0.22)',
    washBottom: 'rgba(255, 20, 130, 0.42)',
    band: '#ff2e88',
    accent: '#00e5ff',
    glow: 'rgba(255, 30, 140, 0.60)',
  },
};

/** The seven faces of the cast-grid poster: file, role tag and picker label. */
export const CAST = [
  { file: 'hero-driver.jpg', role: 'THE DRIVER', label: 'Sunset Driver' },
  { file: 'fixer.jpg', role: 'THE FIXER', label: 'Silver Fixer' },
  { file: 'mechanic.jpg', role: 'THE MECHANIC', label: 'Neon Mechanic' },
  { file: 'captain.jpg', role: 'THE CAPTAIN', label: 'Harbor Captain' },
  { file: 'rider.jpg', role: 'THE RIDER', label: 'Night Rider' },
  { file: 'boss.jpg', role: 'THE BOSS', label: 'Rooftop Boss' },
  { file: 'lookout.jpg', role: 'THE LOOKOUT', label: 'Rooftop Lookout' },
];

export const LAYOUTS = {
  cast: { label: 'Cast grid · 7 panels', panels: 7 },
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
  // The bottom strip is reserved for the billing block on every layout,
  // so the photos never run into the credits and the barcode.
  const billH = Math.round(h * 0.085);
  const innerW = w - edge * 2;
  const innerH = h - edge * 2 - billH;
  if (layout === 'cast') {
    // Seven character panels around one big hero: the hero takes the
    // left in landscape (or the top in portrait), the other six fill a
    // 2 x 3 grid beside (or below) it. Each panel carries its role tag.
    if (w >= h) {
      const heroW = innerW * 0.44;
      const sideW = innerW - heroW - gap;
      const cellW = (sideW - gap) / 2;
      const cellH = (innerH - gap * 2) / 3;
      const panels = [{ x: edge, y: edge, w: heroW, h: innerH, role: CAST[0].role }];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          const i = 1 + r * 2 + c;
          panels.push({
            x: edge + heroW + gap + c * (cellW + gap),
            y: edge + r * (cellH + gap),
            w: cellW, h: cellH, role: CAST[i].role,
          });
        }
      }
      return panels;
    }
    const heroH = innerH * 0.42;
    const cellW = (innerW - gap) / 2;
    const cellH = (innerH - heroH - gap - gap * 2) / 3;
    const panels = [{ x: edge, y: edge, w: innerW, h: heroH, role: CAST[0].role }];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const i = 1 + r * 2 + c;
        panels.push({
          x: edge + c * (cellW + gap),
          y: edge + heroH + gap + r * (cellH + gap),
          w: cellW, h: cellH, role: CAST[i].role,
        });
      }
    }
    return panels;
  }
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
  g.addColorStop(1, 'rgba(8, 0, 18, 0.46)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A faint halftone dot print over the lower band, for the comic-book poster feel. Kept coarse and light on purpose: fine dots add nothing at poster size but bloat the exported PNG. */
function paintHalftone(ctx, w, h, accent) {
  const top = h * 0.62;
  const step = Math.max(14, Math.round(w * 0.011));
  const r = step * 0.22;
  ctx.save();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.06;
  let row = 0;
  for (let y = top + step / 2; y < h; y += step, row++) {
    const offset = row % 2 ? step : step / 2;
    for (let x = offset; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Split a caption into at most two lines that fit the width. A " / " in
 * the caption forces the break there, so "VICE / CITY" always stacks.
 */
function wrapCaption(ctx, text, maxWidth) {
  const parts = text.split(' / ').map((s) => s.trim()).filter(Boolean);
  const lines = [];
  for (const part of parts) {
    const words = part.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (ctx.measureText(trial).width <= maxWidth || !line) line = trial;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    if (lines.length >= 2) break;
  }
  const shown = lines.slice(0, 2);
  const usedWords = shown.join(' ').split(/\s+/).filter(Boolean).length;
  const totalWords = text.replace(/ \/ /g, ' ').split(/\s+/).filter(Boolean).length;
  if (shown.length === 2 && usedWords < totalWords) shown[1] = `${shown[1]}…`;
  return shown;
}

/** The bold display lettering: Anton, striped sunset gradient fill, thick dark outline, hard shadow, slight lean. The tagline sits above the title, the handwritten subtitle below it, and the whole block stops above the billing strip. */
function paintTitle(ctx, title, subtitle, tagline, grade, w, h) {
  const billH = Math.round(h * 0.085);
  const margin = w * 0.045;
  const maxW = w - margin * 2;
  const clean = title.trim().toUpperCase();
  if (!clean) return;

  // Grow the type until the widest line spans about two thirds of the
  // poster, capped so one line never outgrows the band. One-line titles
  // get the biggest letters; stacked titles grow to the same cap.
  const sizeCap = Math.round(h * 0.25);
  let size = Math.round(h * 0.16);
  let lines = [];
  let widest = 0;
  for (;;) {
    ctx.font = `${size}px Anton, sans-serif`;
    lines = wrapCaption(ctx, clean, maxW);
    widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    if (widest >= maxW * 0.66 || (lines.length > 1 && widest >= maxW * 0.5) || size >= sizeCap) break;
    const next = size + 4;
    ctx.font = `${next}px Anton, sans-serif`;
    const nextWidest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    if (nextWidest > maxW) break;
    size = next;
  }
  ctx.font = `${size}px Anton, sans-serif`;
  lines = wrapCaption(ctx, clean, maxW);
  widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);

  // Safety valve: a stacked title must never eat more than half the poster
  // height, or the tagline would climb into the quote bar and the title
  // would bury the whole cast grid. Shrink and re-wrap if it overflows.
  const maxStack = Math.round(h * 0.5);
  if (lines.length * size * 1.04 > maxStack) {
    size = Math.max(24, Math.floor(maxStack / (lines.length * 1.04)));
    ctx.font = `${size}px Anton, sans-serif`;
    lines = wrapCaption(ctx, clean, maxW);
    widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
  }

  const lineH = size * 1.04;
  const subSize = Math.max(15, Math.round(size * 0.26));
  const tagSize = Math.max(12, Math.round(size * 0.15));
  // Bottom-up stack: billing strip, handwritten subtitle, title lines, tagline.
  const subY = h - billH - Math.round(margin * 0.45);
  const titleBottom = subY - subSize * 1.5;
  const tagY = titleBottom - lines.length * lineH - tagSize * 1.4;

  // The dark fade behind the block, so the letters read over any photo.
  const fadeTop = tagY - tagSize * 2.4;
  const fade = ctx.createLinearGradient(0, fadeTop, 0, h - billH);
  fade.addColorStop(0, 'rgba(10, 2, 20, 0)');
  fade.addColorStop(0.5, 'rgba(10, 2, 20, 0.62)');
  fade.addColorStop(1, 'rgba(10, 2, 20, 0.88)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, fadeTop, w, h - billH - fadeTop);

  // Tagline in letterspaced caps, the grade's accent colour. On narrow
  // posters a long tagline would run off the right edge, so shrink it
  // (font and spacing together) until the spaced line fits the poster.
  const tag = (tagline || '').trim().toUpperCase();
  if (tag) {
    let drawTagSize = tagSize;
    let drawTagSpacing = Math.round(drawTagSize * 0.3);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
    while (drawTagSize > 12) {
      ctx.font = `${drawTagSize}px Anton, sans-serif`;
      const wTag = ctx.measureText(tag).width + drawTagSpacing * Math.max(0, tag.length - 1);
      if (wTag <= maxW) break;
      drawTagSize = Math.max(12, Math.round(drawTagSize * 0.9));
      drawTagSpacing = Math.round(drawTagSize * 0.3);
    }
    ctx.font = `${drawTagSize}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${drawTagSpacing}px`; } catch (e) { /* older canvas: no letter spacing */ }
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tag, margin, tagY);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* reset */ }
  }

  // Title lines with a striped sunset fill: pink, orange and gold bands
  // across the widest line, under a hard offset shadow and a thick outline.
  // The font is set here on purpose: the tagline above set it to its own
  // small size, and the title must come back to the big display size.
  ctx.font = `${size}px Anton, sans-serif`;
  const stripes = ctx.createLinearGradient(margin, 0, margin + widest, 0);
  stripes.addColorStop(0, '#ffd23e');
  stripes.addColorStop(0.22, '#ff7a3d');
  stripes.addColorStop(0.45, '#ff2e88');
  stripes.addColorStop(0.68, '#ff7a3d');
  stripes.addColorStop(0.86, '#ffb347');
  stripes.addColorStop(1, '#ff2e88');
  let y = titleBottom - (lines.length - 1) * lineH;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const lineText of lines) {
    ctx.save();
    ctx.translate(margin, y);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(12, 2, 24, 0.85)';
    ctx.fillText(lineText, size * 0.045, size * 0.06);
    ctx.strokeStyle = 'rgba(16, 2, 28, 0.95)';
    ctx.lineWidth = Math.max(5, size * 0.18);
    ctx.strokeText(lineText, 0, 0);
    ctx.fillStyle = stripes;
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = size * 0.22;
    ctx.fillText(lineText, 0, 0);
    ctx.restore();
    y += lineH;
  }

  // Handwritten subtitle under the title, in a cursive stack (no font
  // is downloaded: the system cursive face is used, and the slight tilt
  // keeps the signature feel even where it falls back to a plain face).
  const sub = (subtitle || '').trim();
  if (sub) {
    ctx.save();
    ctx.translate(margin, subY);
    ctx.rotate(-0.02);
    ctx.font = `italic ${subSize}px 'Segoe Script', 'Brush Script MT', 'Snell Roundhand', cursive`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(sub, 0, 0);
    ctx.restore();
  }
}

/** A deterministic pseudo-random stream from a seed, for the barcode. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** The quote bar across the top: five stars, a press quote and VOL. 1. */
function paintQuoteBar(ctx, grade, w, h) {
  const barH = Math.round(h * 0.052);
  ctx.fillStyle = 'rgba(10, 2, 20, 0.8)';
  ctx.fillRect(0, 0, w, barH);
  const size = Math.max(13, Math.round(h * 0.021));
  const margin = w * 0.045;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const cy = barH / 2;
  ctx.font = `${size}px sans-serif`;
  ctx.fillStyle = '#ffc46b';
  ctx.fillText('★★★★★', margin, cy);
  const starsW = ctx.measureText('★★★★★').width;
  ctx.font = `italic ${size}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText('“A sunset heist for the ages”', margin + starsW + size * 0.8, cy);
  const quoteW = ctx.measureText('“A sunset heist for the ages”').width;
  ctx.font = `${Math.round(size * 0.85)}px Anton, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('— COASTLINE CHRONICLE', margin + starsW + size * 0.8 + quoteW + size * 0.6, cy);
  ctx.font = `${Math.round(size * 0.95)}px Anton, sans-serif`;
  ctx.fillStyle = grade.accent;
  ctx.textAlign = 'right';
  ctx.fillText('VOL. 1', w - margin, cy);
}

/** A gold BEST CAST seal, tilted like a sticker, top right. */
function paintSeal(ctx, grade, w, h) {
  // Tucked into the top-right corner so its spikes never reach the
  // top-right panel's role tag: the centre sits almost on the corner,
  // leaving the tag's full text clear on every poster size.
  const r = Math.max(26, Math.round(Math.min(w, h) * 0.044));
  const cx = w - Math.round(w * 0.045) - r * 0.35;
  const cy = Math.round(h * 0.052) + r * 0.85;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.14);
  // Starburst edge: short spikes around the rim.
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  const spikes = 16;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.98 : r * 1.12;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = '#ffc46b';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.strokeStyle = '#8a5a12';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#4a2c00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.fillText('★', 0, -r * 0.42);
  ctx.font = `${Math.round(r * 0.30)}px Anton, sans-serif`;
  ctx.fillText('BEST', 0, -r * 0.02);
  ctx.fillText('CAST', 0, r * 0.32);
  ctx.restore();
}

/** The billing strip at the bottom: credits, COMING SOON and a drawn barcode. */
function paintBilling(ctx, title, grade, w, h) {
  const billH = Math.round(h * 0.085);
  const y0 = h - billH;
  ctx.fillStyle = '#0a0214';
  ctx.fillRect(0, y0, w, billH);
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, y0, w, Math.max(2, Math.round(h * 0.004)));
  const margin = w * 0.045;
  const size = Math.max(10, Math.round(h * 0.0155));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('STARRING THE DRIVER · THE FIXER · THE MECHANIC · THE CAPTAIN · THE RIDER · THE BOSS · THE LOOKOUT', w / 2, y0 + billH * 0.3);
  ctx.font = `${Math.round(size * 1.15)}px Anton, sans-serif`;
  ctx.fillStyle = grade.accent;
  ctx.textAlign = 'left';
  ctx.fillText('COMING SOON', margin, y0 + billH * 0.72);
  // A barcode drawn from the title, so the same title always prints the same bars.
  let seed = 7;
  for (const ch of title) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = seeded(seed);
  const unit = Math.max(1, Math.round(w / 900));
  const barW = Math.round(w * 0.085);
  const barH = billH * 0.52;
  let bx = w - margin - barW;
  const by = y0 + billH * 0.72 - barH / 2;
  ctx.fillStyle = '#ffffff';
  while (bx < w - margin) {
    const bw = (1 + Math.floor(rnd() * 4)) * unit;
    const gapB = Math.floor(rnd() * 3) * unit;
    ctx.fillRect(bx, by, bw, barH);
    bx += bw + gapB;
  }
}

/** A role tag on a cast panel: a dark chip with the role in Anton. */
function paintRoleTag(ctx, panel, topPad) {
  const size = Math.max(13, Math.min(30, Math.round(panel.h * 0.14)));
  ctx.font = `${size}px Anton, sans-serif`;
  const tw = ctx.measureText(panel.role).width;
  const padX = Math.round(size * 0.55);
  const padY = Math.round(size * 0.4);
  const bx = panel.x + Math.max(6, Math.round(panel.w * 0.025));
  const by = panel.y + topPad;
  ctx.fillStyle = 'rgba(10, 2, 20, 0.88)';
  ctx.fillRect(bx, by, tw + padX * 2, size + padY * 2);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(panel.role, bx + padX, by + padY + size * 0.78);
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
  // The cast grid paints the seven character portraits; every other
  // layout paints the editor's three photo slots.
  const isCast = state.layout === 'cast';
  const sourcePhotos = isCast ? (state.cast || []) : state.photos;
  const assignment = panelPhotos(state.layout, sourcePhotos.length);
  const gap = Math.min(w, h) * 0.012;
  panels.forEach((panel, i) => {
    const photo = sourcePhotos[assignment[i]];
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
  paintHalftone(ctx, w, h, grade.accent);
  // The seal goes under the role tags: its spikes reach into the top-right
  // panel's corner, and the tag box paints cleanly over them instead of
  // the seal clipping the tag's last letters. It stays above the quote
  // bar so its gold is never dimmed by the bar's dark strip.
  paintQuoteBar(ctx, grade, w, h);
  paintSeal(ctx, grade, w, h);
  // Role tags stay crisp on top of the wash: top of each panel, dropped
  // below the quote bar on the top row.
  if (isCast) {
    const quoteH = Math.round(h * 0.052);
    const edge = Math.round(Math.min(w, h) * 0.02);
    panels.forEach((panel) => {
      if (panel.role) paintRoleTag(ctx, panel, panel.y <= edge + 1 ? quoteH + 8 : 8);
    });
  }
  paintBilling(ctx, state.title, grade, w, h);
  paintTitle(ctx, state.title, state.subtitle, state.tagline || '', grade, w, h);
}

/** A fresh canvas with the poster rendered at exactly w×h. */
export function exportPoster(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  paintPoster(canvas, state);
  return canvas;
}
