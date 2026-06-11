// ---- Config ----
const API_BASE = 'https://open.er-api.com/v6/latest/';

const CURRENCY_META = {
  USD: { name: 'US Dollar',          cc: 'US' },
  EUR: { name: 'Euro',               cc: 'EU' },
  GBP: { name: 'British Pound',      cc: 'GB' },
  JPY: { name: 'Japanese Yen',       cc: 'JP' },
  CNY: { name: 'Chinese Yuan',       cc: 'CN' },
  INR: { name: 'Indian Rupee',       cc: 'IN' },
  PKR: { name: 'Pakistani Rupee',    cc: 'PK' },
  CAD: { name: 'Canadian Dollar',    cc: 'CA' },
  AUD: { name: 'Australian Dollar',  cc: 'AU' },
  CHF: { name: 'Swiss Franc',        cc: 'CH' },
  KRW: { name: 'South Korean Won',   cc: 'KR' },
  SGD: { name: 'Singapore Dollar',   cc: 'SG' },
  MXN: { name: 'Mexican Peso',       cc: 'MX' },
  BRL: { name: 'Brazilian Real',     cc: 'BR' },
  RUB: { name: 'Russian Ruble',      cc: 'RU' },
  ZAR: { name: 'South African Rand', cc: 'ZA' },
  AED: { name: 'UAE Dirham',         cc: 'AE' },
  SAR: { name: 'Saudi Riyal',        cc: 'SA' },
  HKD: { name: 'Hong Kong Dollar',   cc: 'HK' },
  NZD: { name: 'New Zealand Dollar', cc: 'NZ' },
  TRY: { name: 'Turkish Lira',       cc: 'TR' },
  SEK: { name: 'Swedish Krona',      cc: 'SE' },
  NOK: { name: 'Norwegian Krone',    cc: 'NO' },
  DKK: { name: 'Danish Krone',       cc: 'DK' },
  PLN: { name: 'Polish Zloty',       cc: 'PL' },
  THB: { name: 'Thai Baht',          cc: 'TH' },
  IDR: { name: 'Indonesian Rupiah',  cc: 'ID' },
  MYR: { name: 'Malaysian Ringgit',  cc: 'MY' },
  PHP: { name: 'Philippine Peso',    cc: 'PH' },
  EGP: { name: 'Egyptian Pound',     cc: 'EG' },
};

const POPULAR_PAIRS = [
  ['USD','EUR'],['USD','GBP'],['USD','JPY'],['USD','PKR'],
  ['USD','INR'],['EUR','GBP'],['USD','CAD'],['USD','AED'],
];

// ---- State ----
let rates    = {};
let baseCode = '';
let lastUpdated = '';
let allCodes = [];
let resultsVisible = false;

// current selected values
let fromValue = 'USD';
let toValue   = 'PKR';

// dropdown state
let activeDropdown = null; // 'from' | 'to' | null

// ---- DOM ----
const fromAmountEl   = document.getElementById('fromAmount');
const toAmountEl     = document.getElementById('toAmount');
const fromPickerBtn  = document.getElementById('fromPickerBtn');
const toPickerBtn    = document.getElementById('toPickerBtn');
const fromFlagEl     = document.getElementById('fromFlag');
const toFlagEl       = document.getElementById('toFlag');
const fromCodeEl     = document.getElementById('fromCode');
const fromNameEl     = document.getElementById('fromName');
const toCodeEl       = document.getElementById('toCode');
const toNameEl       = document.getElementById('toName');
const fromChevron    = document.getElementById('fromChevron');
const toChevron      = document.getElementById('toChevron');
const swapBtn        = document.getElementById('swapBtn');
const rateBadge      = document.getElementById('rateBadge');
const pairsGrid      = document.getElementById('pairsGrid');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid    = document.getElementById('resultsGrid');
const searchInput    = document.getElementById('searchInput');
const convertAllBtn  = document.getElementById('convertAllBtn');
const rateTimeEl     = document.getElementById('rateTime');
const themeBtn       = document.getElementById('themeBtn');
const themeIcon      = document.getElementById('themeIcon');
const dropdownPanel  = document.getElementById('dropdownPanel');
const dropdownSearch = document.getElementById('dropdownSearch');
const dropdownList   = document.getElementById('dropdownList');

