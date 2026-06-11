/* ══════════════════════════════════════════════
   FilmFinder  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ── API config ──────────────────────────────── */
const API_KEY  = 'e69bf4cdf5d3dbc4af33ec8c85494fc0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL  = 'https://image.tmdb.org/t/p/w500';
const IMG_BIG  = 'https://image.tmdb.org/t/p/w780';
const IMG_BACK = 'https://image.tmdb.org/t/p/original';

/* ── State ───────────────────────────────────── */
let state = {
  category:   'trending',
  genreId:    null,
  sort:       'popularity.desc',
  query:      '',
  page:       1,
  totalPages: 1,
  loading:    false,
  genres:     [],
  heroMovie:  null,
};

/* ── Persistence ──────────────────────────────── */
function getLS(k, fb = null) {
  try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; }
}
function setLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

/* ── Shortcuts ───────────────────────────────── */
const $  = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

/* ══════════════════════════════════════════════
   FETCH HELPERS
══════════════════════════════════════════════ */
async function api(path, params = {}) {
  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initNavTabs();
  initSearch();
  initSurprise();
  initWatchlistBtn();
  initFavoritesBtn();
  initHamburger();
  initScrollTop();
  initSort();
  updateBadges();
  await fetchGenres();
  await loadMovies(true);
});

/* ══════════════════════════════════════════════
   NAV TABS
══════════════════════════════════════════════ */
function initNavTabs() {
  const tabs = document.querySelectorAll('#navTabs .nav-tab[data-category]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.category;
      if (cat === state.category && !state.genreId && !state.query) return;
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('#mobileTabs .nav-tab[data-category]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll(`#mobileTabs .nav-tab[data-category="${cat}"]`).forEach(t => t.classList.add('active'));

      state.category = cat;
      state.query    = '';
      state.genreId  = null;
      state.sort     = 'popularity.desc';

      $('searchInput').value = '';
      $('searchClear').classList.add('hidden');
      $('sortSelect').value  = 'popularity.desc';
      resetGenreChips();
      loadMovies(true);
    });
  });
}

/* ══════════════════════════════════════════════
   HAMBURGER / MOBILE TABS
══════════════════════════════════════════════ */
function initHamburger() {
  const btn  = $('hamburger');
  const tabs = $('mobileTabs');
  if (!btn || !tabs) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    tabs.classList.toggle('hidden');
  });

  document.querySelectorAll('#mobileTabs .nav-tab[data-category]').forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.category;
      document.querySelectorAll('#mobileTabs .nav-tab[data-category]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('#navTabs .nav-tab[data-category]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll(`#navTabs .nav-tab[data-category="${cat}"]`).forEach(t => t.classList.add('active'));

      state.category = cat;
      state.query    = '';
      state.genreId  = null;
      resetGenreChips();
      loadMovies(true);

      btn.classList.remove('open');
      tabs.classList.add('hidden');
    });
  });
}

/* ══════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════ */
function initSearch() {
  const input = $('searchInput');
  const clear = $('searchClear');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    clear.classList.toggle('hidden', !q);
    debounceTimer = setTimeout(() => {
      state.query   = q;
      state.genreId = null;
      resetGenreChips();
      loadMovies(true);
    }, 500);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.classList.add('hidden');
    state.query = '';
    loadMovies(true);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      state.query = input.value.trim();
      loadMovies(true);
    }
  });
}

/* ══════════════════════════════════════════════
   SORT
══════════════════════════════════════════════ */
function initSort() {
  const sel = $('sortSelect');
  if (!sel) return;
  sel.addEventListener('change', () => {
    state.sort = sel.value;
    loadMovies(true);
  });
}

/* ══════════════════════════════════════════════
   GENRES
══════════════════════════════════════════════ */
async function fetchGenres() {
  try {
    const data = await api('/genre/movie/list');
    state.genres = data.genres || [];
    buildGenreChips();
  } catch {}
}

function buildGenreChips() {
  const wrap = $('genreChips');
  if (!wrap) return;
  wrap.innerHTML = '';

  const all = el('button', 'genre-chip active');
  all.textContent = 'All';
  all.dataset.genre = '';
  all.addEventListener('click', () => selectGenre(null, all));
  wrap.appendChild(all);

  state.genres.forEach(g => {
    const chip = el('button', 'genre-chip');
    chip.textContent = g.name;
    chip.dataset.genre = g.id;
    chip.addEventListener('click', () => selectGenre(g.id, chip));
    wrap.appendChild(chip);
  });
}

