// =============================================
// 🌈胡桃 个人网站 — 主逻辑
// =============================================

// ============ DATA LOADING ============
async function loadJSON(path) {
  try { const r = await fetch(path, { cache: 'no-store' }); if (r.ok) return r.json(); } catch(e) {}
  return null;
}

// ============ NAVIGATION ============
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current);
  });
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// ============ SCROLL REVEAL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ============ RENDER PROFILE ============
async function renderProfile() {
  const profile = await loadJSON('data/profile.json');
  if (!profile) return;

  document.getElementById('heroTagline').textContent = profile.tagline;
  document.getElementById('heroBio').innerHTML = profile.bio.replace(/\n/g, '<br>');

  const statsRow = document.getElementById('heroStats');
  statsRow.innerHTML = `
    <div class="hero-stat"><div class="hero-stat-value">${profile.stats.height}cm</div><div class="hero-stat-label">身高</div></div>
    <div class="hero-stat"><div class="hero-stat-value">${profile.stats.weight}斤</div><div class="hero-stat-label">体重</div></div>
    <div class="hero-stat"><div class="hero-stat-value">${profile.stats.location}</div><div class="hero-stat-label">坐标</div></div>
  `;

  const socialDiv = document.getElementById('socialLinks');
  socialDiv.innerHTML = profile.social.map(s => `
    <a href="${s.url}" class="social-link" target="_blank" rel="noopener">
      <span class="social-link-icon">${s.icon}</span> ${s.platform}
      <span style="color:var(--text-muted);font-size:0.75rem">${s.handle}</span>
    </a>
  `).join('');

  const contactDiv = document.getElementById('contactInfo');
  contactDiv.innerHTML = `
    <h3>📬 联系方式</h3>
    <div class="contact-item"><span class="contact-item-icon">📧</span> 邮箱：<a href="mailto:${profile.contact.email}">${profile.contact.email}</a></div>
    <div class="contact-item"><span class="contact-item-icon">💬</span> 微信：${profile.contact.wechat}</div>
  `;

  document.getElementById('collabNote').textContent = profile.contact.collabNote;
}

// ============ RENDER LOOKBOOK ============
let allLooks = [];
let activeStyle = '全部';

async function renderLookbook() {
  const data = await loadJSON('data/lookbook.json');
  if (!data) return;
  allLooks = data.looks;

  const filterBar = document.getElementById('filterBar');
  filterBar.innerHTML = data.styles.map(s =>
    `<button class="filter-btn${s === '全部' ? ' active' : ''}" data-style="${s}">${s}</button>`
  ).join('');

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStyle = btn.dataset.style;
      renderLooks();
    });
  });

  renderLooks();
}

function renderLooks() {
  const grid = document.getElementById('lookbookGrid');
  const filtered = activeStyle === '全部' ? allLooks : allLooks.filter(l => l.style === activeStyle);

  const colors = ['#FF6B6B','#FFA94D','#FFD43B','#69DB7C','#74C0FC','#B197FC','#F783AC','#FF8A80','#FFD740'];

  grid.innerHTML = filtered.map((l, i) => {
    const hasVideo = l.video && l.video.trim() !== '';
    const isBilibili = hasVideo && l.video.includes('bilibili');
    const bgColor = colors[i % colors.length];
    const posterSrc = l.image && l.image.trim() !== '' ? l.image : '';
    let mediaEl;
    if (hasVideo && isBilibili) {
      mediaEl = '<iframe class="look-card-video" src="' + l.video + '" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" loading="lazy"></iframe>';
    } else if (hasVideo) {
      const posterAttr = posterSrc ? ' poster="' + posterSrc + '"' : '';
      mediaEl = '<video class="look-card-video" src="' + l.video + '"' + posterAttr + ' preload="metadata" loop playsinline></video>';
    } else if (posterSrc) {
      mediaEl = '<img class="look-card-image" src="' + posterSrc + '" alt="' + l.title + '" loading="lazy">';
    } else {
      mediaEl = '<div class="look-card-placeholder" style="background:' + bgColor + '"><span>' + l.title.charAt(0) + '</span></div>';
    }
    const playBtn = (hasVideo && !isBilibili) ? '<div class="look-play-btn">&#9654;</div>' : '';
    const overlayClass = hasVideo ? 'look-card-overlay look-card-overlay-video' : 'look-card-overlay';
    const videoAttr = (hasVideo && !isBilibili) ? 'true' : '';

    return `
    <div class="look-card reveal reveal-d${Math.min(i % 5 + 1, 5)}" data-video="${videoAttr}">
      ${mediaEl}
      ${playBtn}
      <span class="look-card-badge">${l.style} · ${l.season}</span>
      <div class="${overlayClass}">
        <div class="look-card-title">${l.title}</div>
        <div class="look-card-desc">${l.description}</div>
        <div class="look-card-tags">${l.tags.map(t => '<span class="look-card-tag">#' + t + '</span>').join('')}</div>
      </div>
    </div>
  `;
  }).join('');

  observeReveal();

  // Event delegation on grid: handles all video card clicks
  const videoPlayHandler = (e) => {
    const card = e.target.closest('.look-card[data-video="true"]');
    if (!card) return;
    if (e.target.closest('.look-card-tag')) return;
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.look-play-btn');
    if (!video) return;
    if (video.paused) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
      if (playBtn) playBtn.style.display = 'none';
      // Pause all other videos
      grid.querySelectorAll('video').forEach(other => {
        if (other !== video && !other.paused) other.pause();
      });
    } else {
      video.pause();
      if (playBtn) playBtn.style.display = '';
    }
  };

  // Remove old listener and re-add (idempotent)
  if (grid._videoHandler) grid.removeEventListener('click', grid._videoHandler);
  grid._videoHandler = videoPlayHandler;
  grid.addEventListener('click', videoPlayHandler);

  // Bind video ended/pause/play events (these only need to be bound once per render)
  grid.querySelectorAll('.look-card[data-video="true"] video').forEach(video => {
    const playBtn = video.closest('.look-card')?.querySelector('.look-play-btn');
    video.addEventListener('ended', () => { video.pause(); if (playBtn) playBtn.style.display = ''; });
    video.addEventListener('pause', () => { if (playBtn) playBtn.style.display = ''; });
    video.addEventListener('play', () => { if (playBtn) playBtn.style.display = 'none'; });
  });
}

