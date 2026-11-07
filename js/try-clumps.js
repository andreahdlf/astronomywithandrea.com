/* ==========================================================================
   "Try it now": a small taste of ClumpScope on the home page.
   Three example H-alpha maps from ClumpScope. The first and last are the tutorial
   examples; the middle one is a real galaxy from the ClumpScope sample (subject
   805 in its manifest, see images/CREDITS.md), rendered the way the site shows it.
   The visitor drags circles around bright clumps, presses Submit, and gets a short
   verdict.
   Nothing is saved anywhere; the real classifying happens on clumpscope.com.
   To change the examples, edit the GALAXIES list below. Positions are
   fractions of the image (0 = left/top edge, 1 = right/bottom edge), placed by eye.
   ========================================================================== */

const GALAXIES = [
  {
    file: 'images/try-galaxy-1.webp',
    clumps: [{ x: 0.49, y: 0.46, r: 0.13 }],   // the one real clump
    streak: null,
    verdictClean: 'You circled the clump. On ClumpScope you would now rate this map "Clean" and submit.'
  },
  {
    // A real galaxy from the ClumpScope sample with three clear clumps in a row.
    // Positions placed by Andrea: the two bright blobs and the smaller one between them.
    // The faint patch further left is not counted as a clump.
    file: 'images/try-galaxy-2.webp',
    clumps: [
      { x: 0.437, y: 0.508, r: 0.05 },
      { x: 0.529, y: 0.492, r: 0.05 },
      { x: 0.628, y: 0.482, r: 0.055 }
    ],
    streak: null,
    verdictClean: 'All three. Three clumps in a row like this is a classic ClumpScope galaxy: each one is a region where new stars are being born. On ClumpScope you would now rate the map "Clean" and submit.'
  },
  {
    file: 'images/try-galaxy-3.webp',
    clumps: [],
    streak: null,
    verdictClean: 'Correct: there is no galaxy here, only noise. On ClumpScope you would rate it "Unusable". Knowing that is just as useful as finding clumps.'
  }
];

const canvas = document.getElementById('try-canvas');
const ctx = canvas.getContext('2d');
const counterText = document.getElementById('try-counter');
const circlesText = document.getElementById('try-circles');
const feedbackText = document.getElementById('try-feedback');
const undoButton = document.getElementById('try-undo');
const submitButton = document.getElementById('try-submit');
const nextButton = document.getElementById('try-next');

let galaxyIndex = 0;     // which example is showing
let image = new Image(); // the current map
let circles = [];        // circles the visitor has drawn, as fractions of the image
let drawing = null;      // a brand-new circle being dragged out right now, or null
let selected = -1;       // index of the selected circle (tap to select), or -1
let dragMode = null;     // while the pointer is down on an existing circle: 'move' or 'resize'
let dragOffset = { x: 0, y: 0 };   // for moving: where inside the circle the pointer grabbed it
let submitted = false;
const deleteButton = document.getElementById('try-delete');


/* ---------- Drawing ---------- */
function paint() {
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  if (image.complete && image.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0, size, size);
  }
  // Visitor's circles, in the same red as ClumpScope uses.
  const all = drawing ? circles.concat([drawing]) : circles;
  for (let i = 0; i < all.length; i++) {
    const c = all[i];
    ctx.beginPath();
    ctx.arc(c.x * size, c.y * size, Math.max(c.r * size, 2), 0, Math.PI * 2);
    ctx.lineWidth = i === selected ? 4 : 3;
    ctx.strokeStyle = i === selected ? '#ffd27a' : '#ff5c5c';   // selected circle is gold
    ctx.stroke();
  }
  // After Submit, show where the reference clumps are in white dashes.
  if (submitted) {
    for (const k of GALAXIES[galaxyIndex].clumps) {
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.arc(k.x * size, k.y * size, k.r * size, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function updateCircleText() {
  if (circles.length === 0) {
    circlesText.textContent = 'No circles yet. If you see no clumps, that is a valid answer.';
  } else if (circles.length === 1) {
    circlesText.textContent = '1 circle drawn.';
  } else {
    circlesText.textContent = circles.length + ' circles drawn.';
  }
  undoButton.disabled = circles.length === 0 || submitted;
  deleteButton.hidden = selected < 0 || submitted;
}

/* ---------- Loading an example ---------- */
function loadGalaxy(index) {
  galaxyIndex = index;
  circles = [];
  drawing = null;
  selected = -1;
  dragMode = null;
  submitted = false;
  feedbackText.textContent = '';
  feedbackText.className = 'try-feedback';
  nextButton.hidden = true;
  submitButton.hidden = false;
  counterText.textContent = 'Galaxy ' + (index + 1) + ' of ' + GALAXIES.length;
  image = new Image();
  image.onload = paint;
  image.src = GALAXIES[index].file;
  updateCircleText();
  paint();
}

function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

/* ---------- Pointer handling (mouse and touch) ----------
   touch-action: none in the CSS stops the page scrolling while dragging on the map. */
function pointerFraction(event) {
  const box = canvas.getBoundingClientRect();
  return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height };
}

// Which existing circle is under the pointer, and is the pointer on its edge?
// Returns { index, onEdge } or null. The edge is a band around the rim.
function hitTest(p) {
  for (let i = circles.length - 1; i >= 0; i--) {   // topmost (newest) first
    const c = circles[i];
    const d = distance(p, c);
    const edgeBand = Math.max(0.025, c.r * 0.3);
    if (Math.abs(d - c.r) < edgeBand) return { index: i, onEdge: true };
    if (d < c.r) return { index: i, onEdge: false };
  }
  return null;
}

canvas.addEventListener('pointerdown', (event) => {
  if (submitted) return;
  const p = pointerFraction(event);
  const hit = hitTest(p);
  if (hit) {
    // Press on an existing circle: select it, then drag to move (inside) or resize (edge).
    selected = hit.index;
    dragMode = hit.onEdge ? 'resize' : 'move';
    const c = circles[selected];
    dragOffset = { x: p.x - c.x, y: p.y - c.y };
  } else {
    // Press on empty map: start a brand-new circle.
    selected = -1;
    dragMode = null;
    drawing = { x: p.x, y: p.y, r: 0 };
  }
  canvas.setPointerCapture(event.pointerId);
  updateCircleText();
  paint();
  event.preventDefault();
});

canvas.addEventListener('pointermove', (event) => {
  const p = pointerFraction(event);
  if (drawing) {
    drawing.r = Math.hypot(p.x - drawing.x, p.y - drawing.y);
  } else if (dragMode === 'move' && selected >= 0) {
    const c = circles[selected];
    c.x = Math.min(1, Math.max(0, p.x - dragOffset.x));
    c.y = Math.min(1, Math.max(0, p.y - dragOffset.y));
  } else if (dragMode === 'resize' && selected >= 0) {
    const c = circles[selected];
    c.r = Math.max(0.02, distance(p, c));
  } else {
    return;
  }
  paint();
});

canvas.addEventListener('pointerup', (event) => {
  if (drawing) {
    // A tiny drag is treated as a click: give it a sensible default radius.
    if (drawing.r < 0.02) drawing.r = 0.06;
    circles.push(drawing);
    selected = circles.length - 1;
    drawing = null;
  }
  dragMode = null;
  updateCircleText();
  paint();
});

deleteButton.addEventListener('click', () => {
  if (selected >= 0) circles.splice(selected, 1);
  selected = -1;
  updateCircleText();
  paint();
});

// Backspace or Delete removes the selected circle, as on ClumpScope.
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Backspace' || event.key === 'Delete') && selected >= 0 && !submitted
      && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    circles.splice(selected, 1);
    selected = -1;
    updateCircleText();
    paint();
    event.preventDefault();
  }
});

