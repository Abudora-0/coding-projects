/* ═══════════════════════════════════════════════
   Myntra Clone — script.js
   ═══════════════════════════════════════════════ */

// ── Product Data ─────────────────────────────────────
const PRODUCTS = [
  // Women
  { id:1,  brand:'Anouk',         name:'Ethnic A-line Kurti',       cat:'women', img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/5d1b7ad3-c3ed-4ef9-a654-18231743d3cd1651484798059-Anouk-Inddus.jpg',         price:799,  mrp:1999, rating:4.3, rcount:2841 },
  { id:2,  brand:'Varanga',       name:'Floral Printed Dress',       cat:'women', img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/f7575784-edbf-411f-acc0-51891ea7f4331651484798329-Inddus-_Varanga.jpg',         price:949,  mrp:2499, rating:4.1, rcount:1204 },
  { id:3,  brand:'Libas',         name:'Cotton Anarkali Kurta',      cat:'women', img:'https://picsum.photos/seed/w3/300/400',  price:679,  mrp:1699, rating:4.2, rcount:3107 },
  { id:4,  brand:'W',             name:'Wrap Midi Dress',            cat:'women', img:'https://picsum.photos/seed/w4/300/400',  price:1199, mrp:2999, rating:4.5, rcount:892  },
  // Men
  { id:5,  brand:'HRX',           name:'Dry Fit Training T-shirt',   cat:'men',   img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/ce40419d-6408-404e-9320-96e41aee1b791651484798300-Hrx-_Puma_-_More.jpg',         price:499,  mrp:1199, rating:4.4, rcount:6523 },
  { id:6,  brand:'U.S. Polo',     name:'Slim Fit Polo T-Shirt',      cat:'men',   img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/a802fc48-8f5b-4d69-97ab-e6a3cf3fb70c1651484798800-USPA-_Flying_Machine.jpg',         price:749,  mrp:1799, rating:4.3, rcount:4119 },
  { id:7,  brand:'Levi\'s',       name:'511 Slim Fit Jeans',         cat:'men',   img:'https://picsum.photos/seed/m7/300/400',  price:1999, mrp:3999, rating:4.6, rcount:9842 },
  { id:8,  brand:'Arrow',         name:'Formal Slim Fit Shirt',      cat:'men',   img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/764761e7-c505-459e-92a2-6c4387f9e2511651484798319-Hush_Puppies-_Arrow.jpg',         price:899,  mrp:2499, rating:4.2, rcount:2267 },
  // Kids
  { id:9,  brand:'H&M Kids',      name:'Printed Graphic Tee',        cat:'kids',  img:'https://picsum.photos/seed/k9/300/400',  price:299,  mrp:799,  rating:4.4, rcount:543  },
  { id:10, brand:'United Colors', name:'Colourblock Shorts',         cat:'kids',  img:'https://picsum.photos/seed/k10/300/400', price:349,  mrp:899,  rating:4.1, rcount:312  },
  // Sports
  { id:11, brand:'Puma',          name:'Running Shoes',              cat:'sports',img:'https://picsum.photos/seed/s11/300/400', price:2499, mrp:4999, rating:4.5, rcount:7123 },
  { id:12, brand:'Adidas',        name:'Training Shorts',            cat:'sports',img:'https://picsum.photos/seed/s12/300/400', price:899,  mrp:1799, rating:4.3, rcount:3456 },
  // Beauty
  { id:13, brand:'Lakme',         name:'9to5 Flawless Matte',        cat:'beauty',img:'https://picsum.photos/seed/b13/300/400', price:399,  mrp:699,  rating:4.1, rcount:5231 },
  { id:14, brand:'Maybelline',    name:'SuperStay Foundation',       cat:'beauty',img:'https://picsum.photos/seed/b14/300/400', price:549,  mrp:999,  rating:4.3, rcount:4102 },
  // Extra
  { id:15, brand:'Roadster',      name:'Oversized Graphic Hoodie',   cat:'men',   img:'https://picsum.photos/seed/m15/300/400', price:1099, mrp:2499, rating:4.4, rcount:8124 },
  { id:16, brand:'Mango',         name:'Ribbed Knit Sweater',        cat:'women', img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/44192c45-7393-4ede-a926-11f30b0b92a51651484798036-All.jpg',         price:1599, mrp:3499, rating:4.5, rcount:1432 },
  { id:17, brand:'Red Tape',      name:'Leather Oxford Shoes',       cat:'men',   img:'https://assets.myntassets.com/f_webp,w_300,c_limit,fl_progressive,dpr_2.0/assets/images/2022/5/2/2f424664-e746-4af1-b0e1-366ccb0f2c681651484798552-Red_Tape.jpg',         price:1299, mrp:3299, rating:4.2, rcount:2781 },
  { id:18, brand:'Nike',          name:'Air Max Running Shoes',      cat:'sports',img:'https://picsum.photos/seed/s18/300/400', price:4499, mrp:7999, rating:4.7, rcount:12034 },
];

// ── State ─────────────────────────────────────────────
const wishlist = new Set();
const bag      = [];
let   currentFilter = 'all';

// ── Render Products ───────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const data = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = data.map(p => {
    const off = Math.round((1 - p.price / p.mrp) * 100);
    const wl  = wishlist.has(p.id);
    return `
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        <img src="${p.img}" alt="${p.brand} — ${p.name}" loading="lazy"
             onerror="this.src='https://picsum.photos/seed/${p.id}/300/400'" />
        <span class="prod-discount-badge">${off}% OFF</span>
        <button class="wishlist-btn ${wl ? 'wishlisted' : ''}" data-id="${p.id}" title="Wishlist">
          <i class="${wl ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="prod-hover-actions">
          <button class="add-bag-btn" data-id="${p.id}">
            <i class="fas fa-shopping-bag"></i> Add to Bag
          </button>
        </div>
      </div>
      <div class="prod-info">
        <div class="prod-brand">${p.brand}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price-row">
          <span class="prod-price">₹${p.price.toLocaleString()}</span>
          <span class="prod-mrp">₹${p.mrp.toLocaleString()}</span>
          <span class="prod-off">(${off}% off)</span>
        </div>
        <div class="prod-rating">
          <span class="rating-pill"><i class="fas fa-star" style="font-size:.6rem"></i> ${p.rating}</span>
          <span class="rating-count">${p.rcount.toLocaleString()}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  // Wishlist buttons
  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      if (wishlist.has(id)) { wishlist.delete(id); btn.classList.remove('wishlisted'); btn.querySelector('i').className = 'far fa-heart'; showToast('Removed from Wishlist'); }
      else                  { wishlist.add(id);    btn.classList.add('wishlisted');    btn.querySelector('i').className = 'fas fa-heart'; showToast('❤ Added to Wishlist'); }
      updateBadges();
    });
  });

  // Add to Bag buttons
  grid.querySelectorAll('.add-bag-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      if (!bag.includes(id)) bag.push(id);
      updateBadges();
      showToast('🛍 Added to Bag');
    });
  });
}

// ── Filters ───────────────────────────────────────────
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active-chip'));
    chip.classList.add('active-chip');
    currentFilter = chip.dataset.filter;
    renderProducts(currentFilter);
  });
});

// ── Update Badges ─────────────────────────────────────
function updateBadges() {
  const wBadge = document.getElementById('wishlistCount');
  const bBadge = document.getElementById('bagCount');
  wBadge.textContent = wishlist.size;
  bBadge.textContent = bag.length;
  wBadge.classList.toggle('show', wishlist.size > 0);
  bBadge.classList.toggle('show', bag.length > 0);
  document.getElementById('wishlistIcon').className = wishlist.size > 0 ? 'fas fa-heart' : 'far fa-heart';
}

// ── Carousel ──────────────────────────────────────────
(function () {
  const slides    = document.getElementById('slides');
  const dotsWrap  = document.getElementById('carouselDots');
  const count     = slides.children.length;
  let   idx       = 0;

  // Build dots
  for (let i = 0; i < count; i++) {
    const d = document.createElement('button');
    d.className = 'c-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  }

  function goTo(n) {
    idx = (n + count) % count;
    slides.style.transform = `translateX(-${idx * 100}%)`;
    dotsWrap.querySelectorAll('.c-dot').forEach((d, i) =>
      d.classList.toggle('active', i === idx));
  }

  document.getElementById('prevBtn').addEventListener('click', () => goTo(idx - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goTo(idx + 1));

  let auto = setInterval(() => goTo(idx + 1), 4500);
  slides.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  slides.parentElement.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(idx + 1), 4500); });
})();

// ── Sale Timer ────────────────────────────────────────
(function () {
  // 6-hour flash sale from page load
  const end = Date.now() + 6 * 3600 * 1000;
  function tick() {
    const diff = Math.max(0, end - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('sHours').textContent = String(h).padStart(2,'0');
    document.getElementById('sMins').textContent  = String(m).padStart(2,'0');
    document.getElementById('sSecs').textContent  = String(s).padStart(2,'0');
    if (diff > 0) setTimeout(tick, 1000);
  }
  tick();
})();

// ── Toast ─────────────────────────────────────────────
let _tt = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── Navbar shrink on scroll ────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow = scrollY > 4
    ? '0 2px 12px rgba(40,44,63,.14)' : '0 1px 4px rgba(40,44,63,.12)';
}, { passive: true });

// ── Init ──────────────────────────────────────────────
renderProducts('all');
