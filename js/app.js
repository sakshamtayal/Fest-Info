/* ══════════════════════════════════════════════
   FEST INFO — Main Application JS
   by Saksham Tayal
   ══════════════════════════════════════════════ */

'use strict';

// ── State ──
let allEvents = [];
let allSocieties = [];
let allCollegeEvents = [];
let societyFilter = 'all';
let dataLoaded = { events: false, societies: false, college: false };

// ── DOM refs ──
const $ = id => document.getElementById(id);

// ════════════════════════
// PAGE NAVIGATION
// ════════════════════════
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  $(`page-${page}`).classList.add('active');
  $(`nav-${page}`).classList.add('active');

  // Close mobile menu
  closeMobileMenu();

  // Load data on first visit
  if (page === 'events' && !dataLoaded.events) loadEvents();
  if (page === 'societies' && !dataLoaded.societies) loadSocieties();
  if (page === 'college' && !dataLoaded.college) loadCollegeEvents();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ════════════════════════
// HAMBURGER MENU
// ════════════════════════
const hamburger = $('hamburger');
const navMenu = $('nav-menu');
const navRight = document.querySelector('.nav-right');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  if (navRight) navRight.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
});

function closeMobileMenu() {
  navMenu.classList.remove('open');
  if (navRight) navRight.classList.remove('open');
  hamburger.classList.remove('open');
}

// ════════════════════════
// API HELPERS
// ════════════════════════

// When served from GitHub Pages, point to the Render backend.
// When served directly from Express (Render), use relative paths.
const API_BASE = (() => {
  const host = window.location.hostname;
  if (host === 'sakshamtayal.github.io') {
    return 'https://fest-info.onrender.com';
  }
  return ''; // relative — works when Express serves the frontend too
})();