// ============ RENDER TRAVEL ============
async function renderTravel() {
  const data = await loadJSON('data/travel.json');
  if (!data) return;

  const grid = document.getElementById('travelGrid');
  grid.innerHTML = data.trips.map((t, i) => {
    const imgSrc = t.image && t.image.trim() !== '' ? t.image : '';
    const videoSrc = t.video && t.video.trim() !== '' ? t.video : '';
    const travelColors = ['#FF6B6B','#FFA94D','#74C0FC','#69DB7C','#B197FC','#F783AC'];
    const bg = travelColors[i % travelColors.length];
    const imageEl = imgSrc
      ? '<img class="travel-card-image" src="' + imgSrc + '" alt="' + t.title + '" loading="lazy">'
      : (videoSrc 
        ? '<iframe class="travel-card-video" src="' + videoSrc + '" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" loading="lazy"></iframe>'
        : '<div class="travel-card-placeholder" style="background:' + bg + '"><span>' + t.location.replace(/[\u4e00-\u9fa5]+$/, '').slice(-2) + '</span></div>');
    const hasVideo = !!videoSrc;
    return `
    <div class="travel-card reveal reveal-d${Math.min(i % 5 + 1, 5)}" data-has-video="${hasVideo}">
      <div class="travel-card-image-wrap">
        ${imageEl}
        <span class="travel-card-location">📍 ${t.location}</span>
      </div>
      <div class="travel-card-body">
        <div class="travel-card-title">${t.title}</div>
        <div class="travel-card-date">${t.date}</div>
        <div class="travel-card-desc">${t.description}</div>
        <div class="travel-card-tags">${t.tags.map(tag => '<span class="travel-card-tag">' + tag + '</span>').join('')}</div>
      </div>
    </div>
  `;
  }).join('');

  observeReveal();
}

// ============ RENDER STATS ============
async function renderStats() {
  const data = await loadJSON('data/stats.json');
  if (!data) return;

  const grid = document.getElementById('statsGrid');
  grid.innerHTML = data.platforms.map(p => `
    <div class="stat-card reveal">
      <div class="stat-card-icon">${p.icon}</div>
      <div class="stat-card-platform">${p.name}</div>
      <div class="stat-card-value">${p.followers}</div>
      <div class="stat-card-label">粉丝</div>
      <div class="stat-detail-row">
        <div class="stat-detail"><div class="stat-detail-val">${p.likes}</div><div class="stat-detail-lbl">获赞</div></div>
        <div class="stat-detail"><div class="stat-detail-val">${p.avgViews}</div><div class="stat-detail-lbl">均播放</div></div>
        <div class="stat-detail"><div class="stat-detail-val">${p.engagement}</div><div class="stat-detail-lbl">互动率</div></div>
      </div>
    </div>
  `).join('');

  // Brands
  const brandsSection = document.getElementById('brandsSection');
  brandsSection.innerHTML = `
    <div class="brands-title">🤝 合作品牌</div>
    <div class="brands-grid">${data.brands.map(b => `<span class="brand-tag">${b.name} · ${b.type}</span>`).join('')}</div>
  `;

  // Audience
  const audienceSection = document.getElementById('audienceSection');
  audienceSection.innerHTML = `
    <div class="brands-title">👥 粉丝画像</div>
    <div class="audience-row">
      <div class="audience-chip">👩 ${data.audience.femaleRatio} 女性</div>
      <div class="audience-chip">🎂 ${data.audience.ageGroup}</div>
      ${data.audience.topCities.map(c => `<div class="audience-chip">🏙️ ${c}</div>`).join('')}
    </div>
  `;

  observeReveal();
}

// ============ INIT ============
async function init() {
  await Promise.all([
    renderProfile(),
    renderLookbook(),
    renderTravel(),
    renderStats()
  ]);
  observeReveal();
}

init();
