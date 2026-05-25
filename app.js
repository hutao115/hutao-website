// =============================================
// 🌈胡桃 个人网站 — 主逻辑
// =============================================

// ============ DATA LOADING ============
async function loadJSON(path) {
  try { const r = await fetch(path); if (r.ok) return r.json(); } catch(e) {}
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

  grid.innerHTML = filtered.map((l, i) => `
    <div class="look-card reveal reveal-d${Math.min(i % 5 + 1, 5)}">
      <img class="look-card-image" src="${l.image}" alt="${l.title}" loading="lazy">
      <span class="look-card-badge">${l.style} · ${l.season}</span>
      <div class="look-card-overlay">
        <div class="look-card-title">${l.title}</div>
        <div class="look-card-desc">${l.description}</div>
        <div class="look-card-tags">${l.tags.map(t => `<span class="look-card-tag">#${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');

  observeReveal();
}

// ============ RENDER TRAVEL ============
async function renderTravel() {
  const data = await loadJSON('data/travel.json');
  if (!data) return;

  const grid = document.getElementById('travelGrid');
  grid.innerHTML = data.trips.map((t, i) => `
    <div class="travel-card reveal reveal-d${Math.min(i % 5 + 1, 5)}">
      <div class="travel-card-image-wrap">
        <img class="travel-card-image" src="${t.image}" alt="${t.title}" loading="lazy">
        <span class="travel-card-location">📍 ${t.location}</span>
      </div>
      <div class="travel-card-body">
        <div class="travel-card-title">${t.title}</div>
        <div class="travel-card-date">${t.date}</div>
        <div class="travel-card-desc">${t.description}</div>
        <div class="travel-card-tags">${t.tags.map(tag => `<span class="travel-card-tag">${tag}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');

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
