const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const header = document.querySelector('.site-header');

// Page entrance
requestAnimationFrame(() => document.body.classList.add('page-loaded'));

// Slim scroll-progress indicator inside the glass navigation.
if (header) {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.appendChild(progress);
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Stagger reveal timing so sections feel composed instead of moving all at once.
const revealItems = [...document.querySelectorAll('.reveal')];
revealItems.forEach((item, index) => {
  const parent = item.parentElement;
  if (!parent) return;
  const siblings = [...parent.children].filter(el => el.classList.contains('reveal'));
  const localIndex = Math.max(0, siblings.indexOf(item));
  item.style.setProperty('--reveal-delay', `${Math.min(localIndex * 75, 300)}ms`);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });

  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}

const sections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-38% 0px -52% 0px' });

  sections.forEach(section => sectionObserver.observe(section));
}

// Navigation compression + document progress.
let ticking = false;
function updateScrollUI() {
  const y = window.scrollY || document.documentElement.scrollTop;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const ratio = Math.min(1, Math.max(0, y / max));
  if (header) {
    header.classList.toggle('scrolled', y > 30);
    header.style.setProperty('--scroll-progress', ratio.toFixed(4));
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollUI);
    ticking = true;
  }
}, { passive: true });
updateScrollUI();

// Very subtle portrait depth on precise pointers; disabled on touch and reduced motion.
const visual = document.querySelector('.hero-visual');
const portrait = document.querySelector('.portrait-frame');
const canTilt = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (visual && portrait && canTilt) {
  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    portrait.style.transform = `rotateY(${nx * 1.8}deg) rotateX(${ny * -1.5}deg) translateY(-2px)`;
  });
  visual.addEventListener('pointerleave', () => {
    portrait.style.transform = '';
  });
}
