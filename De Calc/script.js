/* ══════════════════════════════════════════════
   DeCalc — Calculator  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

// ── State ─────────────────────────────────────
let expr        = '';          // current expression string (display chars)
let result      = '0';         // current result string
let justEvaled  = false;       // true after = was pressed
let memory      = 0;           // memory register
let degMode     = true;        // true = degrees, false = radians
let sciOpen     = false;
let histOpen    = false;
let lastOp      = null;        // last operator pressed (for active highlight)
const HISTORY_KEY = 'decalc_history';
const MAX_HIST  = 20;

// ── DOM refs ──────────────────────────────────
const dispExpr   = document.getElementById('dispExpr');
const dispResult = document.getElementById('dispResult');
const memBadge   = document.getElementById('memBadge');
const copyBtn    = document.getElementById('copyBtn');
const degBtn     = document.getElementById('degBtn');
const sciBtn     = document.getElementById('sciBtn');
const histBtn    = document.getElementById('histBtn');
const sciPanel   = document.getElementById('sciPanel');
const histPanel  = document.getElementById('histPanel');
const histList   = document.getElementById('histList');
const clearHistBtn = document.getElementById('clearHistBtn');
const toastEl    = document.getElementById('toast') || (() => {
  const t = document.createElement('div');
  t.className = 'toast'; document.body.appendChild(t); return t;
})();

// ── Toast ─────────────────────────────────────
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// ── Display update ─────────────────────────────
function updateDisplay() {
  dispExpr.textContent = expr || ' ';

  // Auto-shrink large results
  const len = result.length;
  dispResult.className = 'display-result' + (len > 14 ? ' xsm' : len > 10 ? ' sm' : '');
  dispResult.textContent = result;

  // Memory badge
  memBadge.classList.toggle('hidden', memory === 0);
}

// ── Safe evaluator ────────────────────────────
function safeEval(raw) {
  // Convert display chars → JS
  let e = raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, '(Math.PI)')
    .replace(/ℯ/g, '(Math.E)')       // Euler ℯ (U+212F)
    .replace(/sin\(/g, '__sin(')
    .replace(/cos\(/g, '__cos(')
    .replace(/tan\(/g, '__tan(')
    .replace(/asin\(/g, '__asin(')
    .replace(/acos\(/g, '__acos(')
    .replace(/atan\(/g, '__atan(')
    .replace(/log\(/g, '__log(')
    .replace(/ln\(/g, '__ln(')
    .replace(/√\(/g, '__sqrt(')
    .replace(/∛\(/g, '__cbrt(');

  // Sanity check – only allow chars we know
  const stripped = e
    .replace(/[\d+\-*/.()%\s]/g, '')
    .replace(/__[a-z]+/g, '')
    .replace(/Math\.(PI|E)/g, '');
  if (stripped.length > 0) throw new Error('Invalid expression');

  const toRad  = (x) => degMode ? x * Math.PI / 180 : x;
  const fromRad= (x) => degMode ? x * 180 / Math.PI : x;

  const __sin  = (x) => Math.sin(toRad(x));
  const __cos  = (x) => Math.cos(toRad(x));
  const __tan  = (x) => Math.tan(toRad(x));
  const __asin = (x) => fromRad(Math.asin(x));
  const __acos = (x) => fromRad(Math.acos(x));
  const __atan = (x) => fromRad(Math.atan(x));
  const __log  = (x) => Math.log10(x);
  const __ln   = (x) => Math.log(x);
  const __sqrt = (x) => Math.sqrt(x);
  const __cbrt = (x) => Math.cbrt(x);

  // eslint-disable-next-line no-new-func
  const val = Function(
    '__sin','__cos','__tan','__asin','__acos','__atan',
    '__log','__ln','__sqrt','__cbrt',
    `"use strict"; return (${e});`
  )(__sin,__cos,__tan,__asin,__acos,__atan,__log,__ln,__sqrt,__cbrt);

  if (!isFinite(val)) throw new Error(isNaN(val) ? 'Not a number' : 'Infinity');
  return val;
}

