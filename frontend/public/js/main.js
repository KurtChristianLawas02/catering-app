/**
 * ============================================
 * MAIN APPLICATION JAVASCRIPT
 * ============================================
 */

const API = '';

/**
 * HAMBURGER MENU TOGGLE
 */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

/**
 * FILE UPLOAD HANDLING
 */
const inspirationImage = document.getElementById('inspiration_image');

if (inspirationImage) {
  inspirationImage.addEventListener('change', function () {
    const name = this.files[0] ? this.files[0].name : '';
    document.getElementById('file-label-text').textContent =
      name || 'Click to upload an image';
    document.getElementById('file-name-display').textContent = name
      ? `Selected: ${name}`
      : '';
  });
}

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
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  const packageInclusions = {
    silver: {
      label: 'Silver Package',
      items: [
        '150 Pax Catering Service',
        '4 Main Dishes, Rice, 1 Round Soft Drinks, 1 Dessert',
        'Buffet Table, Chaffing Dishes and Complete Utensils',
        'Tables with Center Pieces',
        '130 Chairs (Monoblock) with Cover',
        '7 Waiters, Service Water',
        'Bride and Groom Attires, Best Man and Maid of Honor Attires',
        '4 Brides Maids, 4 Grooms Men',
        '3 Flower Girls, 3 Bearers',
        '2 Female Parents, 2 Male Parents',
        'Bridal Robes, 1pc Mannequin, Cord, Veil, Ring and Coin Pillows',
        "Couple's Backdrop, 20 x 20 Ceiling Works",
        'Elegant Chandeliers, Decorations with Elegant Set Up',
        "Presidential Table Set Up, Couple's Table, Guests Table Set Up",
        'Cake Table Set Up, Elegant Entrance Decor',
        '8-10 Heads Hair and Make Up',
        'Flower Girls Make Up with Hair Dresser',
        "Bridal Bouquet, Groom's Boutonniere",
        'Entourage Bouquets, Entourage & Parents Principal Sponsors Boutonniers',
        'Secondary Sponsors Boutonniers',
        '4 Moving Heads',
        '2 Powered Speakers, 2 Sub Speakers',
        '2 Wireless Microphones, 16 Par LED and Mode Lights',
        'Smoke Machine, LED Wall',
        '10 Church Aisles Standee with Fresh Flowers',
        'Professional DJ, Professional Emcee',
        'Arranged Program',
        '2 Layered Cake, All Can Be Eaten',
        '1 Bottle of Sparkling Wine',
        'Red Carpet, Bridal Car',
        '30 Pcs Customized Invitation Letters with Photocopies for Approval',
        'Professional Photographer',
        'Prenup Video and Photos, Photo and Video (SDE)',
        'Unlimited Shoots from Preparation Area to Church Until Reception',
        '1 Official Coordinator and 1 Assistant Coordinator',
        'No Hidden Charges, Official Receipt and Contract Included',
      ],
    },
    gold: {
      label: 'Gold Package',
      items: [
        '250 Pax Catering Service',
        '4 Main Dishes, Rice, 1 Round Soft Drinks, 1 Dessert',
        '2 Sets of Buffet Table, Chaffing Dishes and Complete Utensils',
        'Tables with Center Pieces',
        '230 Chairs (Monoblock) with Cover',
        '12 Waiters, Service Water',
        'Bride and Groom Attires, Best Man and Maid of Honor Attires',
        '4 Brides Maids, 4 Grooms Men',
        '3 Bearers, 3 Flower Girls',
        '2 Female Parents, 2 Male Parents',
        'Bridal Robes, Mannequin, Cord, Veil, Ring and Coin Pillows',
        "Couple's Backdrop, 40 x 40 Ceiling Works",
        '20pcs Elegant Chandeliers',
        'Decorations with Elegant Set Up',
        "Presidential Table Set Up, Couple's Table, Cake Table Set Up",
        'Elegant Entrance Decor',
        "Bridal Bouquet, Groom's Boutonniere",
        'Entourage Bouquets, Parents & Principal Sponsors Boutonniers',
        '10 Church Aisles Standee with Fresh Flowers',
        'Red Carpet, Bridal Car',
        'LED Wall',
        'Smoke Machine (Low-Lying), 6 Moving Heads',
        '2 Powered Speakers, 2 Sub Speakers',
        '2 Wireless Microphones, 20 Par LED and Mode Lights',
        '8-10 Heads Hair and Make Up',
        'Flower Girls Make Up with Hair Dresser',
        'Professional DJ, Professional Emcee',
        'Arranged Program',
        '3 Layered Cake, All Can Be Eaten',
        '1 Bottle of Sparkling Wine',
        '30 Pcs Customized Invitation Letters with Photocopies for Approval',
        'Professional Photographer',
        'Prenup Video and Photos, Photo and Video (SDE)',
        'Unlimited Shoots from Preparation Area to Church Until Reception',
        'Photobooth - On the Day Photos for the Guest',
        'With 4R Hard Copies, 3 Hour Service of Shoot',
        '2 Units Iwata Big Fans, 1 Set of Lighted Dance Floor',
        '1 Official Coordinator and 1 Assistant Coordinator',
        'No Hidden Charges, Official Receipt and Contract Included',
      ],
    },
    aluminum: {
      label: 'Aluminum Package',
      items: [
        '120 Pax Catering Service',
        '4 Main Dishes, Rice, 1 Round Soft Drinks, 1 Dessert',
        'Buffet Table, Chaffing Dishes and Complete Utensils',
        'Tables with Center Pieces',
        '100 Chairs (Monoblock) with Cover',
        '7 Waiters, Service Water',
        'Bride and Groom Attires, Best Man and Maid of Honor Attires',
        '4 Brides Maids, 4 Grooms Men',
        '3 Flower Girls, 3 Bearers',
        '2 Female Parents, 2 Male Parents',
        'Bridal Robes, 1pc Mannequin, Cord, Veil, Ring and Coin Pillows',
        "Couple's Backdrop, 20 x 20 Ceiling Works",
        'Elegant Chandeliers, Decorations with Elegant Set Up',
        "Presidential Table Set Up, Couple's Table, Guests Table Set Up",
        'Cake Table Set Up, Elegant Entrance Decor',
        '8-10 Heads Hair and Make Up',
        'Flower Girls Make Up with Hair Dresser',
        "Bridal Bouquet, Groom's Boutonniere",
        'Entourage Bouquets, Entourage & Parents Principal Sponsors Boutonniers',
        'Secondary Sponsors Boutonniers',
        'Basic Sound System, 4 Moving Heads',
        '2 Powered Speakers, 2 Sub Speakers',
        '2 Wireless Microphones, 16 Par LED and Mode Lights',
        '10 Church Aisles Standee with Fresh Flowers',
        'Professional DJ, Professional Emcee',
        'Arranged Program',
        '2 Layered Cake, All Can Be Eaten',
        '1 Bottle of Sparkling Wine',
        'Red Carpet, Bridal Car',
        '30 Pcs Customized Invitation Letters with Photocopies for Approval',
        'Professional Photographer',
        'Prenup Video and Photos, Photo and Video (SDE)',
        'Unlimited Shoots from Preparation Area to Church Until Reception',
        '1 Official Coordinator and 1 Assistant Coordinator',
        'No Hidden Charges, Official Receipt and Contract Included',
      ],
    },
  };
  const packageSelect = bookingForm.querySelector('[name="food_package"]');
  const customizePanel = document.getElementById('customizePanel');
  const customizeCount = document.getElementById('customizeCount');
  const packageInclusionsPanel = document.getElementById('packageInclusionsPanel');
  const packageInclusionsTitle = document.getElementById('packageInclusionsTitle');
  const packageInclusionsCount = document.getElementById('packageInclusionsCount');
  const packageInclusionsList = document.getElementById('packageInclusionsList');
  const addPackageInclusionBtn = document.getElementById('addPackageInclusionBtn');

  function escapeAttribute(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function updateCustomizeCount() {
    if (!customizePanel || !customizeCount) return;
    const selectedCount = customizePanel.querySelectorAll('input[type="checkbox"]:checked').length;
    customizeCount.textContent = `${selectedCount} option${selectedCount === 1 ? '' : 's'} selected`;
  }

  function updatePackageInclusionsCount() {
    if (!packageInclusionsList || !packageInclusionsCount) return;
    const selectedCount = collectPackageInclusions().length;
    packageInclusionsCount.textContent = `${selectedCount} inclusion${selectedCount === 1 ? '' : 's'} selected`;
  }

  function createPackageInclusionRow(value = '', checked = true) {
    const row = document.createElement('div');
    row.className = 'package-inclusion-row';
    row.innerHTML = `
      <input type="checkbox" class="package-inclusion-check" ${checked ? 'checked' : ''} aria-label="Include item">
      <input type="text" class="package-inclusion-text" value="${escapeAttribute(value)}" placeholder="Type package inclusion">
      <button class="inclusion-remove-btn" type="button" aria-label="Remove inclusion">&times;</button>
    `;
    row.querySelector('.package-inclusion-check').addEventListener('change', updatePackageInclusionsCount);
    row.querySelector('.package-inclusion-text').addEventListener('input', updatePackageInclusionsCount);
    row.querySelector('.inclusion-remove-btn').addEventListener('click', () => {
      row.remove();
      updatePackageInclusionsCount();
    });
    return row;
  }

  function collectPackageInclusions() {
    if (!packageInclusionsList) return [];
    return Array.from(packageInclusionsList.querySelectorAll('.package-inclusion-row'))
      .filter(row => row.querySelector('.package-inclusion-check').checked)
      .map(row => row.querySelector('.package-inclusion-text').value.trim())
      .filter(Boolean);
  }

  function renderPackageInclusions(packageKey) {
    if (!packageInclusionsPanel || !packageInclusionsList) return;
    const selectedPackage = packageInclusions[packageKey];

    if (!selectedPackage) {
      packageInclusionsPanel.hidden = true;
      packageInclusionsList.innerHTML = '';
      updatePackageInclusionsCount();
      return;
    }

    packageInclusionsPanel.hidden = false;
    if (packageInclusionsTitle) {
      packageInclusionsTitle.textContent = `${selectedPackage.label} Inclusions`;
    }
    packageInclusionsList.innerHTML = '';
    selectedPackage.items.forEach((item) => {
      packageInclusionsList.appendChild(createPackageInclusionRow(item, true));
    });
    updatePackageInclusionsCount();
  }

  function syncCustomizeVisibility() {
    if (!packageSelect || !customizePanel) return;
    const isCustomize = packageSelect.value === 'customize';
    customizePanel.hidden = !isCustomize;
    renderPackageInclusions(isCustomize ? '' : packageSelect.value);
    if (!isCustomize) {
      customizePanel.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = false;
      });
    }
    updateCustomizeCount();
  }

  if (packageSelect) {
    packageSelect.addEventListener('change', syncCustomizeVisibility);
    syncCustomizeVisibility();
  }

  if (customizePanel) {
    customizePanel.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', updateCustomizeCount);
    });
  }

  if (addPackageInclusionBtn && packageInclusionsList) {
    addPackageInclusionBtn.addEventListener('click', () => {
      packageInclusionsList.appendChild(createPackageInclusionRow('', true));
      updatePackageInclusionsCount();
      const newInput = packageInclusionsList.querySelector('.package-inclusion-row:last-child .package-inclusion-text');
      if (newInput) newInput.focus();
    });
  }

  bookingForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  if (!validateForm(formData)) return;

  if (formData.get('food_package') === 'customize') {
    const selectedOptions = formData.getAll('custom_package_options').filter(Boolean);
    if (!selectedOptions.length) {
      const msg = document.getElementById('formMessage');
      msg.textContent = 'Please choose at least one customize option for your booking.';
      msg.className = 'form-message error show';
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const existingNotes = String(formData.get('food_package_details') || '').trim();
    const customizeNotes = `Selected customize options:\n- ${selectedOptions.join('\n- ')}`;
    formData.set(
      'food_package_details',
      existingNotes ? `${customizeNotes}\n\nNotes: ${existingNotes}` : customizeNotes
    );
  } else if (packageInclusions[formData.get('food_package')]) {
    const selectedPackage = packageInclusions[formData.get('food_package')];
    const selectedInclusions = collectPackageInclusions();
    if (!selectedInclusions.length) {
      const msg = document.getElementById('formMessage');
      msg.textContent = 'Please keep at least one package inclusion or add a new one.';
      msg.className = 'form-message error show';
      msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const existingNotes = String(formData.get('food_package_details') || '').trim();
    const packageNotes = `${selectedPackage.label} inclusions selected:\n- ${selectedInclusions.join('\n- ')}`;
    formData.set(
      'food_package_details',
      existingNotes ? `${packageNotes}\n\nNotes: ${existingNotes}` : packageNotes
    );
  }

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
      syncCustomizeVisibility();
      renderPackageInclusions('');
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
}

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
 * HERO SLIDESHOW
 * ============================================
 */
let heroSlideIndex = 1;
let heroSlideshowTimer;

function showHeroSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (!slides.length) return;
  if (n > slides.length) heroSlideIndex = 1;
  if (n < 1) heroSlideIndex = slides.length;

  slides.forEach((slide) => slide.classList.remove('active'));
  dots.forEach((dot) => dot.classList.remove('active'));
  slides[heroSlideIndex - 1].classList.add('active');
  if (dots[heroSlideIndex - 1]) dots[heroSlideIndex - 1].classList.add('active');
}

