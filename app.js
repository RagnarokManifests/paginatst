const RELEASES_JSON_URL = 'releases.json';
const EXE_REGEX  = /\.exe$/i;
const ZIP_REGEX  = /\.zip$/i;

const i18n = {
  es: {
    nav_download: "Descargar",
    nav_donate: "Donar",
    hero_badge: "Nueva versión disponible:",
    hero_loading: "Cargando versión...",
    hero_title_main: "RAGNAROK",
    hero_title_sub: "LAUNCHER",
    hero_subtitle: "Tu acceso directo al mundo del gaming en Steam.<br>Lanza, gestiona y actualiza tus juegos con un solo clic.",
    stat_downloads: "Descargas",
    stat_version: "Versión",
    stat_releases: "Releases",
    feat1_title: "Lanzamiento Rápido",
    feat1_desc: "Inicia tus juegos de Steam directamente sin pasos extra.",
    feat2_title: "Actualizaciones Automáticas",
    feat2_desc: "El launcher se actualiza solo. Siempre tendrás la última versión.",
    feat3_title: "Seguro y Ligero",
    feat3_desc: "Sin bloatware, sin anuncios. Solo lo que necesitas para jugar.",
    btn_install: "Instalar",
    dl_tag: "Windows x64",
    linux_dev: "En desarrollo",
    dl_note: "Al descargar aceptas los términos de uso. Compatible con Windows 10 / 11 (64-bit).",
    footer_copy: "© 2026 Ragnarok Launcher. Todos los derechos reservados.",
    gallery_tag: "Interfaz",
    gallery_title: "Explora el Launcher",
    gallery_desc: "Echa un vistazo a la interfaz limpia, rápida y configurable de Ragnarok Launcher.",
    cap_home: "Panel de Control: Estado del servicio y estadísticas del launcher",
    cap_library: "Biblioteca: Gestiona tu colección de juegos con un diseño moderno",
    cap_online: "Multijugador: Base de datos y parches de red integrados en un solo clic",
    cap_settings: "Ajustes: Personalización de idioma, guardado en la nube y color de acento"
  },
  en: {
    nav_download: "Download",
    nav_donate: "Donate",
    hero_badge: "New version available:",
    hero_loading: "Loading version...",
    hero_title_main: "RAGNAROK",
    hero_title_sub: "LAUNCHER",
    hero_subtitle: "Your direct access to the world of Steam gaming.<br>Launch, manage, and update your games with a single click.",
    stat_downloads: "Downloads",
    stat_version: "Version",
    stat_releases: "Releases",
    feat1_title: "Quick Launch",
    feat1_desc: "Start your Steam games directly without extra steps.",
    feat2_title: "Automatic Updates",
    feat2_desc: "The launcher updates itself. You'll always have the latest version.",
    feat3_title: "Safe & Lightweight",
    feat3_desc: "No bloatware, no ads. Only what you need to play.",
    btn_install: "Install",
    dl_tag: "Windows x64",
    linux_dev: "In development",
    dl_note: "By downloading you accept the terms of use. Compatible with Windows 10 / 11 (64-bit).",
    footer_copy: "© 2026 Ragnarok Launcher. All rights reserved.",
    gallery_tag: "Interface",
    gallery_title: "Explore the Launcher",
    gallery_desc: "Take a look at the clean, fast, and customizable interface of Ragnarok Launcher.",
    cap_home: "Dashboard: Service status and launcher statistics",
    cap_library: "Library: Manage your game collection with a modern design",
    cap_online: "Multiplayer: Network fixes and database integrated in one click",
    cap_settings: "Settings: Customize language, cloud-saves, and accent color"
  }
};

let currentLang = localStorage.getItem('lang') || 'en';
let latestVersionTag = '';

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.innerHTML = i18n[lang][key];
    }
  });

  const textEl = document.getElementById('hero-badge-text');
  const badgeContainer = textEl?.closest('.version-badge');
  if (textEl && badgeContainer) {
    if (latestVersionTag) {
      textEl.textContent = i18n[lang].hero_badge + ' ' + latestVersionTag;
    } else {
      textEl.textContent = i18n[lang].hero_loading;
    }
  }

  const langText = document.getElementById('lang-text');
  if (langText) {
    langText.textContent = lang === 'es' ? 'EN' : 'ES';
  }
}

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  updateLanguage(currentLang === 'es' ? 'en' : 'es');
});

function formatBytes(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)    return (bytes / 1024).toFixed(0)    + ' KB';
  return bytes + ' B';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