// ── Format number ─────────────────────────────
function fmt(n) {
  if (typeof n !== 'number') return String(n);
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  // Use toPrecision to avoid floating point noise, then strip trailing zeros
  let s = parseFloat(n.toPrecision(12)).toString();
  // If too long use exponential
  if (s.replace('-','').replace('.','').length > 14) {
    s = n.toExponential(6);
  }
  return s;
}

// ── History ───────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}
function addHistory(exprStr, resStr) {
  const h = getHistory();
  h.unshift({ expr: exprStr, res: resStr, time: Date.now() });
  if (h.length > MAX_HIST) h.pop();
  saveHistory(h);
  renderHistory();
}
function renderHistory() {
  const h = getHistory();
  if (!h.length) {
    histList.innerHTML = '<div class="hist-empty"><i class="fas fa-calculator"></i><p>No history yet</p></div>';
    return;
  }
  histList.innerHTML = h.map((item, i) => {
    const ago = timeAgo(item.time);
    return `<div class="hist-item" data-index="${i}">
      <div class="hist-expr">${escHtml(item.expr)}</div>
      <div class="hist-res">${escHtml(item.res)}</div>
      <div class="hist-time">${ago}</div>
    </div>`;
  }).join('');
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Auto-close open parens ─────────────────────
function autoCloseParens(e) {
  const opens  = (e.match(/\(/g) || []).length;
  const closes = (e.match(/\)/g) || []).length;
  let s = e;
  for (let i = 0; i < opens - closes; i++) s += ')';
  return s;
}

// ── Button action handler ─────────────────────
function handleAction(action) {
  const ops = ['+', '−', '×', '÷'];

  // Operators
  if (ops.includes(action)) {
    if (justEvaled) { expr = result; justEvaled = false; }
    // replace trailing operator
    if (expr && ops.includes(expr.slice(-1))) {
      expr = expr.slice(0, -1);
    }
    if (!expr) { expr = result; }
    expr += action;
    lastOp = action;
    updateDisplay();
    highlightOp(action);
    return;
  }

  switch (action) {
    // ── Digits & dot
    case '0': case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9': {
      if (justEvaled) { expr = ''; justEvaled = false; }
      // Prevent leading zeros: "00" → "0"
      if (action === '0' && expr === '0') break;
      expr += action;
      break;
    }
    case '.': {
      if (justEvaled) { expr = '0'; justEvaled = false; }
      // Don't allow dot if last number already has one
      const lastNum = expr.split(/[+\-×÷(]/).pop();
      if (!lastNum.includes('.')) {
        if (!lastNum) expr += '0';
        expr += '.';
      }
      break;
    }

    // ── Clear / backspace
    case 'AC': case 'C':
      expr = ''; result = '0'; justEvaled = false; lastOp = null;
      clearOpHighlight();
      break;
    case 'backspace':
      if (justEvaled) { expr = ''; result = '0'; justEvaled = false; break; }
      // Remove last token (multi-char functions first, then single char)
      if      (/asin\($/.test(expr)) expr = expr.slice(0, -5);
      else if (/acos\($/.test(expr)) expr = expr.slice(0, -5);
      else if (/atan\($/.test(expr)) expr = expr.slice(0, -5);
      else if (/sin\($/.test(expr))  expr = expr.slice(0, -4);
      else if (/cos\($/.test(expr))  expr = expr.slice(0, -4);
      else if (/tan\($/.test(expr))  expr = expr.slice(0, -4);
      else if (/log\($/.test(expr))  expr = expr.slice(0, -4);
      else if (/ln\($/.test(expr))   expr = expr.slice(0, -3);
      else if (/√\($/.test(expr))    expr = expr.slice(0, -2);
      else if (/∛\($/.test(expr))    expr = expr.slice(0, -2);
      else if (/\*\*$/.test(expr))   expr = expr.slice(0, -2);
      else expr = expr.slice(0, -1);
      if (!expr) { result = '0'; }
      break;

    // ── Equals
    case '=': {
      if (!expr) break;
      const fullExpr = autoCloseParens(expr);
      try {
        const val = safeEval(fullExpr);
        const res = fmt(val);
        addHistory(fullExpr + ' =', res);
        result = res;
        expr   = fullExpr;
        justEvaled = true;
        lastOp = null;
        clearOpHighlight();
      } catch (err) {
        result = 'Error';
        setTimeout(() => { result = '0'; expr = ''; updateDisplay(); }, 1200);
      }
      break;
    }

    // ── ±  negate
    case 'negate': {
      if (justEvaled) {
        result = result.startsWith('-') ? result.slice(1) : '-' + result;
        expr = result; justEvaled = false;
      } else if (expr) {
        // Wrap last number in negation
        const m = expr.match(/^(.*[+\-×÷(]?)(\-?\d*\.?\d*)$/);
        if (m && m[2]) {
          const num = m[2];
          expr = m[1] + (num.startsWith('-') ? num.slice(1) : '-' + num);
        }
      }
      break;
    }

    // ── Percentage
    case '%': {
      if (!expr) break;
      const m = expr.match(/^(.*[+\-×÷])(\-?\d*\.?\d+)$/);
      if (m) {
        // Relative percent: 200+10% → 200+20
        try {
          const base = safeEval(m[1].slice(0, -1));
          const pct  = parseFloat(m[2]);
          expr = m[1] + fmt(base * pct / 100);
        } catch { expr += '/100'; }
      } else {
        // Standalone percent
        expr += '/100';
      }
      break;
    }

    // ── Memory
    case 'MC': memory = 0; updateDisplay(); toast('Memory cleared'); return;
    case 'MR': {
      if (justEvaled) expr = '';
      expr += fmt(memory);
      justEvaled = false;
      break;
    }
    case 'M+': {
      const v = getCurrentValue();
      if (v !== null) { memory += v; updateDisplay(); toast('Added to memory'); return; }
      break;
    }
    case 'M-': {
      const v = getCurrentValue();
      if (v !== null) { memory -= v; updateDisplay(); toast('Subtracted from memory'); return; }
      break;
    }
    case 'MS': {
      const v = getCurrentValue();
      if (v !== null) { memory = v; updateDisplay(); toast('Saved to memory'); return; }
      break;
    }

    // ── Scientific functions
    case 'sin':  appendFn('sin(');  break;
    case 'cos':  appendFn('cos(');  break;
    case 'tan':  appendFn('tan(');  break;
    case 'asin': appendFn('asin('); break;
    case 'acos': appendFn('acos('); break;
    case 'atan': appendFn('atan('); break;
    case 'log':  appendFn('log(');  break;
    case 'ln':   appendFn('ln(');   break;
    case 'sqrt': appendFn('√(');    break;

    case 'sq': {                    // x²
      if (justEvaled) { expr = `(${result})²`; }
      else if (expr)  { expr = `(${expr})²`; }
      // evaluate immediately
      try {
        const base2 = justEvaled ? parseFloat(result) : safeEval(expr.replace(/²$/, ''));
        expr = fmt(base2 * base2);
        result = expr;
        justEvaled = true;
      } catch { result = 'Error'; }
      break;
    }
    case 'pow': {                   // xʸ — append **
      if (justEvaled) { expr = result; justEvaled = false; }
      expr += '**';
      break;
    }
    case 'recip': {                 // 1/x
      try {
        const v2 = justEvaled ? parseFloat(result) : safeEval(autoCloseParens(expr));
        const res2 = fmt(1 / v2);
        addHistory(`1/(${fmt(v2)})`, res2);
        result = res2;
        expr   = res2;
        justEvaled = true;
      } catch { result = 'Error'; }
      break;
    }
    case 'pi':    appendConst('π');  break;
    case 'euler': appendConst('ℯ');  break;
    case '(':
      if (justEvaled) { expr = ''; justEvaled = false; }
      expr += '(';
      break;
    case ')':
      expr += ')';
      break;

    default: break;
  }

  // Live preview for all non-= actions
  if (action !== '=' && expr) {
    try {
      const preview = safeEval(autoCloseParens(expr));
      if (!justEvaled) result = fmt(preview);
    } catch {
      if (!justEvaled) result = result; // keep last good result
    }
  }

  // Update AC label: show 'C' if there's something to clear
  const acBtn = document.querySelector('[data-action="AC"]');
  if (acBtn) acBtn.textContent = expr ? 'C' : 'AC';

  updateDisplay();
}

// ── Helpers ───────────────────────────────────
function appendFn(fn) {
  if (justEvaled) { expr = fn + result; justEvaled = false; }
  else expr += fn;
}
function appendConst(c) {
  if (justEvaled) { expr = c; justEvaled = false; }
  else expr += c;
}
function getCurrentValue() {
  try {
    if (justEvaled) return parseFloat(result);
    return safeEval(autoCloseParens(expr));
  } catch { return null; }
}
function highlightOp(op) {
  document.querySelectorAll('.btn-op').forEach(b => {
    b.classList.toggle('active-op', b.dataset.action === op);
  });
}
function clearOpHighlight() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
}

// ── Button click handler ──────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (!action) return;

  // Ripple
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const rip  = document.createElement('span');
  rip.className = 'ripple-el';
  rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove());

  handleAction(action);
});

// ── Toolbar buttons ───────────────────────────
degBtn.addEventListener('click', () => {
  degMode = !degMode;
  degBtn.textContent = degMode ? 'DEG' : 'RAD';
  degBtn.classList.toggle('active', !degMode);
  toast(degMode ? 'Degrees mode' : 'Radians mode');
});

sciBtn.addEventListener('click', () => {
  sciOpen = !sciOpen;
  sciPanel.classList.toggle('hidden', !sciOpen);
  sciBtn.classList.toggle('active', sciOpen);
});

histBtn.addEventListener('click', () => {
  histOpen = !histOpen;
  histPanel.classList.toggle('hidden', !histOpen);
  histBtn.classList.toggle('active', histOpen);
  if (histOpen) renderHistory();
});

clearHistBtn.addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  toast('History cleared');
});

histList.addEventListener('click', (e) => {
  const item = e.target.closest('.hist-item');
  if (!item) return;
  const h = getHistory();
  const entry = h[+item.dataset.index];
  if (!entry) return;
  result = entry.res;
  expr   = entry.res;
  justEvaled = true;
  updateDisplay();
  toast('Loaded from history');
});

// ── Copy button ────────────────────────────────
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(result).then(() => toast('Copied!'));
});

// ── Keyboard support ──────────────────────────
const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.': '.', ',': '.',
  '+': '+', '-': '−', '*': '×', '/': '÷',
  'Enter': '=', '=': '=',
  'Backspace': 'backspace',
  'Delete': 'AC', 'Escape': 'AC',
  '%': '%',
  '(': '(', ')': ')',
};

document.addEventListener('keydown', (e) => {
  // Don't capture if typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 's' && e.ctrlKey) { e.preventDefault(); sciBtn.click(); return; }
  if (e.key === 'h' && e.ctrlKey) { e.preventDefault(); histBtn.click(); return; }

  const action = KEY_MAP[e.key];
  if (!action) return;
  e.preventDefault();
  handleAction(action);

  // Flash matching button
  const btn = document.querySelector(`[data-action="${action}"]`);
  if (btn) {
    btn.classList.add('active-key');
    setTimeout(() => btn.classList.remove('active-key'), 100);
  }
});

// ── Init ──────────────────────────────────────
updateDisplay();
