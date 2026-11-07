/* ==========================================================================
   Astronomy with Andrea: behaviour
   Five small jobs, each in its own block:
     1. Starfield behind the page (canvas, with parallax and twinkle)
     2. Hero galaxy: grows and fades as you scroll (you fly into it)
     3. H-alpha clumps: pink pulsing dots on the galaxy's arms
     4. Reveal: sections fade up as they enter the screen
     5. Small things: cursor glow, footer year
   Reduced-motion users get a static version of everything.
   ========================================================================== */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = window.innerWidth < 800;

/* -------------------------------------------------------------------------
   1. STARFIELD
   Three layers of stars. Far stars are small and barely move when you scroll;
   near stars are bigger and move more. That difference is the parallax.
   ------------------------------------------------------------------------- */
const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');
let starWidth = 0, starHeight = 0, stars = [];
// Keep the canvas at most 2x resolution; higher only costs battery.
const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

function makeStars() {
  starWidth = starCanvas.width = window.innerWidth * pixelRatio;
  starHeight = starCanvas.height = window.innerHeight * pixelRatio;
  stars = [];
  // About one star per 6000 screen pixels. Phones get fewer automatically because they are smaller.
  const count = Math.round((window.innerWidth * window.innerHeight) / 6000);
  for (let i = 0; i < count; i++) {
    const layer = Math.random() < 0.7 ? 0 : (Math.random() < 0.7 ? 1 : 2); // 0 far, 1 mid, 2 near
    stars.push({
      x: Math.random() * starWidth,
      y: Math.random() * starHeight * 2,   // spread over two screens so scrolling reveals new stars
      size: (0.7 + layer * 0.6 + Math.random() * 0.7) * pixelRatio,
      layer: layer,
      phase: Math.random() * Math.PI * 2,  // where in its twinkle cycle this star starts
      speed: 0.4 + Math.random() * 1.2,    // how fast it twinkles
      warm: Math.random() < 0.2            // a few stars are slightly orange
    });
  }
}

let mouseX = 0.5, mouseY = 0.5;   // mouse position as a fraction of the screen

function drawStars(timeMs) {
  starCtx.clearRect(0, 0, starWidth, starHeight);
  const scroll = window.scrollY * pixelRatio;
  for (const star of stars) {
    // Parallax: each layer scrolls at a fraction of the page speed and shifts slightly with the mouse.
    const scrollFactor = [0.12, 0.3, 0.55][star.layer];
    const mouseShift = isPhone ? 0 : [3, 8, 16][star.layer] * pixelRatio;
    const x = star.x + (mouseX - 0.5) * mouseShift;
    let y = star.y - scroll * scrollFactor + (mouseY - 0.5) * mouseShift;
    y = ((y % (starHeight * 2)) + starHeight * 2) % (starHeight * 2);   // wrap around, never run out
    if (y > starHeight) continue;                                         // off screen this frame

    // Twinkle: brightness follows a slow sine wave, different for every star.
    const brightness = reducedMotion ? 0.75 : 0.5 + 0.5 * Math.sin(timeMs * 0.001 * star.speed + star.phase);
    starCtx.globalAlpha = brightness;
    starCtx.fillStyle = star.warm ? '#ffe3bd' : '#ffffff';
    // Small squares are much cheaper to draw than circles and look the same at this size.
    starCtx.fillRect(x, y, star.size, star.size);
  }
  starCtx.globalAlpha = 1;
}

/* -------------------------------------------------------------------------
   2. HERO GALAXY: fly-in on scroll
   Over the first screen of scrolling the galaxy grows by 60% and fades out,
   so the page underneath takes over smoothly.
   ------------------------------------------------------------------------- */
const heroGalaxy = document.getElementById('hero-galaxy');
const heroImage = heroGalaxy.querySelector('img');

