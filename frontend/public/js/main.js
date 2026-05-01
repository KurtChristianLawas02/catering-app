/**
 * ============================================
 * MAIN APPLICATION JAVASCRIPT
 * ============================================
 */

const API = '';

/**
 * HAMBURGER MENU TOGGLE
 */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});

/**
 * FILE UPLOAD HANDLING
 */
document.getElementById('inspiration_image').addEventListener('change', function () {
  const name = this.files[0] ? this.files[0].name : '';
  document.getElementById('file-label-text').textContent =
    name || 'Click to upload an image';
  document.getElementById('file-name-display').textContent = name
    ? `Selected: ${name}`
    : '';
});

/**
 * FORM VALIDATION HELPERS
 */
function showError(name, show) {
  const grp = document.getElementById(`grp-${name}`);
  if (!grp) return;
  const input = grp.querySelector('input,select,textarea');
  grp.classList.toggle('has-error', show);
  if (input) input.classList.toggle('error', show);
}

function validateForm(data) {
  let valid = true;
  const required = [
    'customer_name',
    'customer_email',
    'customer_phone',
    'customer_address',
    'event_type',
    'event_date',
    'event_time',
    'event_venue',
    'guest_count',
    'food_package',
    'decoration_theme',
    'flower_arrangement',
  ];

  // Check required fields
  required.forEach((f) => {
    const val = data.get(f);
    const empty = !val || !val.trim();
    showError(f, empty);
    if (empty) valid = false;
  });

  // Email validation
  const email = data.get('customer_email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('customer_email', true);
    valid = false;
  }

  // Date must be in the future
  const dateVal = data.get('event_date');
  if (dateVal && new Date(dateVal) < new Date(new Date().toDateString())) {
    showError('event_date', true);
    valid = false;
  }

  return valid;
}

/**
 * FORM SUBMISSION
 */
document.getElementById('bookingForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  if (!validateForm(formData)) return;

  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMessage');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  msg.className = 'form-message';

  try {
    const res = await fetch(`${API}/api/inquiries`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();

    if (res.ok) {
      msg.textContent = `✅ ${json.message} Your inquiry ID is #${json.inquiry_id}.`;
      msg.className = 'form-message success show';
      this.reset();
      document.getElementById('file-label-text').textContent =
        'Click to upload an image';
      document.getElementById('file-name-display').textContent = '';
    } else {
      msg.textContent = `⚠️ ${json.message}`;
      msg.className = 'form-message error show';
    }
  } catch (err) {
    msg.textContent = '❌ Network error. Please try again.';
    msg.className = 'form-message error show';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Inquiry';
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

/**
 * CLEAR ERROR ON INPUT
 */
document.querySelectorAll('input,select,textarea').forEach((el) => {
  el.addEventListener('input', () => {
    const grp = el.closest('.form-group');
    if (grp) {
      grp.classList.remove('has-error');
      el.classList.remove('error');
    }
  });
});

/**
 * ============================================
 * GALLERY SLIDESHOW
 * ============================================
 */
let currentSlideIndex = 1;
let slideshowTimer;

function changeSlide(n) {
  showSlide((currentSlideIndex += n));
  resetSlideshowTimer();
}

function currentSlide(n) {
  showSlide((currentSlideIndex = n));
  resetSlideshowTimer();
}

function showSlide(n) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  if (n > slides.length) {
    currentSlideIndex = 1;
  }
  if (n < 1) {
    currentSlideIndex = slides.length;
  }

  slides.forEach((slide) => {
    slide.classList.remove('active');
  });
  dots.forEach((dot) => {
    dot.classList.remove('active');
  });

  slides[currentSlideIndex - 1].classList.add('active');
  dots[currentSlideIndex - 1].classList.add('active');
}

function autoSlideshow() {
  changeSlide(1);
}

function resetSlideshowTimer() {
  clearInterval(slideshowTimer);
  slideshowTimer = setInterval(autoSlideshow, 5000);
}

// Initialize slideshow
document.addEventListener('DOMContentLoaded', () => {
  showSlide(currentSlideIndex);
  slideshowTimer = setInterval(autoSlideshow, 5000);
});

/**
 * ============================================
 * EXPANDABLE PACKAGES
 * ============================================
 */
function togglePackage(packageId) {
  const pkg = document.getElementById(packageId);
  const btn = event.target;
  
  pkg.classList.toggle('expanded');
  btn.textContent = pkg.classList.contains('expanded') ? 'See Less' : 'See More';
}