(function initSpace() {
  const canvas = document.getElementById('particles-canvas');
  if(!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  let mouse = { x: -999, y: -999 };

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

  function randomParticle() {
    const gold = Math.random() < 0.35;
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.2 + 0.2,
      vx:    (Math.random() - 0.5) * 0.1,
      vy:   -(Math.random() * 0.15 + 0.05),
      alpha: Math.random() * 0.45 + 0.08,
      color: gold ? 'rgba(201,146,42,' : 'rgba(190,175,155,',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: Math.floor(W / 8) }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      const repelFactor = Math.max(0, 1 - dist / 150);
      const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
      const repelX = Math.cos(angle) * repelFactor * 0.5;
      const repelY = Math.sin(angle) * repelFactor * 0.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4)              Object.assign(p, randomParticle(), { y: H + 4 });
      if (p.x < -4 || p.x > W + 4) Object.assign(p, randomParticle(), { x: p.vx > 0 ? -3 : W + 3 });
    }
    requestAnimationFrame(draw);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 250);
  });

  const spotlight = document.getElementById('cursor-spotlight');
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
    if (spotlight) {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
    }
  });

  init();
  draw();
})();

(function initDraggables() {
  const cards = document.querySelectorAll('.draggable');
  if (window.innerWidth <= 1024) return;

  let activeCard = null;
  let offsetX, offsetY;

  function onDragStart(e) {
    activeCard = this;
    activeCard.classList.add('dragging');
    const event = e.type === 'touchstart' ? e.touches[0] : e;
    const rect = activeCard.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
  }

  function onDragMove(e) {
    if (!activeCard) return;
    e.preventDefault();

    const event = e.type === 'touchmove' ? e.touches[0] : e;
    const container = document.querySelector('.interactive-layout');
    const containerRect = container.getBoundingClientRect();

    let x = event.clientX - containerRect.left - offsetX;
    let y = event.clientY - containerRect.top - offsetY;

    const cardWidth = activeCard.offsetWidth;
    const cardHeight = activeCard.offsetHeight;

    const minX = -containerRect.left;
    const maxX = window.innerWidth - containerRect.left - cardWidth;
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, containerRect.height - cardHeight));

    activeCard.style.left = x + 'px';
    activeCard.style.top = y + 'px';
  }

  function onDragEnd() {
    if (!activeCard) return;
    activeCard.classList.remove('dragging');
    activeCard = null;
  }

  cards.forEach(card => {
    card.addEventListener('mousedown', onDragStart);
    card.addEventListener('touchstart', onDragStart, { passive: false });
  });

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
})();

(function initDownloadPanel() {
  const heroDownloadBtn = document.querySelector('#hero .btn-download');
  const navDownloadBtn = document.getElementById('nav-download');
  const panel = document.getElementById('download-panel');
  if (!heroDownloadBtn || !panel) return;

  heroDownloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('visible');
  });

  if (navDownloadBtn) {
    navDownloadBtn.addEventListener('click', () => {
      heroDownloadBtn.classList.add('flash-animation');
      setTimeout(() => {
        heroDownloadBtn.classList.remove('flash-animation');
      }, 800);
    });
  }

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) {
      panel.classList.remove('visible');
    }
  });

  window.addEventListener('scroll', () => {
    panel.classList.remove('visible');
  }, { passive: true });

  // Interceptor: si se hace clic en Windows antes de que cargue la URL, la busca al momento
  const winLink = document.getElementById('download-link-windows');
  if (winLink) {
    winLink.addEventListener('click', async (e) => {
      const href = winLink.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        const desc = document.getElementById('download-desc-windows');
        if (desc) desc.textContent = 'Obteniendo enlace...';
        try {
          const res = await fetch(RELEASES_JSON_URL, { cache: 'no-store' });
          if (!res.ok) throw new Error();
          const valid = await res.json();
          if (!Array.isArray(valid) || !valid.length) throw new Error();
          applyReleaseData(valid);
          winLink.click(); // disparar la descarga ahora
        } catch {
          if (desc) desc.textContent = 'Error. Reintenta.';
        }
      }
    });
  }
})();

window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    ?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.gallery-column, .feature-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

function animateCount(el, target) {
  if (!el) return;
  let start = 0;
  const inc = target / (1200 / 16);
  const t = setInterval(() => {
    start = Math.min(start + inc, target);
    el.textContent = Math.round(start).toLocaleString('es-ES');
    if (start >= target) clearInterval(t);
  }, 16);
}