function updateHeroGalaxy() {
  // 0 at the top of the page, 1 one screen down. Guard against a zero-height window
  // (it happens in hidden tabs) because dividing by zero would break every frame after.
  let progress = window.innerHeight > 0 ? window.scrollY / window.innerHeight : 1;
  progress = Math.max(0, Math.min(1, progress));
  const scale = 1 + progress * 0.6;
  const opacity = 1 - progress;
  heroGalaxy.style.transform = 'scale(' + scale + ')';
  heroGalaxy.style.opacity = opacity;
  return { opacity: opacity, scale: scale };
}

/* -------------------------------------------------------------------------
   3. H-ALPHA CLUMPS
   Pink dots that pulse on the spiral arms. Positions are fractions of the
   galaxy image (0 to 1 across and down), placed by eye on the arms of
   NGC 6744. They are illustrative, not measured.
   ------------------------------------------------------------------------- */
const clumpCanvas = document.getElementById('clumps');
const clumpCtx = clumpCanvas.getContext('2d');
const clumpPositions = [
  [0.39, 0.36], [0.43, 0.31], [0.50, 0.275], [0.575, 0.32], [0.633, 0.40], [0.65, 0.48],
  [0.625, 0.575], [0.575, 0.633], [0.50, 0.667], [0.417, 0.633], [0.367, 0.54], [0.358, 0.45],
  [0.45, 0.42], [0.56, 0.45], [0.55, 0.58], [0.44, 0.56]
];
// Each clump gets its own pulse timing so they do not all blink together.
const clumpPhases = clumpPositions.map(() => Math.random() * Math.PI * 2);

// Where the galaxy image sits inside the hero when nothing is scaled yet.
// Measured once (and again on resize) because measuring every frame is slow.
let imageBox = { left: 0, top: 0, width: 0, height: 0 };
let heroCentre = { x: 0, y: 0 };

function sizeClumpCanvas() {
  clumpCanvas.width = clumpCanvas.clientWidth * pixelRatio;
  clumpCanvas.height = clumpCanvas.clientHeight * pixelRatio;
  // Measure with the fly-in scale switched off, so the numbers are the "rest" position.
  heroGalaxy.style.transform = 'scale(1)';
  const canvasRect = clumpCanvas.getBoundingClientRect();
  const imageRect = heroImage.getBoundingClientRect();
  imageBox = {
    left: imageRect.left - canvasRect.left,
    top: imageRect.top - canvasRect.top,
    width: imageRect.width,
    height: imageRect.height
  };
  heroCentre = { x: canvasRect.width / 2, y: canvasRect.height / 2 };
}

function drawClumps(timeMs, heroOpacity, heroScale) {
  clumpCtx.clearRect(0, 0, clumpCanvas.width, clumpCanvas.height);
  if (heroOpacity <= 0) return;
  for (let i = 0; i < clumpPositions.length; i++) {
    const fx = clumpPositions[i][0];
    const fy = clumpPositions[i][1];
    // Position at rest, then scaled about the hero centre exactly as the CSS scales the galaxy.
    const restX = imageBox.left + fx * imageBox.width;
    const restY = imageBox.top + fy * imageBox.height;
    const x = (heroCentre.x + (restX - heroCentre.x) * heroScale) * pixelRatio;
    const y = (heroCentre.y + (restY - heroCentre.y) * heroScale) * pixelRatio;
    if (!isFinite(x) || !isFinite(y)) continue;   // nothing sensible to draw yet (canvas not measured)
    const pulse = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(timeMs * 0.0015 + clumpPhases[i]);
    const radius = (isPhone ? 7 : 10) * pixelRatio;
    const glow = clumpCtx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, 'rgba(255, 150, 185, ' + (0.9 * pulse * heroOpacity) + ')');
    glow.addColorStop(0.35, 'rgba(255, 92, 138, ' + (0.6 * pulse * heroOpacity) + ')');
    glow.addColorStop(1, 'rgba(255, 92, 138, 0)');
    clumpCtx.fillStyle = glow;
    clumpCtx.beginPath();
    clumpCtx.arc(x, y, radius, 0, Math.PI * 2);
    clumpCtx.fill();
  }
}