function selectGenre(genreId, chip) {
  document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.genreId = genreId;
  state.query   = '';
  $('searchInput').value = '';
  $('searchClear').classList.add('hidden');
  loadMovies(true);
}

function resetGenreChips() {
  document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
  const allChip = document.querySelector('.genre-chip[data-genre=""]');
  if (allChip) allChip.classList.add('active');
  state.genreId = null;
}

/* ══════════════════════════════════════════════
   LOAD MOVIES
══════════════════════════════════════════════ */
async function loadMovies(reset = false) {
  if (state.loading) return;
  state.loading = true;

  if (reset) {
    state.page = 1;
    $('movieGrid').innerHTML = '';
    $('noResults').classList.add('hidden');
    $('loadMoreWrap').classList.add('hidden');
  }

  showLoader(true);

  try {
    let data;

    if (state.query) {
      data = await api('/search/movie', { query: state.query, page: state.page, include_adult: false });
      $('sectionTitle').textContent = `Results for "${state.query}"`;
    } else if (state.genreId) {
      data = await api('/discover/movie', {
        with_genres: state.genreId,
        sort_by: state.sort,
        page: state.page,
      });
      const genre = state.genres.find(g => g.id == state.genreId);
      $('sectionTitle').textContent = genre ? genre.name : 'Genre';
    } else {
      const endpoints = {
        trending: '/trending/movie/week',
        popular:  '/movie/popular',
        top_rated:'/movie/top_rated',
        upcoming: '/movie/upcoming',
      };
      const path = endpoints[state.category] || '/movie/popular';
      const params = state.category === 'trending' ? { page: state.page } : { page: state.page, sort_by: state.sort };
      data = await api(path, params);

      const labels = { trending: 'Trending This Week', popular: 'Popular Movies', top_rated: 'Top Rated', upcoming: 'Upcoming' };
      $('sectionTitle').textContent = labels[state.category] || 'Movies';
    }

    state.totalPages = data.total_pages || 1;
    const movies = data.results || [];

    $('resultCount').textContent = data.total_results ? `${data.total_results.toLocaleString()} results` : '';

    if (movies.length === 0 && reset) {
      $('noResults').classList.remove('hidden');
    } else {
      renderMovies(movies);
      if (state.page < state.totalPages && state.page < 20) {
        $('loadMoreWrap').classList.remove('hidden');
      }
    }

    if (reset && movies.length > 0) {
      updateHero(movies[Math.floor(Math.random() * Math.min(5, movies.length))]);
    }

  } catch (err) {
    console.error(err);
    if (reset) $('noResults').classList.remove('hidden');
  }

  showLoader(false);
  state.loading = false;

  // load more button
  const lmBtn = $('loadMoreBtn');
  if (lmBtn) {
    lmBtn.onclick = () => {
      state.page++;
      loadMovies(false);
    };
  }
}

