/* Responsive JS improvements + existing functionality */

/* Short helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Set current year */
const yEl = document.getElementById('year');
if(yEl) yEl.textContent = new Date().getFullYear();

/* Mobile nav toggle (improved ARIA) */
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if(navToggle && navList){
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // close nav when clicking outside
  document.addEventListener('click', (e) => {
    if(!navList.contains(e.target) && !navToggle.contains(e.target) && navList.classList.contains('open')){
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
    }
  });
}

/* Smooth nav scrolling (no layout shift) */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if(target){
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
    // close mobile nav after clicking
    if(navList && navList.classList.contains('open')){
      navList.classList.remove('open');
      navToggle?.setAttribute('aria-expanded','false');
    }
  });
});

/* GALLERY: keep placeholder until images inserted */
const galleryGrid = document.getElementById('gallery-grid');
const placeholderHtml = `
  <div class="gallery-empty">
    <h4>Gallery Updated Soon</h4>
    <p>हम जल्द ही यहाँ पर designs के images अपलोड कर देंगे — तब तक संपर्क करें।</p>
  </div>
`;
if(galleryGrid && galleryGrid.innerHTML.trim() === ''){
  galleryGrid.innerHTML = placeholderHtml;
}

/* Masonry item click -> lightbox */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbDownload = document.getElementById('lb-download');
const lbClose = document.querySelector('.lb-close');

function enableGalleryClicks(){
  document.querySelectorAll('.masonry-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.removeEventListener('click', img._clickHandler); // remove old
    const handler = () => openLightbox(img.src);
    img.addEventListener('click', handler);
    img._clickHandler = handler;
  });
}
function openLightbox(src){
  if(!lightbox) return;
  lbImg.src = src;
  lbDownload.href = src;
  lbDownload.setAttribute('download', src.split('/').pop() || 'design.jpg');
  lightbox.setAttribute('aria-hidden','false');
  document.documentElement.style.overflow = 'hidden';
}
function closeLightbox(){
  if(!lightbox) return;
  lightbox.setAttribute('aria-hidden','true');
  if(lbImg) lbImg.src = '';
  document.documentElement.style.overflow = '';
}
if(lbClose) lbClose.addEventListener('click', closeLightbox);
if(lightbox){
  const backdrop = lightbox.querySelector('.lightbox-backdrop');
  backdrop?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox();
  });
}

/* Reviews localStorage (unchanged core logic) */
const REV_KEY = 'manaklal_reviews_v1';
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');
const clearBtn = document.getElementById('clear-reviews');

function getReviews(){
  try { return JSON.parse(localStorage.getItem(REV_KEY)) || []; } catch(e){ return []; }
}
function saveReviews(arr){ localStorage.setItem(REV_KEY, JSON.stringify(arr)); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); }

function renderReviews(){
  if(!reviewsList) return;
  const reviews = getReviews();
  reviewsList.innerHTML = '';
  if(reviews.length === 0){
    reviewsList.innerHTML = `<div class="review-card text-center"><em>No reviews yet — be the first to share your experience!</em></div>`;
    return;
  }
  const avg = (reviews.reduce((s,r)=> s + Number(r.rating),0) / reviews.length).toFixed(1);
  const avgCard = document.createElement('div');
  avgCard.className = 'review-card';
  avgCard.innerHTML = `<strong>Average Rating:</strong> ${avg} / 5 (${reviews.length} reviews)`;
  reviewsList.appendChild(avgCard);

  reviews.slice().reverse().forEach(r => {
    const c = document.createElement('div');
    c.className = 'review-card';
    c.innerHTML = `
      <div class="review-meta">
        <div class="review-name">${escapeHtml(r.name)}</div>
        <div style="margin-left:auto;color:var(--muted)">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      </div>
      <div class="review-text" style="margin-top:8px">${escapeHtml(r.text)}</div>
      <div style="margin-top:8px;color:var(--muted);font-size:12px">${new Date(r.time).toLocaleString()}</div>
    `;
    reviewsList.appendChild(c);
  });
}

reviewForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('rname').value.trim();
  const text = document.getElementById('rtext').value.trim();
  const rating = document.getElementById('rrating').value;
  if(!name || !text) return alert('कृपया नाम और review भरें।');
  const reviews = getReviews();
  reviews.push({name, text, rating:Number(rating), time: Date.now()});
  saveReviews(reviews);
  renderReviews();
  reviewForm.reset();
});

clearBtn?.addEventListener('click', () => {
  if(confirm('सभी reviews हटा देने हैं?')) {
    localStorage.removeItem(REV_KEY);
    renderReviews();
  }
});

/* Finalize: enable gallery clicks and render reviews */
enableGalleryClicks();
renderReviews();

/* If you later programmatically add images with addImagesToCategory, call enableGalleryClicks() after insertion. */