function changeHeroSlide(n) {
  showHeroSlide((heroSlideIndex += n));
  resetHeroSlideshowTimer();
}

function setHeroSlide(n) {
  showHeroSlide((heroSlideIndex = n));
  resetHeroSlideshowTimer();
}

function resetHeroSlideshowTimer() {
  clearInterval(heroSlideshowTimer);
  heroSlideshowTimer = setInterval(() => changeHeroSlide(1), 5500);
}

/**
 * ============================================
 * APPROVED EVENTS CALENDAR
 * ============================================
 */
let approvedEvents = [];
let visibleCalendarDate = new Date();

function eventDateKey(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderCalendar() {
  const monthLabel = document.getElementById('calendarMonth');
  const grid = document.getElementById('eventsCalendarGrid');
  if (!monthLabel || !grid) return;

  const year = visibleCalendarDate.getFullYear();
  const month = visibleCalendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const todayKey = dateKey(new Date());

  monthLabel.textContent = visibleCalendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const eventsByDate = approvedEvents.reduce((acc, eventItem) => {
    acc[eventItem.dateKey] = acc[eventItem.dateKey] || [];
    acc[eventItem.dateKey].push(eventItem);
    return acc;
  }, {});

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const key = dateKey(cellDate);
    const dayEvents = eventsByDate[key] || [];
    const visibleEvents = dayEvents.slice(0, 2);

    days.push(`
      <div class="calendar-day ${cellDate.getMonth() !== month ? 'muted' : ''} ${key === todayKey ? 'today' : ''}">
        <span class="calendar-date">${cellDate.getDate()}</span>
        ${visibleEvents.map((eventItem) => `
          <span class="calendar-event-pill ${eventItem.status === 'completed' ? 'completed' : ''}">
            ${eventItem.status === 'completed' ? 'Done: ' : ''}${titleCase(eventItem.event_type)}
          </span>
        `).join('')}
        ${dayEvents.length > 2 ? `<span class="calendar-more">+${dayEvents.length - 2} more</span>` : ''}
      </div>
    `);
  }

  grid.innerHTML = days.join('');
}

async function loadApprovedEvents() {
  try {
    const res = await fetch(`${API}/api/inquiries/approved-events`);
    const data = await res.json();
    approvedEvents = (data.data || []).map((eventItem) => ({
      ...eventItem,
      dateKey: eventDateKey(eventItem.event_date),
    }));
    if (approvedEvents.length) {
      visibleCalendarDate = parseDateFromKey(approvedEvents[0].dateKey);
    }
    renderCalendar();
  } catch (err) {
    renderCalendar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showHeroSlide(heroSlideIndex);
  resetHeroSlideshowTimer();

  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  if (prevMonth && nextMonth) {
    prevMonth.addEventListener('click', () => {
      visibleCalendarDate = new Date(visibleCalendarDate.getFullYear(), visibleCalendarDate.getMonth() - 1, 1);
      renderCalendar();
    });
    nextMonth.addEventListener('click', () => {
      visibleCalendarDate = new Date(visibleCalendarDate.getFullYear(), visibleCalendarDate.getMonth() + 1, 1);
      renderCalendar();
    });
    loadApprovedEvents();
  }
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
