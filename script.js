/* Main JS for MANAK LAL TAILOR website */
/* --- Basic dom helpers --- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Set current year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile nav toggle */
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
navToggle?.addEventListener('click', () => {
  navList.classList.toggle('open');
});

/* Smooth page nav + glow animation on click */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({behavior:'smooth'});
    // glow effect
    link.classList.add('active-glow');
    setTimeout(()=> link.classList.remove('active-glow'), 800);
  });
});

/* Gallery categories & masonry behavior */
/* We show a placeholder "Gallery Updated Soon" until images are provided.
   When images are added later, they should be inserted as <div class="masonry-item"><img src="path" alt=""></div>
*/
const galleryGrid = document.getElementById('gallery-grid');
const galleryEmpty = galleryGrid.querySelector('.gallery-empty');

function clearGallery() {
  galleryGrid.innerHTML = '';
}
function showGalleryPlaceholder() {
  galleryGrid.innerHTML = '';
  galleryGrid.appendChild(galleryEmpty);
}

// Initialize with placeholder
showGalleryPlaceholder();

/* Example helper if you later want to programmatically insert images:
   addImagesToCategory('blouse', ['img1.jpg','img2.jpg' ...]);
*/
function addImagesToCategory(cat, imageUrls=[]) {
  // Remove placeholder if present
  if (galleryGrid.contains(galleryEmpty)) galleryGrid.removeChild(galleryEmpty);

  imageUrls.forEach(url => {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.innerHTML = `
      <img src="${url}" alt="${cat} design" loading="lazy" />
    `;
    galleryGrid.appendChild(item);
  });
  enableGalleryClicks(); // enable lightbox for newly added images
}

/* Category buttons (switching UI - currently no separate images per category stored) */
$$('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // If you later store per-category images, you can load them here.
    // For now, we just show placeholder if no images.
    if (galleryGrid.children.length === 0 || galleryGrid.contains(galleryEmpty)) {
      showGalleryPlaceholder();
    }
  });
});

/* Lightbox (zoom) + download function */
const lightbox = $('#lightbox');
const lbImg = $('#lb-img');
const lbDownload = $('#lb-download');
const lbClose = $('.lb-close');

function enableGalleryClicks() {
  document.querySelectorAll('.masonry-item img').forEach(img => {
    // add pointer style
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox(img.src);
    });
  });
}

function openLightbox(src) {
  lbImg.src = src;
  lbDownload.href = src;
  lbDownload.setAttribute('download', src.split('/').pop() || 'design.jpg');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.setAttribute('aria-hidden','true');
  lbImg.src = '';
  document.body.style.overflow = '';
}
lbClose?.addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

/* Reviews system — localStorage */
const REV_KEY = 'manaklal_reviews_v1';
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');
const clearBtn = document.getElementById('clear-reviews');

function getReviews(){
  try {
    const raw = localStorage.getItem(REV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    return [];
  }
}
function saveReviews(arr){
  localStorage.setItem(REV_KEY, JSON.stringify(arr));
}
function renderReviews(){
  const reviews = getReviews();
  reviewsList.innerHTML = '';
  if(reviews.length === 0){
    reviewsList.innerHTML = `<div class="review-card text-center"><em>No reviews yet — be the first to share your experience!</em></div>`;
    return;
  }

  // show average
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

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

reviewForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#rname').value.trim();
  const text = $('#rtext').value.trim();
  const rating = $('#rrating').value;
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

/* initial render */
renderReviews();

/* If someone later programmatically wants to add demo images for testing, uncomment example:
addImagesToCategory('blouse', [
  'https://picsum.photos/seed/b1/800/1000',
  'https://picsum.photos/seed/b2/800/1100',
  'https://picsum.photos/seed/b3/800/900'
]);
*/

/* Accessibility helper: close lightbox on Escape */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox();
});

/* Enable gallery clicks if images already present on load */
enableGalleryClicks();