// ---- Theme ----
const savedTheme = localStorage.getItem('xchange-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('xchange-theme', next);
  updateThemeIcon(next);
});
function updateThemeIcon(theme) {
  themeIcon.innerHTML = theme === 'light'
    ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
    : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
}

// ---- Custom Dropdown ----
function openDropdown(which) {
  activeDropdown = which;
  const trigger = which === 'from' ? fromPickerBtn : toPickerBtn;
  const currentVal = which === 'from' ? fromValue : toValue;

  // Position panel below trigger
  const rect = trigger.getBoundingClientRect();
  dropdownPanel.style.display = 'block';
  // Ensure it doesn't overflow right edge
  const panelW = 280;
  let left = rect.left + window.scrollX;
  if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
  dropdownPanel.style.left = left + 'px';
  dropdownPanel.style.top  = (rect.bottom + window.scrollY + 6) + 'px';

  // Chevron
  (which === 'from' ? fromChevron : toChevron).style.transform = 'rotate(180deg)';

  // Build list
  dropdownSearch.value = '';
  renderDropdownList('', currentVal);
  dropdownSearch.focus();
}

function closeDropdown() {
  if (!activeDropdown) return;
  dropdownPanel.style.display = 'none';
  fromChevron.style.transform = '';
  toChevron.style.transform   = '';
  activeDropdown = null;
}

function renderDropdownList(query, selectedVal) {
  const q = query.trim().toLowerCase();
  const filtered = allCodes.filter(code => {
    if (!q) return true;
    const meta = CURRENCY_META[code];
    return code.toLowerCase().includes(q) || (meta && meta.name.toLowerCase().includes(q));
  });
  dropdownList.innerHTML = '';
  filtered.forEach(code => {
    const meta = CURRENCY_META[code] || { name: code, cc: code.slice(0,2) };
    const li = document.createElement('li');
    if (code === selectedVal) li.classList.add('selected');
    li.setAttribute('role', 'option');
    li.innerHTML = `
      <span class="dl-code">${code}</span>
      <span class="dl-name">${meta.name}</span>
      <span class="dl-badge">${meta.cc}</span>
    `;
    li.addEventListener('mousedown', (e) => {
      e.preventDefault(); // prevent blur before click
      selectCurrency(activeDropdown, code);
    });
    dropdownList.appendChild(li);
  });
  // Scroll selected into view
  const sel = dropdownList.querySelector('.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

async function selectCurrency(which, code) {
  if (which === 'from') {
    fromValue = code;
    await fetchRates(code);
  } else {
    toValue = code;
  }
  updatePickers();
  convert();
  closeDropdown();
}

// ---- Picker triggers ----
fromPickerBtn.addEventListener('click', () => {
  if (activeDropdown === 'from') { closeDropdown(); return; }
  closeDropdown();
  openDropdown('from');
});
toPickerBtn.addEventListener('click', () => {
  if (activeDropdown === 'to') { closeDropdown(); return; }
  closeDropdown();
  openDropdown('to');
});

// Search filter
dropdownSearch.addEventListener('input', () => {
  const currentVal = activeDropdown === 'from' ? fromValue : toValue;
  renderDropdownList(dropdownSearch.value, currentVal);
});

// Close on outside click
document.addEventListener('mousedown', (e) => {
  if (!dropdownPanel.contains(e.target) &&
      e.target !== fromPickerBtn && !fromPickerBtn.contains(e.target) &&
      e.target !== toPickerBtn  && !toPickerBtn.contains(e.target)) {
    closeDropdown();
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDropdown();
});

// ---- Update picker display ----
function updatePickers() {
  const fm = CURRENCY_META[fromValue] || { name: fromValue, cc: fromValue.slice(0,2) };
  const tm = CURRENCY_META[toValue]   || { name: toValue,   cc: toValue.slice(0,2) };
  fromFlagEl.textContent = fm.cc;
  toFlagEl.textContent   = tm.cc;
  fromCodeEl.textContent = fromValue;
  fromNameEl.textContent = fm.name;
  toCodeEl.textContent   = toValue;
  toNameEl.textContent   = tm.name;
}

// ---- Fetch rates ----
async function fetchRates(base) {
  if (base === baseCode && Object.keys(rates).length) return;
  try {
    showError(null);
    const res = await fetch(API_BASE + base);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API error');
    rates = data.rates;
    baseCode = base;
    lastUpdated = data.time_last_update_utc || '';
    if (lastUpdated) {
      const d = new Date(lastUpdated);
      rateTimeEl.textContent = 'Updated ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (!allCodes.length) {
      allCodes = Object.keys(rates).sort();
    }
  } catch (e) {
    showError('Failed to load rates. Check your connection and try again.');
  }
}

// ---- Convert ----
function convert() {
  const amount = parseFloat(fromAmountEl.value);
  if (!fromValue || !toValue || isNaN(amount) || !rates[toValue] || !rates[fromValue]) {
    toAmountEl.textContent = '—';
    rateBadge.textContent = 'Fetching rates…';
    return;
  }
  const rate = rates[toValue] / rates[fromValue];
  const result = amount * rate;
  toAmountEl.textContent = formatNumber(result);
  rateBadge.textContent = `1 ${fromValue} = ${formatRate(rate)} ${toValue}`;
  if (resultsVisible) renderResults();
}

function formatNumber(n) {
  if (n >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}
function formatRate(r) {
  if (r >= 1) return r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return r.toFixed(6);
}

// ---- Swap ----
swapBtn.addEventListener('click', async () => {
  [fromValue, toValue] = [toValue, fromValue];
  updatePickers();
  await fetchRates(fromValue);
  convert();
});

// ---- Amount input ----
fromAmountEl.addEventListener('input', convert);

// ---- Quick amounts ----
document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    fromAmountEl.value = btn.dataset.val;
    convert();
  });
});

