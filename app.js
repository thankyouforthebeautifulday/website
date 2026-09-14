const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: 0.12});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const logo = document.querySelector('.logo-play');
// Each ink pixel belongs to exactly one glyph and pen stroke. The timestamp
// map follows those strokes without exposing neighbouring letters or later strokes.
const logoImage = logo.querySelector('img');
const ink = document.createElement('canvas');
ink.classList.add('logo-ink');
ink.setAttribute('aria-hidden', 'true');
ink.width = 1800; ink.height = 505;
logo.insertBefore(ink, logoImage);
const context = ink.getContext('2d');
let handwritingFrame, sourcePixels, framePixels, revealBuckets;
function playHandwriting() {
  if (reducedMotion || !revealBuckets) return;
  cancelAnimationFrame(handwritingFrame);
  framePixels.data.fill(255);
  context.putImageData(framePixels, 0, 0);
  logo.style.setProperty('--ink-finish', '0');
  logo.style.setProperty('--tilt', '0deg');
  logo.classList.add('is-writing');
  let started, previousTime = -1;
  function draw(now) {
    started ??= now;
    const elapsed = Math.min(2500, Math.floor((now - started) * 1.25));
    for (let time = previousTime + 1; time <= elapsed; time++) {
      for (const pixel of revealBuckets[time]) {
        const offset = pixel * 4;
        framePixels.data[offset] = sourcePixels[offset];
        framePixels.data[offset + 1] = sourcePixels[offset + 1];
        framePixels.data[offset + 2] = sourcePixels[offset + 2];
      }
    }
    previousTime = elapsed;
    context.putImageData(framePixels, 0, 0);
    if (elapsed < 2500) handwritingFrame = requestAnimationFrame(draw);
    else logo.classList.remove('is-writing');
  }
  handwritingFrame = requestAnimationFrame(draw);
}
if (!reducedMotion && context) {
  logo.classList.add('is-loading');
  const mapImage = new Image();
  mapImage.src = 'writing-map.png?v=junction-curves-5';
  Promise.all([logoImage.decode(), mapImage.decode()]).then(() => {
    context.drawImage(logoImage, 0, 0, ink.width, ink.height);
    sourcePixels = context.getImageData(0, 0, ink.width, ink.height).data;
    context.drawImage(mapImage, 0, 0, ink.width, ink.height);
    const mapPixels = context.getImageData(0, 0, ink.width, ink.height).data;
    revealBuckets = Array.from({length:2501}, () => []);
    for (let pixel = 0; pixel < ink.width * ink.height; pixel++) {
      const time = mapPixels[pixel * 4] * 256 + mapPixels[pixel * 4 + 1];
      if (time <= 2500) revealBuckets[time].push(pixel);
    }
    framePixels = context.createImageData(ink.width, ink.height);
    logo.classList.remove('is-loading');
    playHandwriting();
  }).catch(() => logo.classList.remove('is-loading'));
}
logo.addEventListener('pointermove', event => {
  if (reducedMotion || logo.classList.contains('is-writing') || event.pointerType === 'touch') return;
  const rect = logo.getBoundingClientRect();
  logo.style.setProperty('--tilt', `${((event.clientX - rect.left) / rect.width - .5) * 3}deg`);
});
logo.addEventListener('pointerleave', () => logo.style.setProperty('--tilt','0deg'));
logo.addEventListener('click', playHandwriting);
document.getElementById('year').textContent = new Date().getFullYear();
const notes = [
  'You are graceful, like art.',
  'See how far you can go, see what you can do in this life.',
  'Focus on gratitude and the people who are always by your side.',
  'You have the power to affect people in positive ways.',
  'stay SEXY, stay COOL',
  'The big lesson in life is to never be scared of anyone or anything.',
  'Overcome anything like it’s a game — you’ll do it.',
  'Be courageous. Be kind. Keep smiling.',
  'You are strong enough to surpass who you were yesterday.',
  'You are the artist of your life; you have the power to create your dream life.',
  'Don’t pay attention to people who weigh you down.',
  'You’re damn cool as usual.',
  'Take a deep breath and say thank you.',
  'You are growing.',
  'There’s always someone who loves you.',
  'It is what it is — things have changed.',
  'You are safe, and you can relax.',
  'Be strong. Be brave.',
  'You’re more beautiful than you think.',
  'Never give a damn about what makes you uncool.',
  'Enjoy struggling. You’re cool for not giving up.',
  'The world is much bigger than you think.\nThere are more than 8,000,000,000 people.',
  'Remember the most beautiful sunset you’ve ever seen.',
  'Take a leap — it might make someone’s day.',
  'The universe always falls in love with a stubborn heart.',
  'Stop worrying so much — it’s all okay.',
  'Today is a new day, a beautiful day.\nSo many possibilities and opportunities are coming your way.',
  'I want you to dream a dream that’s way bigger than you think is possible.',
  'Why not go big?',
  'Why not take a chance and chase the dream?',
  'Who cares? Be unique, be memorable, be proud — be you.',
  'You can care for someone and still choose to keep your distance; both can exist at the same time.',
  'Give yourself a try!',
  'If you have something you like, don’t let anyone break it — and don’t let yourself break it.',
  'Look in the mirror with love.'
];
let noteIndex = 0;
document.getElementById('thanks').addEventListener('click', event => {
  document.getElementById('thanks-note').textContent = notes[noteIndex++ % notes.length];
  if (reducedMotion) return;
  const rect = event.currentTarget.getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('span'); dot.className = 'spark'; dot.style.background = '#fff';
    dot.style.left = `${rect.left + rect.width / 2}px`; dot.style.top = `${rect.top + rect.height / 2}px`;
    const angle = Math.PI * 2 * i / 12;
    dot.style.setProperty('--dx', `${Math.cos(angle) * 120}px`); dot.style.setProperty('--dy', `${Math.sin(angle) * 100}px`);
    document.body.appendChild(dot); dot.addEventListener('animationend', () => dot.remove());
  }
});