async function apiFetch(endpoint) {
  const res = await fetch(API_BASE + endpoint);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function showDbBanner(show) {
  const banner = $('db-banner');
  if (banner) {
    banner.style.display = show ? 'block' : 'none';
  }
  // Adjust main padding safely
  const mainEl = document.querySelector('.main');
  if (mainEl) {
    mainEl.style.paddingTop = show
      ? 'calc(var(--nav-h) + 44px + 40px)'
      : 'calc(var(--nav-h) + 40px)';
  }
}

// ════════════════════════
// EVENTS
// ════════════════════════
async function loadEvents() {
  try {
    const result = await apiFetch('/api/events');
    // Hybrid check: Handles both raw array responses and wrapped objects
    allEvents = (Array.isArray(result) ? result : (result.data || []))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    dataLoaded.events = true;
    if (result && result.source === 'cache') showDbBanner(true);
    renderEvents(allEvents);
  } catch (err) {
    renderEventsEmpty('Could not load events. Server may be down.');
  }
}

function renderEvents(events) {
  const grid = $('events-grid');
  if (!grid) return;
  if (!events.length) {
    grid.innerHTML = emptyState('🎭', 'No events yet!', 'Be the first to add an event — mail us at <a href="mailto:saksham16711@gmail.com">saksham16711@gmail.com</a>');
    return;
  }
  grid.innerHTML = events.map((ev, i) => eventCard(ev, i)).join('');
}

function renderEventsEmpty(msg) {
  const grid = $('events-grid');
  if (grid) grid.innerHTML = emptyState('⚠️', 'Oops!', msg);
}

function eventCard(ev, i) {
  const imgHtml = ev.image
    ? `<img class="event-card-img" src="${ev.image}" alt="${ev.name}" loading="lazy" onerror="this.replaceWith(makePlaceholder('🎭','event-card-img-placeholder'))">`
    : `<div class="event-card-img-placeholder">🎭</div>`;

  const organisers = (ev.organisers || []).slice(0, 3).join(', ') + ((ev.organisers || []).length > 3 ? '...' : '');
  const tags = (ev.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  return `<div class="event-card card-anim" style="animation-delay:${i * 0.06}s" onclick="openEventModal('${ev._id}')">
    ${imgHtml}
    <div class="event-card-body">
      <div class="event-card-name">${ev.name}</div>
      ${ev.date ? `<div class="event-card-date">📅 ${ev.date}${ev.time ? ' · ' + ev.time : ''}</div>` : ''}
      ${organisers ? `<div class="event-card-organisers">👤 ${organisers}</div>` : ''}
      ${tags ? `<div class="event-card-tags">${tags}</div>` : ''}
    </div>
  </div>`;
}

function filterEvents() {
  const searchInput = $('search-events');
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase();
  const filtered = allEvents.filter(ev =>
    ev.name.toLowerCase().includes(q) ||
    (ev.organisers || []).join(' ').toLowerCase().includes(q) ||
    (ev.tags || []).join(' ').toLowerCase().includes(q)
  );
  renderEvents(filtered);
}

async function openEventModal(id) {
  // Try cache first for instant open
  let ev = allEvents.find(e => e._id === id);
  if (!ev) {
    try {
      const r = await apiFetch(`/api/events/${id}`);
      ev = r.data || r; // Hybrid check for single items
    } catch { return; }
  }
  if (!ev) return;

  const body = $('modal-body');
  if (body) {
    body.innerHTML = buildEventModal(ev);
    openModal();
  }
}

function buildEventModal(ev) {
  const imgHtml = ev.image
    ? `<img class="modal-hero" src="${ev.image}" alt="${ev.name}" onerror="this.outerHTML='<div class=modal-hero-placeholder>🎭</div>'">`
    : `<div class="modal-hero-placeholder">🎭</div>`;

  const organisers = (ev.organisers || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Organisers</div>
        <div class="organiser-list">${ev.organisers.map(o => `<span class="organiser-chip">👤 ${o}</span>`).join('')}</div>
       </div>` : '';

  const desc = ev.description
    ? `<div class="modal-section"><div class="modal-section-title">About</div><p class="modal-desc">${ev.description}</p></div>` : '';

  const infoBadges = [
    ev.date ? `<div class="info-badge">📅 <strong>${ev.date}</strong></div>` : '',
    ev.time ? `<div class="info-badge">⏰ <strong>${ev.time}</strong></div>` : '',
    ev.venue ? `<div class="info-badge">📍 <strong>${ev.venue}</strong></div>` : '',
  ].filter(Boolean).join('');

  const timeline = (ev.timeline || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Timeline</div>
        <div class="timeline">${ev.timeline.map(t => `
          <div class="timeline-item">
            <div class="timeline-dot-wrap"><div class="timeline-dot"></div><div class="timeline-line"></div></div>
            <div class="timeline-content"><div class="timeline-date">${t.date}</div><div class="timeline-event">${t.event}</div></div>
          </div>`).join('')}
        </div>
       </div>` : '';

  const links = (ev.links || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Links</div>
        <div class="links-list">${ev.links.map(l => `
          <a class="link-item" href="${l.url}" target="_blank" rel="noopener">
            <span class="link-item-icon">🔗</span>
            <span class="link-item-label">${l.label}</span>
            <span class="link-item-arrow">↗</span>
          </a>`).join('')}
        </div>
       </div>` : '';

  const contacts = (ev.contacts || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Contact</div>
        <div class="contacts-list">${ev.contacts.map(c => `
          <div class="contact-item">
            <div class="contact-avatar">👤</div>
            <div class="contact-info">
              <div class="contact-name">${c.name}</div>
              ${c.phone ? `<div class="contact-phone">${c.phone}</div>` : ''}
            </div>
            <div class="contact-links">
              ${c.phone ? `<a class="contact-link call" href="tel:${c.phone}">📞 Call</a>` : ''}
              ${c.whatsapp ? `<a class="contact-link whatsapp" href="${c.whatsapp}" target="_blank">💬 WhatsApp</a>` : ''}
            </div>
          </div>`).join('')}
        </div>
       </div>` : '';

  return `
    ${imgHtml}
    <div class="modal-title">${ev.name}</div>
    ${infoBadges ? `<div class="info-badges">${infoBadges}</div>` : ''}
    ${desc}
    ${organisers}
    ${timeline}
    ${links}
    ${contacts}
  `;
}

// ════════════════════════
// SOCIETIES
// ════════════════════════
async function loadSocieties() {
  try {
    const result = await apiFetch('/api/societies');
    // Hybrid check: Handles both raw array responses and wrapped objects
    allSocieties = (Array.isArray(result) ? result : (result.data || []))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    dataLoaded.societies = true;
    if (result && result.source === 'cache') showDbBanner(true);
    renderSocieties(allSocieties);
  } catch (err) {
    const grid = $('societies-grid');
    if (grid) grid.innerHTML = emptyState('⚠️', 'Oops!', 'Could not load societies.');
  }
}

function renderSocieties(societies) {
  const grid = $('societies-grid');
  if (!grid) return;
  if (!societies.length) {
    grid.innerHTML = emptyState('🏛️', 'No societies yet!', 'Add yours — mail at <a href="mailto:saksham16711@gmail.com">saksham16711@gmail.com</a>');
    return;
  }
  grid.innerHTML = societies.map((s, i) => societyCard(s, i)).join('');
}

function societyCard(s, i) {
  const logoHtml = s.logo
    ? `<img class="society-logo" src="${s.logo}" alt="${s.name}" onerror="this.outerHTML='<div class=society-logo-placeholder>🏛️</div>'">`
    : `<div class="society-logo-placeholder">🏛️</div>`;

  const badge = s.isRecruiting
    ? `<div class="recruiting-badge yes">🟢 Recruiting Now</div>`
    : `<div class="recruiting-badge no">🔴 Not Recruiting</div>`;

  return `<div class="society-card card-anim" style="animation-delay:${i * 0.06}s" onclick="openSocietyModal('${s._id}')">
    <div class="society-card-header">
      ${logoHtml}
      <div class="society-card-meta">
        <div class="society-card-name">${s.name}</div>
        ${s.category ? `<div class="society-card-cat">${s.category}</div>` : ''}
      </div>
    </div>
    ${badge}
    ${s.description ? `<div class="society-card-desc">${s.description}</div>` : ''}
  </div>`;
}

function filterSocieties() {
  const searchInput = $('search-societies');
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase();
  let filtered = allSocieties.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.category || '').toLowerCase().includes(q) ||
    (s.description || '').toLowerCase().includes(q)
  );
  if (societyFilter === 'recruiting') filtered = filtered.filter(s => s.isRecruiting);
  renderSocieties(filtered);
}

function setSocietyFilter(filter, btn) {
  societyFilter = filter;
  document.querySelectorAll('#society-filters .chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterSocieties();
}

async function openSocietyModal(id) {
  let s = allSocieties.find(x => x._id === id);
  if (!s) {
    try { 
      const r = await apiFetch(`/api/societies/${id}`); 
      s = r.data || r; // Hybrid check for single items
    } catch { return; }
  }
  if (!s) return;
  const body = $('modal-body');
  if (body) {
    body.innerHTML = buildSocietyModal(s);
    openModal();
  }
}

function buildSocietyModal(s) {
  const logoHtml = s.logo
    ? `<img class="modal-society-logo" src="${s.logo}" alt="${s.name}" onerror="this.outerHTML='<div class=modal-society-logo-placeholder>🏛️</div>'">`
    : `<div class="modal-society-logo-placeholder">🏛️</div>`;

  const badge = s.isRecruiting
    ? `<div class="recruiting-badge yes" style="margin-bottom:12px">🟢 Currently Recruiting!</div>`
    : `<div class="recruiting-badge no" style="margin-bottom:12px">🔴 Not Recruiting</div>`;

  const desc = s.description
    ? `<div class="modal-section"><div class="modal-section-title">About</div><p class="modal-desc">${s.description}</p></div>` : '';

  const council = (s.seniorCouncil || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Senior Council</div>
        <div class="council-list">${s.seniorCouncil.map(m => `
          <div class="council-item">
            <div>
              <div class="council-role">${m.role}</div>
              <div class="council-name">${m.name}</div>
            </div>
            ${m.contact ? `<div class="contact-links" style="margin-left:auto"><a class="contact-link call" href="tel:${m.contact}">📞</a></div>` : ''}
          </div>`).join('')}
        </div>
       </div>` : '';

  const timeline = (s.timeline || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Timeline</div>
        <div class="timeline">${s.timeline.map(t => `
          <div class="timeline-item">
            <div class="timeline-dot-wrap"><div class="timeline-dot"></div><div class="timeline-line"></div></div>
            <div class="timeline-content"><div class="timeline-date">${t.date}</div><div class="timeline-event">${t.event}</div></div>
          </div>`).join('')}
        </div>
       </div>` : '';

  const links = (s.links || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Links & Join</div>
        <div class="links-list">${s.links.map(l => `
          <a class="link-item" href="${l.url}" target="_blank" rel="noopener">
            <span class="link-item-icon">${getLinkIcon(l.label)}</span>
            <span class="link-item-label">${l.label}</span>
            <span class="link-item-arrow">↗</span>
          </a>`).join('')}
        </div>
       </div>` : '';

  const whatsapp = s.whatsappGroup
    ? `<div class="modal-section">
        <div class="modal-section-title">WhatsApp Community</div>
        <a class="link-item" href="${s.whatsappGroup}" target="_blank" rel="noopener">
          <span class="link-item-icon">💬</span>
          <span class="link-item-label">Join WhatsApp Group</span>
          <span class="link-item-arrow">↗</span>
        </a>
       </div>` : '';

  const contacts = (s.contacts || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Contact</div>
        <div class="contacts-list">${s.contacts.map(c => `
          <div class="contact-item">
            <div class="contact-avatar">👤</div>
            <div class="contact-info">
              <div class="contact-name">${c.name}</div>
              ${c.phone ? `<div class="contact-phone">${c.phone}</div>` : ''}
            </div>
            <div class="contact-links">
              ${c.phone ? `<a class="contact-link call" href="tel:${c.phone}">📞 Call</a>` : ''}
              ${c.whatsapp ? `<a class="contact-link whatsapp" href="${c.whatsapp}" target="_blank">💬 WhatsApp</a>` : ''}
            </div>
          </div>`).join('')}
        </div>
       </div>` : '';

  return `
    <div class="modal-society-header">
      ${logoHtml}
      <div>
        <div class="modal-title" style="-webkit-text-fill-color:unset;color:var(--text)">${s.name}</div>
        ${s.tagline ? `<div class="modal-subtitle">${s.tagline}</div>` : ''}
        ${s.category ? `<span class="tag cyan">${s.category}</span>` : ''}
      </div>
    </div>
    ${badge}
    ${desc}
    ${council}
    ${timeline}
    ${links}
    ${whatsapp}
    ${contacts}
  `;
}

// ════════════════════════
// DELHI NCR COLLEGE EVENTS
// ════════════════════════
async function loadCollegeEvents() {
  try {
    const result = await apiFetch('/api/college-events');
    // Hybrid check: Handles both raw array responses and wrapped objects
    allCollegeEvents = Array.isArray(result) ? result : (result.data || []);
    dataLoaded.college = true;
    if (result && result.source === 'cache') showDbBanner(true);
    renderCollegeEvents(allCollegeEvents);
  } catch (err) {
    const grid = $('college-grid');
    if (grid) grid.innerHTML = emptyState('⚠️', 'Oops!', 'Could not load fests.');
  }
}

function renderCollegeEvents(events) {
  const grid = $('college-grid');
  if (!grid) return;
  if (!events.length) {
    grid.innerHTML = emptyState('🎪', 'No fests listed yet!', 'Add yours — mail at <a href="mailto:saksham16711@gmail.com">saksham16711@gmail.com</a>');
    return;
  }
  grid.innerHTML = events.map((ev, i) => collegeCard(ev, i)).join('');
}

function collegeCard(ev, i) {
  const isFree = !ev.passPrice || ev.passPrice === 'Free' || ev.passPrice === '0';
  const priceClass = isFree ? 'free' : '';
  const priceText = isFree ? '🆓 Free' : `🎟️ ₹${ev.passPrice}`;

  const bannerContent = ev.image
    ? `<img src="${ev.image}" alt="${ev.name}" onerror="this.remove()">`
    : `🎪`;

  return `<div class="college-card card-anim" style="animation-delay:${i * 0.06}s" onclick="openCollegeModal('${ev._id}')">
    <div class="college-card-banner">${bannerContent}</div>
    <div class="college-card-body">
      <div class="college-card-name">${ev.name}</div>
      <div class="college-card-college">🏫 ${ev.college}</div>
      <div class="college-card-info">
        ${ev.date ? `<span class="college-info-item">📅 ${ev.date}</span>` : ''}
        ${ev.venue ? `<span class="college-info-item">📍 ${ev.venue}</span>` : ''}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="pass-price ${priceClass}">${priceText}</span>
        ${ev.registrationDeadline ? `<span class="tag amber">⏳ Deadline: ${ev.registrationDeadline}</span>` : ''}
      </div>
    </div>
  </div>`;
}

function filterCollegeEvents() {
  const searchInput = $('search-college');
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase();
  const filtered = allCollegeEvents.filter(ev =>
    ev.name.toLowerCase().includes(q) ||
    ev.college.toLowerCase().includes(q) ||
    (ev.venue || '').toLowerCase().includes(q)
  );
  renderCollegeEvents(filtered);
}

async function openCollegeModal(id) {
  let ev = allCollegeEvents.find(x => x._id === id);
  if (!ev) {
    try { 
      const r = await apiFetch(`/api/college-events/${id}`); 
      ev = r.data || r; // Hybrid check for single items
    } catch { return; }
  }
  if (!ev) return;
  const body = $('modal-body');
  if (body) {
    body.innerHTML = buildCollegeModal(ev);
    openModal();
  }
}

function buildCollegeModal(ev) {
  const isFree = !ev.passPrice || ev.passPrice === 'Free' || ev.passPrice === '0';
  const priceClass = isFree ? 'free' : '';
  const priceText = isFree ? '🆓 Free Entry' : `🎟️ Pass: ₹${ev.passPrice}`;

  const bannerHtml = ev.image
    ? `<img class="modal-hero" src="${ev.image}" alt="${ev.name}" onerror="this.outerHTML='<div class=modal-hero-placeholder>🎪</div>'">`
    : `<div class="modal-hero-placeholder">🎪</div>`;

  const infoBadges = [
    ev.date ? `<div class="info-badge">📅 <strong>${ev.date}</strong></div>` : '',
    ev.venue ? `<div class="info-badge">📍 <strong>${ev.venue}</strong></div>` : '',
    `<div class="info-badge"><span class="pass-price ${priceClass}">${priceText}</span></div>`,
    ev.registrationDeadline ? `<div class="info-badge">⏳ Deadline: <strong>${ev.registrationDeadline}</strong></div>` : '',
  ].filter(Boolean).join('');

  const desc = ev.description
    ? `<div class="modal-section"><div class="modal-section-title">About</div><p class="modal-desc">${ev.description}</p></div>` : '';

  const process = ev.registrationProcess
    ? `<div class="modal-section"><div class="modal-section-title">Registration Process</div><p class="modal-desc">${ev.registrationProcess}</p></div>` : '';

  const performers = (ev.performers || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Performers & Stars</div>
        <div class="performers-list">${ev.performers.map(p => `
          <span class="performer-chip">${p.type === 'singer' ? '🎤' : p.type === 'dj' ? '🎧' : '⭐'} ${p.name}</span>`).join('')}
        </div>
       </div>` : '';

  const itinerary = (ev.itinerary || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Itinerary</div>
        <div class="itinerary-list">${ev.itinerary.map(item => `
          <div class="itinerary-item">
            <span class="itinerary-time">${item.time}</span>
            <span class="itinerary-activity">${item.activity}</span>
          </div>`).join('')}
        </div>
       </div>` : '';

  const links = [
    ev.passLink ? `<a class="link-item" href="${ev.passLink}" target="_blank"><span class="link-item-icon">🎟️</span><span class="link-item-label">Get Pass / Register</span><span class="link-item-arrow">↗</span></a>` : '',
    ...(ev.links || []).map(l => `<a class="link-item" href="${l.url}" target="_blank"><span class="link-item-icon">${getLinkIcon(l.label)}</span><span class="link-item-label">${l.label}</span><span class="link-item-arrow">↗</span></a>`)
  ].filter(Boolean);

  const linksHtml = links.length
    ? `<div class="modal-section"><div class="modal-section-title">Links & Passes</div><div class="links-list">${links.join('')}</div></div>` : '';

  const contacts = (ev.contacts || []).length
    ? `<div class="modal-section">
        <div class="modal-section-title">Contact</div>
        <div class="contacts-list">${ev.contacts.map(c => `
          <div class="contact-item">
            <div class="contact-avatar">👤</div>
            <div class="contact-info">
              <div class="contact-name">${c.name}</div>
              ${c.phone ? `<div class="contact-phone">${c.phone}</div>` : ''}
            </div>
            <div class="contact-links">
              ${c.phone ? `<a class="contact-link call" href="tel:${c.phone}">📞 Call</a>` : ''}
              ${c.whatsapp ? `<a class="contact-link whatsapp" href="${c.whatsapp}" target="_blank">💬 WhatsApp</a>` : ''}
            </div>
          </div>`).join('')}
        </div>
       </div>` : '';

  return `
    ${bannerHtml}
    <div class="modal-title">${ev.name}</div>
    <div class="modal-subtitle">🏫 ${ev.college}</div>
    ${infoBadges ? `<div class="info-badges">${infoBadges}</div>` : ''}
    ${desc}
    ${process}
    ${performers}
    ${itinerary}
    ${linksHtml}
    ${contacts}
  `;
}

// ════════════════════════
// MODAL
// ════════════════════════
function openModal() {
  $('modal-overlay').classList.add('open');
  $('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Scroll modal to top
  $('modal-body').scrollTop = 0;
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  $('modal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ════════════════════════
// HELPERS
// ════════════════════════
function emptyState(icon, title, msg) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <div class="empty-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${msg}</p>
  </div>`;
}

function getLinkIcon(label = '') {
  const l = label.toLowerCase();
  if (l.includes('instagram')) return '📸';
  if (l.includes('whatsapp')) return '💬';
  if (l.includes('form') || l.includes('register')) return '📋';
  if (l.includes('youtube')) return '▶️';
  if (l.includes('website')) return '🌐';
  if (l.includes('facebook')) return '📘';
  if (l.includes('join')) return '➕';
  return '🔗';
}

// ════════════════════════
// INIT — Load Societies on Start
// ════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadSocieties();

  // Check DB health silently every 60s to update banner
  setInterval(async () => {
    try {
      const r = await apiFetch('/api/health');
      if (r && r.db === 'connected') showDbBanner(false);
      else showDbBanner(true);
    } catch { /* server might be down */ }
  }, 60000);
});