undoButton.addEventListener('click', () => {
  circles.pop();
  selected = -1;
  updateCircleText();
  paint();
});

/* ---------- Checking the answer ---------- */
// "1 of your circles sits" / "2 of your circles sit": a helper so the verdict reads properly.
function countCircles(n) { return n === 1 ? '1 of your circles sits' : n + ' of your circles sit'; }
function noiseSentence(n) {
  if (n === 1) return '1 of your circles sits on an isolated speck away from the galaxy, which is noise.';
  return n + ' of your circles sit on isolated specks away from the galaxy, which are noise.';
}

submitButton.addEventListener('click', () => {
  const galaxy = GALAXIES[galaxyIndex];
  // Which reference clumps did the visitor find? A circle "finds" a clump when
  // its centre lies within the larger of the two radii.
  let found = 0;
  for (const k of galaxy.clumps) {
    if (circles.some(c => distance(c, k) < Math.max(k.r, c.r))) found += 1;
  }
  // Circles that do not sit on any reference clump are either on the streak or on noise.
  let onStreak = 0, onNoise = 0;
  for (const c of circles) {
    const hitsClump = galaxy.clumps.some(k => distance(c, k) < Math.max(k.r, c.r));
    if (hitsClump) continue;
    if (galaxy.streak && Math.abs(c.x - (galaxy.streak.x0 + galaxy.streak.slope * c.y)) < 0.1) onStreak += 1;
    else onNoise += 1;
  }

  let message = '';
  const perfect = found === galaxy.clumps.length && onStreak === 0 && onNoise === 0;
  if (perfect) {
    message = galaxy.verdictClean;
  } else {
    const parts = [];
    if (galaxy.clumps.length > 0) parts.push('You found ' + found + ' of ' + galaxy.clumps.length + ' clump' + (galaxy.clumps.length === 1 ? '' : 's') + ' we marked (shown dashed).');
    if (onStreak > 0) parts.push(countCircles(onStreak) + ' on the diagonal streak, which is contamination from another object’s spectrum, not a clump.');
    if (onNoise > 0) parts.push(noiseSentence(onNoise));
    if (galaxy.clumps.length === 0 && circles.length > 0) parts.push('There is no galaxy in this map, only noise: the right answer here is no circles and the quality "Unusable".');
    message = parts.join(' ');
  }
  submitted = true;
  selected = -1;
  feedbackText.textContent = message;
  feedbackText.className = 'try-feedback ' + (perfect ? 'good' : 'hint');
  submitButton.hidden = true;
  nextButton.hidden = false;
  nextButton.textContent = galaxyIndex + 1 < GALAXIES.length ? 'Next galaxy' : 'Start again';
  updateCircleText();
  paint();
});

nextButton.addEventListener('click', () => {
  loadGalaxy((galaxyIndex + 1) % GALAXIES.length);
});

// Keep the canvas sharp: its internal size follows its displayed size (up to 2x).
function sizeCanvas() {
  const shown = canvas.getBoundingClientRect().width;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(shown * ratio) || 610;
  if (canvas.width !== size) { canvas.width = size; canvas.height = size; paint(); }
}
window.addEventListener('resize', sizeCanvas);
sizeCanvas();
loadGalaxy(0);