// ---- Popular pairs ----
async function renderPopularPairs() {
  pairsGrid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
  await fetchRates('USD');
  pairsGrid.innerHTML = '';
  POPULAR_PAIRS.forEach(([from, to]) => {
    const rate = rates[to] / rates[from];
    const card = document.createElement('div');
    card.className = 'pair-card';
    card.innerHTML = `
      <div class="pair-label">${from} → ${to}</div>
      <div class="pair-value">${formatRate(rate)}</div>
      <div class="pair-sub">1 ${from} = ${formatRate(rate)} ${to}</div>
    `;
    card.addEventListener('click', async () => {
      fromValue = from;
      toValue   = to;
      fromAmountEl.value = 1;
      updatePickers();
      await fetchRates(from);
      convert();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pairsGrid.appendChild(card);
  });
}

// ---- All currencies results ----
function renderResults() {
  const amount = parseFloat(fromAmountEl.value) || 1;
  const query  = searchInput.value.trim().toLowerCase();
  document.getElementById('resultsTitle').textContent = `${amount} ${fromValue} in all currencies`;
  resultsGrid.innerHTML = '';
  const filtered = allCodes.filter(code => {
    if (!query) return true;
    const meta = CURRENCY_META[code];
    return code.toLowerCase().includes(query) || (meta && meta.name.toLowerCase().includes(query));
  });
  filtered.forEach(code => {
    const rate      = rates[code] / rates[fromValue];
    const converted = amount * rate;
    const meta = CURRENCY_META[code] || { name: code, cc: code.slice(0,2) };
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-left">
        <span class="result-code">${code}</span>
        <span class="result-name">${meta.name}</span>
      </div>
      <div class="result-right">
        <span class="result-amount">${formatNumber(converted)}</span>
        <button class="copy-btn" title="Copy" data-val="${formatNumber(converted)} ${code}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
      </div>
    `;
    item.querySelector('.copy-btn').addEventListener('click', function() {
      navigator.clipboard.writeText(this.dataset.val).then(() => {
        this.classList.add('copied');
        setTimeout(() => this.classList.remove('copied'), 1500);
      });
    });
    resultsGrid.appendChild(item);
  });
}

// ---- Convert all btn ----
convertAllBtn.addEventListener('click', async () => {
  convertAllBtn.disabled = true;
  convertAllBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Loading…';
  await fetchRates(fromValue);
  resultsVisible = true;
  resultsSection.style.display = '';
  renderResults();
  convertAllBtn.disabled = false;
  convertAllBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Refresh Results`;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---- Search (results grid) ----
searchInput.addEventListener('input', renderResults);

// ---- Error ----
function showError(msg) {
  let el = document.querySelector('.error-msg');
  if (!msg) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement('div');
    el.className = 'error-msg';
    document.querySelector('main').prepend(el);
  }
  el.textContent = msg;
}

// ---- Init ----
(async function init() {
  await fetchRates('USD');
  updatePickers();
  convert();
  renderPopularPairs();
})();