async function loadReleases() {
  try {
    const res = await fetch(RELEASES_JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const valid = await res.json();
    if (!Array.isArray(valid) || !valid.length) throw new Error('Sin releases con .exe');

    applyReleaseData(valid);
  } catch (err) {
    console.error(err);
    fallback();
  }
}

function applyReleaseData(valid) {
  latestVersionTag = valid[0].tag_name;
  renderHero();
  renderCard(valid[0]);
  renderStats(valid);
}

function renderHero() {
  const textEl = document.getElementById('hero-badge-text');
  const badgeContainer = textEl?.closest('.version-badge');
  if (textEl && badgeContainer) {
    textEl.textContent = i18n[currentLang].hero_badge + ' ' + latestVersionTag;
    badgeContainer.classList.add('visible');
  }
}

function renderCard(latest) {
  const asset = latest.assets.find(a => ZIP_REGEX.test(a.name)) || latest.assets.find(a => EXE_REGEX.test(a.name));
  if (!asset) return;

  const setId = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  const link = document.getElementById('download-link-windows');
  if (link) {
    link.href = asset.browser_download_url;
    link.setAttribute('download', asset.name);
    document.getElementById('download-desc-windows').textContent = `${latestVersionTag} | ${formatBytes(asset.size)}`;
  }
}

function renderStats(releases) {
  const total = releases.reduce((acc, r) =>
    acc + r.assets.reduce((s, a) => s + (a.download_count || 0), 0), 0
  );
  animateCount(document.getElementById('stat-downloads'), total);
  const sv = document.getElementById('stat-version');
  if (sv) sv.textContent = releases[0].tag_name;
  animateCount(document.getElementById('stat-releases'), releases.length);
}

function fallback() {
  // Dejar el link en # para que el interceptor de clic reintente al vuelo
  const link = document.getElementById('download-link-windows');
  if (link) {
    link.href = '#';
    const desc = document.getElementById('download-desc-windows');
    if (desc) desc.textContent = 'Haz clic para descargar';
  }
  const textEl = document.getElementById('hero-badge-text');
  const badgeContainer = textEl?.closest('.version-badge');
  if (textEl && badgeContainer) {
    textEl.textContent = i18n[currentLang].hero_loading;
    badgeContainer.classList.add('visible');
  }
}

const galleryImages = [
  'screenshot_home.png',
  'screenshot_library.png',
  'screenshot_online.png',
  'screenshot_settings.png'
];

const galleryCaptions = [
  'cap_home',
  'cap_library',
  'cap_online',
  'cap_settings'
];
let activeGalleryIndex = 0;
let galleryInterval;


window.setGalleryImage = function(imgName, captionKey, thumbEl) {
  const index = galleryImages.indexOf(imgName);
  if (index !== -1) {
    activeGalleryIndex = index;
  }
  
  const mainImg = document.getElementById('gallery-active-img');
  const caption = document.getElementById('gallery-active-caption');
  if (mainImg) {
    mainImg.src = 'fotos de la pagina/' + imgName;
  }
  if (caption) {
    caption.setAttribute('data-i18n', captionKey);
    caption.innerHTML = i18n[currentLang][captionKey] || captionKey;
  }
  document.querySelectorAll('.gallery-thumbs .thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) {
    thumbEl.classList.add('active');
  } else {
    const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
    if (thumbs[activeGalleryIndex]) {
      thumbs[activeGalleryIndex].classList.add('active');
    }
  }
};

function startGalleryInterval() {
  clearInterval(galleryInterval);
  galleryInterval = setInterval(() => {
    navigateLightbox(1);
  }, 5000);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(galleryInterval);
  } else {
    startGalleryInterval();
  }
});

window.openLightbox = function() {
  const mainImg = document.getElementById('gallery-active-img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (mainImg && lightbox && lightboxImg) {
    lightboxImg.src = mainImg.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    clearInterval(galleryInterval);
  }
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    startGalleryInterval();
  }
};

window.navigateLightbox = function(direction, event) {
  if (event) event.stopPropagation();
  if (!document.getElementById('lightbox')?.classList.contains('open')) startGalleryInterval();
  activeGalleryIndex = (activeGalleryIndex + direction + galleryImages.length) % galleryImages.length;
  
  const nextImg = galleryImages[activeGalleryIndex];
  const nextCap = galleryCaptions[activeGalleryIndex];
  
  const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
  const nextThumb = thumbs[activeGalleryIndex];
  
  window.setGalleryImage(nextImg, nextCap, nextThumb);
  
  const lightboxImg = document.getElementById('lightbox-img');
  if (lightboxImg && lightbox?.classList.contains('open')) {
    lightboxImg.src = 'fotos de la pagina/' + nextImg;
  }
};

document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('open')) {
    if (e.key === 'ArrowLeft') {
      window.navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      window.navigateLightbox(1);
    } else if (e.key === 'Escape') {
      window.closeLightbox();
    }
  }
});

updateLanguage(currentLang);
loadReleases();
startGalleryInterval();