/* ══════════════════════════════════════════════
   RENDER MOVIE CARDS
══════════════════════════════════════════════ */
function renderMovies(movies) {
  const grid = $('movieGrid');
  const favs = getLS('filmFavs', []);
  const wl   = getLS('filmWL', []);

  movies.forEach((m, i) => {
    const card = el('div', 'movie-card');
    card.style.animationDelay = (i % 20 * 40) + 'ms';

    const rating = m.vote_average ? m.vote_average.toFixed(1) : '—';
    const ratingClass = m.vote_average >= 7.5 ? 'high' : m.vote_average < 5 ? 'low' : '';
    const year   = m.release_date ? m.release_date.slice(0, 4) : '—';
    const isFav  = favs.some(f => f.id === m.id);
    const isWL   = wl.some(w => w.id === m.id);

    card.innerHTML = `
      <div class="mc-poster">
        ${m.poster_path
          ? `<img src="${IMG_URL}${m.poster_path}" alt="${esc(m.title)}" loading="lazy">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text3);">${svgFilm()}</div>`}
        <div class="mc-rating ${ratingClass}">
          ${svgStar()}${rating}
        </div>
        <div class="mc-actions">
          <button class="mc-action-btn mc-fav-btn ${isFav ? 'is-fav' : ''}" data-id="${m.id}" title="Favorite">
            ${svgHeart(isFav)}
          </button>
          <button class="mc-action-btn mc-wl-btn ${isWL ? 'is-wl' : ''}" data-id="${m.id}" title="Watchlist">
            ${svgBookmark(isWL)}
          </button>
        </div>
        <div class="mc-overlay">
          <div class="mc-overlay-year">${year}</div>
          <div class="mc-overlay-title">${esc(m.title)}</div>
        </div>
      </div>
      <div class="mc-info">
        <div class="mc-title">${esc(m.title)}</div>
        <div class="mc-meta">
          <span>${year}</span>
          <span>${rating !== '—' ? rating + ' ★' : '—'}</span>
        </div>
      </div>`;

    card.querySelector('.mc-fav-btn').addEventListener('click', e => { e.stopPropagation(); toggleFav(m, card.querySelector('.mc-fav-btn')); });
    card.querySelector('.mc-wl-btn').addEventListener('click', e => { e.stopPropagation(); toggleWL(m, card.querySelector('.mc-wl-btn')); });
    card.addEventListener('click', () => openDetail(m.id));

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
function updateHero(movie) {
  if (!movie) return;
  state.heroMovie = movie;

  const bg   = $('heroBg');
  const body = $('heroBody');
  if (!bg || !body) return;

  if (movie.backdrop_path) {
    bg.style.backgroundImage = `url(${IMG_BACK}${movie.backdrop_path})`;
  }

  const favs = getLS('filmFavs', []);
  const wl   = getLS('filmWL', []);
  const isFav = favs.some(f => f.id === movie.id);
  const isWL  = wl.some(w => w.id === movie.id);
  const year  = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';

  body.innerHTML = `
    <div class="hero-badges">
      <span class="hero-badge featured">Featured</span>
      ${year ? `<span class="hero-badge">${year}</span>` : ''}
    </div>
    <h1 class="hero-title">${esc(movie.title)}</h1>
    <div class="hero-meta">
      ${rating ? `<div class="hero-rating">${svgStar()}${rating}</div>` : ''}
      ${year    ? `<span class="hero-year">${year}</span>` : ''}
      ${movie.original_language ? `<span class="hero-lang">${movie.original_language.toUpperCase()}</span>` : ''}
    </div>
    ${movie.overview ? `<p class="hero-overview">${esc(movie.overview)}</p>` : ''}
    <div class="hero-actions">
      <button class="hero-btn hero-btn-primary" id="heroDetailBtn">
        ${svgPlay()} View Details
      </button>
      <button class="hero-btn hero-btn-secondary ${isFav ? 'active-fav' : ''}" id="heroFavBtn">
        ${svgHeart(isFav)} ${isFav ? 'Favorited' : 'Favorite'}
      </button>
      <button class="hero-btn hero-btn-secondary ${isWL ? 'active-wl' : ''}" id="heroWLBtn">
        ${svgBookmark(isWL)} ${isWL ? 'In Watchlist' : 'Watchlist'}
      </button>
    </div>`;

  $('heroDetailBtn').addEventListener('click', () => openDetail(movie.id));
  $('heroFavBtn').addEventListener('click', () => {
    toggleFav(movie, $('heroFavBtn'));
    const now = getLS('filmFavs', []).some(f => f.id === movie.id);
    $('heroFavBtn').className = `hero-btn hero-btn-secondary ${now ? 'active-fav' : ''}`;
    $('heroFavBtn').innerHTML = svgHeart(now) + ' ' + (now ? 'Favorited' : 'Favorite');
  });
  $('heroWLBtn').addEventListener('click', () => {
    toggleWL(movie, $('heroWLBtn'));
    const now = getLS('filmWL', []).some(w => w.id === movie.id);
    $('heroWLBtn').className = `hero-btn hero-btn-secondary ${now ? 'active-wl' : ''}`;
    $('heroWLBtn').innerHTML = svgBookmark(now) + ' ' + (now ? 'In Watchlist' : 'Watchlist');
  });
}

/* ══════════════════════════════════════════════
   SURPRISE ME
══════════════════════════════════════════════ */
function initSurprise() {
  const btn = $('surpriseBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    try {
      const data = await api('/discover/movie', {
        sort_by: 'popularity.desc',
        page: randomPage,
        vote_count_gte: 100,
      });
      const movies = (data.results || []).filter(m => m.poster_path);
      if (!movies.length) { toast('Nothing found, try again!'); return; }
      const movie = movies[Math.floor(Math.random() * movies.length)];
      openDetail(movie.id);
    } catch { toast('Could not fetch a surprise, try again!'); }
  });
}

/* ══════════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════════ */
async function openDetail(movieId) {
  const modal = $('detailModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  $('detailBody').innerHTML = `<div style="min-height:400px;display:flex;align-items:center;justify-content:center;">
    <div class="loader-ring"></div></div>`;

  $('detailModalBg').onclick = closeDetail;
  $('detailClose').onclick   = closeDetail;

  try {
    const [movie, credits] = await Promise.all([
      api(`/movie/${movieId}`, { append_to_response: 'credits' }),
      api(`/movie/${movieId}/credits`),
    ]);
    renderDetail(movie, credits);
  } catch {
    $('detailBody').innerHTML = `<p style="padding:40px;color:var(--text3);text-align:center;">Failed to load movie details.</p>`;
  }
}

function closeDetail() {
  $('detailModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderDetail(movie, credits) {
  const favs = getLS('filmFavs', []);
  const wl   = getLS('filmWL', []);
  const isFav = favs.some(f => f.id === movie.id);
  const isWL  = wl.some(w => w.id === movie.id);

  const favBtn = $('detailFavBtn');
  const wlBtn  = $('detailWLBtn');

  favBtn.className = 'modal-icon-btn' + (isFav ? ' is-fav' : '');
  favBtn.innerHTML = svgHeart(isFav);
  favBtn.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';
  favBtn.onclick = () => {
    toggleFav(movie, favBtn);
    const now = getLS('filmFavs', []).some(f => f.id === movie.id);
    favBtn.className = 'modal-icon-btn' + (now ? ' is-fav' : '');
    favBtn.innerHTML = svgHeart(now);
  };

  wlBtn.className = 'modal-icon-btn' + (isWL ? ' is-wl' : '');
  wlBtn.innerHTML = svgBookmark(isWL);
  wlBtn.title = isWL ? 'Remove from Watchlist' : 'Add to Watchlist';
  wlBtn.onclick = () => {
    toggleWL(movie, wlBtn);
    const now = getLS('filmWL', []).some(w => w.id === movie.id);
    wlBtn.className = 'modal-icon-btn' + (now ? ' is-wl' : '');
    wlBtn.innerHTML = svgBookmark(now);
  };

  const cast   = (credits.cast || movie.credits?.cast || []).slice(0, 12);
  const director = (credits.crew || movie.credits?.crew || []).find(c => c.job === 'Director');
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—';
  const budget  = movie.budget  ? '$' + (movie.budget / 1e6).toFixed(0) + 'M' : '—';
  const revenue = movie.revenue ? '$' + (movie.revenue / 1e6).toFixed(0) + 'M' : '—';
  const year    = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const votes   = movie.vote_count  ? movie.vote_count.toLocaleString() + ' votes' : '';

  $('detailBody').innerHTML = `
    ${movie.backdrop_path
      ? `<div class="detail-backdrop" style="background-image:url(${IMG_BACK}${movie.backdrop_path})">
           <div class="detail-backdrop-grad"></div>
         </div>`
      : ''}
    <div class="detail-body">
      <div class="detail-poster-row">
        ${movie.poster_path
          ? `<div class="detail-poster"><img src="${IMG_URL}${movie.poster_path}" alt="${esc(movie.title)}"></div>`
          : ''}
        <div class="detail-title-block">
          <h2 class="detail-title">${esc(movie.title)}</h2>
          ${movie.tagline ? `<p style="color:var(--text3);font-style:italic;font-size:.85rem;margin-bottom:8px;">"${esc(movie.tagline)}"</p>` : ''}
          <div class="detail-meta">
            ${movie.vote_average
              ? `<div class="dm-rating">${svgStar()}${movie.vote_average.toFixed(1)}</div>
                 <span class="dm-votes">${votes}</span>`
              : ''}
            <span class="dm-pill">${year}</span>
            <span class="dm-pill">${runtime}</span>
            ${movie.status ? `<span class="dm-pill">${movie.status}</span>` : ''}
          </div>
        </div>
      </div>

      ${movie.overview ? `<p class="detail-overview">${esc(movie.overview)}</p>` : ''}

      <div class="detail-genres">
        ${(movie.genres || []).map(g => `<span class="detail-genre">${g.name}</span>`).join('')}
      </div>

      <div class="detail-info-grid">
        ${director ? `<div class="di-item"><div class="di-label">Director</div><div class="di-val">${esc(director.name)}</div></div>` : ''}
        <div class="di-item"><div class="di-label">Release</div><div class="di-val">${movie.release_date || '—'}</div></div>
        <div class="di-item"><div class="di-label">Runtime</div><div class="di-val">${runtime}</div></div>
        <div class="di-item"><div class="di-label">Language</div><div class="di-val">${(movie.original_language || '').toUpperCase()}</div></div>
        ${movie.budget  > 0 ? `<div class="di-item"><div class="di-label">Budget</div><div class="di-val">${budget}</div></div>` : ''}
        ${movie.revenue > 0 ? `<div class="di-item"><div class="di-label">Revenue</div><div class="di-val">${revenue}</div></div>` : ''}
      </div>

      ${cast.length ? `
        <div class="cast-section">
          <div class="cast-label">Cast</div>
          <div class="cast-row">
            ${cast.map(c => `
              <div class="cast-chip">
                <div class="cast-avatar">
                  ${c.profile_path
                    ? `<img src="${IMG_URL}${c.profile_path}" alt="${esc(c.name)}" loading="lazy">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text3);">${svgUser()}</div>`}
                </div>
                <div class="cast-name">${esc(c.name)}</div>
                <div class="cast-role">${esc(c.character || '')}</div>
              </div>`).join('')}
          </div>
        </div>` : ''}
    </div>`;
}

/* ══════════════════════════════════════════════
   WATCHLIST MODAL
══════════════════════════════════════════════ */
function initWatchlistBtn() {
  const btn = $('watchlistBtn');
  if (!btn) return;
  btn.addEventListener('click', openWatchlist);
  $('wlModalBg').addEventListener('click', closeWatchlist);
  $('wlClose').addEventListener('click', closeWatchlist);
}

function openWatchlist() {
  const modal = $('watchlistModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderWatchlist();
}

function closeWatchlist() {
  $('watchlistModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderWatchlist() {
  const wl     = getLS('filmWL', []);
  const grid   = $('watchlistGrid');
  const empty  = $('wlEmpty');
  const count  = $('watchlistCount');

  if (count) { count.textContent = wl.length; count.dataset.count = wl.length; }
  if (!wl.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = '';
  wl.forEach(m => {
    const card = el('div', 'movie-card');
    card.innerHTML = buildMiniCard(m, getLS('filmFavs', []).some(f => f.id === m.id), true);
    card.addEventListener('click', () => { closeWatchlist(); openDetail(m.id); });
    card.querySelector('.mc-fav-btn').addEventListener('click', e => { e.stopPropagation(); toggleFav(m, card.querySelector('.mc-fav-btn')); });
    card.querySelector('.mc-wl-btn').addEventListener('click', e => { e.stopPropagation(); toggleWL(m, card.querySelector('.mc-wl-btn')); renderWatchlist(); });
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════
   FAVORITES MODAL
══════════════════════════════════════════════ */
function initFavoritesBtn() {
  const btn = $('favoritesBtn');
  if (!btn) return;
  btn.addEventListener('click', openFavorites);
  $('favModalBg').addEventListener('click', closeFavorites);
  $('favClose').addEventListener('click', closeFavorites);
}

function openFavorites() {
  const modal = $('favoritesModal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderFavorites();
}

function closeFavorites() {
  $('favoritesModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderFavorites() {
  const favs  = getLS('filmFavs', []);
  const grid  = $('favoritesGrid');
  const empty = $('favEmpty');
  const count = $('favCount');

  if (count) { count.textContent = favs.length; count.dataset.count = favs.length; }
  if (!favs.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = '';
  favs.forEach(m => {
    const card = el('div', 'movie-card');
    card.innerHTML = buildMiniCard(m, true, getLS('filmWL', []).some(w => w.id === m.id));
    card.addEventListener('click', () => { closeFavorites(); openDetail(m.id); });
    card.querySelector('.mc-fav-btn').addEventListener('click', e => { e.stopPropagation(); toggleFav(m, card.querySelector('.mc-fav-btn')); renderFavorites(); });
    card.querySelector('.mc-wl-btn').addEventListener('click', e => { e.stopPropagation(); toggleWL(m, card.querySelector('.mc-wl-btn')); });
    grid.appendChild(card);
  });
}

/* ── mini card template for list modals ── */
function buildMiniCard(m, isFav, isWL) {
  const rating = m.vote_average ? m.vote_average.toFixed(1) : '—';
  const ratingClass = m.vote_average >= 7.5 ? 'high' : m.vote_average < 5 ? 'low' : '';
  const year   = m.release_date ? m.release_date.slice(0, 4) : '—';
  return `
    <div class="mc-poster">
      ${m.poster_path
        ? `<img src="${IMG_URL}${m.poster_path}" alt="${esc(m.title)}" loading="lazy">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text3);">${svgFilm()}</div>`}
      <div class="mc-rating ${ratingClass}">${svgStar()}${rating}</div>
      <div class="mc-actions">
        <button class="mc-action-btn mc-fav-btn ${isFav ? 'is-fav' : ''}" data-id="${m.id}">${svgHeart(isFav)}</button>
        <button class="mc-action-btn mc-wl-btn  ${isWL  ? 'is-wl'  : ''}" data-id="${m.id}">${svgBookmark(isWL)}</button>
      </div>
    </div>
    <div class="mc-info">
      <div class="mc-title">${esc(m.title)}</div>
      <div class="mc-meta"><span>${year}</span><span>${rating !== '—' ? rating + ' ★' : '—'}</span></div>
    </div>`;
}

/* ══════════════════════════════════════════════
   FAV / WATCHLIST TOGGLES
══════════════════════════════════════════════ */
function movieSnapshot(m) {
  return {
    id: m.id, title: m.title, poster_path: m.poster_path,
    vote_average: m.vote_average, release_date: m.release_date,
  };
}

function toggleFav(movie, btn) {
  let favs = getLS('filmFavs', []);
  const idx = favs.findIndex(f => f.id === movie.id);
  const snap = movieSnapshot(movie);
  if (idx === -1) {
    favs.push(snap);
    toast('Added to Favorites');
    if (btn) { btn.classList.add('is-fav'); btn.innerHTML = svgHeart(true); }
  } else {
    favs.splice(idx, 1);
    toast('Removed from Favorites');
    if (btn) { btn.classList.remove('is-fav'); btn.innerHTML = svgHeart(false); }
  }
  setLS('filmFavs', favs);
  updateBadges();
  syncCardButtons(movie.id, 'fav', idx === -1);
}

function toggleWL(movie, btn) {
  let wl  = getLS('filmWL', []);
  const idx = wl.findIndex(w => w.id === movie.id);
  const snap = movieSnapshot(movie);
  if (idx === -1) {
    wl.push(snap);
    toast('Added to Watchlist');
    if (btn) { btn.classList.add('is-wl'); btn.innerHTML = svgBookmark(true); }
  } else {
    wl.splice(idx, 1);
    toast('Removed from Watchlist');
    if (btn) { btn.classList.remove('is-wl'); btn.innerHTML = svgBookmark(false); }
  }
  setLS('filmWL', wl);
  updateBadges();
  syncCardButtons(movie.id, 'wl', idx === -1);
}

function syncCardButtons(movieId, type, active) {
  const cls = type === 'fav' ? 'mc-fav-btn' : 'mc-wl-btn';
  const activeCls = type === 'fav' ? 'is-fav' : 'is-wl';
  document.querySelectorAll(`.${cls}[data-id="${movieId}"]`).forEach(b => {
    b.classList.toggle(activeCls, active);
    b.innerHTML = type === 'fav' ? svgHeart(active) : svgBookmark(active);
  });
}

function updateBadges() {
  const favCount = (getLS('filmFavs', [])).length;
  const wlCount  = (getLS('filmWL', [])).length;
  const fc = $('favCount');
  const wc = $('watchlistCount');
  if (fc) { fc.textContent = favCount; fc.dataset.count = favCount; }
  if (wc) { wc.textContent = wlCount;  wc.dataset.count = wlCount;  }
}

/* ══════════════════════════════════════════════
   SCROLL TOP
══════════════════════════════════════════════ */
function initScrollTop() {
  const btn = $('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════ */
function showLoader(visible) {
  const loader = $('loader');
  if (!loader) return;
  loader.classList.toggle('hidden', !visible);
  if (visible) {
    $('movieGrid').style.opacity = '0.4';
  } else {
    $('movieGrid').style.opacity = '';
  }
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function toast(msg, dur = 2500) {
  const wrap = $('toastWrap');
  if (!wrap) return;
  const t = el('div', 'toast');
  t.innerHTML = `${svgCheck()} ${esc(msg)}`;
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, dur);
}

/* ══════════════════════════════════════════════
   ESCAPE HELPER
══════════════════════════════════════════════ */
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════
   INLINE SVG ICONS
══════════════════════════════════════════════ */
function svgStar() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`;
}

function svgHeart(filled) {
  return filled
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
       </svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
       </svg>`;
}

function svgBookmark(filled) {
  return filled
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
       </svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
         <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
       </svg>`;
}

function svgPlay() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`;
}

function svgFilm() {
  return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>`;
}

function svgUser() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`;
}

function svgCheck() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;
}