/* -------------------------------------------------------------------------
   3b. DEPTH GALAXIES
   Each element with class "depth-galaxy" is a galaxy image behind a section.
   As you scroll it should feel like flying past: it is small and faint when
   far from the middle of the screen, biggest and brightest when it is in the
   middle, and it drifts more slowly than the page (parallax).
   data-depth says how strong the effect is (0 = none, 1 = strong).
   ------------------------------------------------------------------------- */
const depthGalaxies = [];   // one entry per galaxy: the element plus its resting position

function measureDepthGalaxies() {
  depthGalaxies.length = 0;
  document.querySelectorAll('.depth-galaxy').forEach(element => {
    element.style.transform = 'none';             // measure at rest
    const box = element.getBoundingClientRect();
    depthGalaxies.push({
      element: element,
      centreY: box.top + window.scrollY + box.height / 2,   // document position of its centre
      depth: parseFloat(element.dataset.depth || '0.5')
    });
  });
}

function updateDepthGalaxies() {
  const screenCentre = window.scrollY + window.innerHeight / 2;
  for (const galaxy of depthGalaxies) {
    // How far is this galaxy from the middle of the screen, in screens? 0 = dead centre.
    const distance = (galaxy.centreY - screenCentre) / window.innerHeight;
    if (distance > 1.5 || distance < -1.5) { galaxy.element.style.opacity = 0; continue; }
    const closeness = Math.max(0, 1 - Math.abs(distance));   // 1 at centre, 0 one screen away
    const scale = 0.6 + 0.6 * closeness * galaxy.depth;      // grows as it approaches
    const shift = distance * window.innerHeight * 0.35 * galaxy.depth;   // moves slower than the page
    const tilt = distance * 8 * galaxy.depth;                 // a few degrees of rotation
    galaxy.element.style.transform = 'translateY(' + shift + 'px) scale(' + scale + ') rotate(' + tilt + 'deg)';
    galaxy.element.style.opacity = 0.15 + 0.6 * closeness;
  }
}

/* -------------------------------------------------------------------------
   The animation loop. One loop drives all three canvases so the browser
   does only one pass per frame.
   ------------------------------------------------------------------------- */
function frame(timeMs) {
  const hero = updateHeroGalaxy();
  if (!reducedMotion) updateDepthGalaxies();
  drawStars(timeMs);
  drawClumps(timeMs, hero.opacity, hero.scale);
  if (!reducedMotion) requestAnimationFrame(frame);
}

function setupCanvases() {
  makeStars();
  sizeClumpCanvas();
  measureDepthGalaxies();
}
// Lazy images and fonts can change the page length after load, so measure again then.
window.addEventListener('load', measureDepthGalaxies);
setupCanvases();
window.addEventListener('resize', setupCanvases);
requestAnimationFrame(frame);

// With reduced motion there is no loop, so redraw once when the page scrolls
// (the galaxy still fades out, it just does not twinkle or pulse).
if (reducedMotion) {
  window.addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
}

/* -------------------------------------------------------------------------
   4. REVEAL ON SCROLL
   When an element with class "reveal" comes into view, add "is-visible".
   The CSS does the fade. Each element reveals once and then stays.
   ------------------------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* -------------------------------------------------------------------------
   5. SMALL THINGS
   ------------------------------------------------------------------------- */
// Cursor glow (desktop only; the CSS hides it on touch screens).
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX / window.innerWidth;
  mouseY = event.clientY / window.innerHeight;
  cursorGlow.style.left = event.clientX + 'px';
  cursorGlow.style.top = event.clientY + 'px';
}, { passive: true });

// Footer year.
document.getElementById('year').textContent = new Date().getFullYear();
