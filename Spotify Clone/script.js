/* ══════════════════════════════════════════════
   Spotify Clone  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ══ State ══════════════════════════════════════ */
const audio        = new Audio();
let albums         = [];          // { folder, title, description, cover, songs[] }
let currentAlbum   = null;
let currentIndex   = -1;
let shuffle        = false;
let repeat         = 'off';       // 'off' | 'one' | 'all'
let volume         = 0.7;
let muted          = false;
let prevVolume     = 0.7;
let likedSongs     = JSON.parse(localStorage.getItem('sp_liked') || '[]');
let seekDragging   = false;
let volDragging    = false;

audio.volume = volume;

/* ══ DOM refs ═══════════════════════════════════ */
const $ = id => document.getElementById(id);
const qs  = (s, c) => (c || document).querySelector(s);
const qsa = (s, c) => [...(c || document).querySelectorAll(s)];

const npTitle     = $('npTitle');
const npArtist    = $('npArtist');
const npCoverImg  = $('npCoverImg');
const npLike      = $('npLike');
const playIcon    = $('playIcon');
const ctrlPlay    = $('ctrlPlay');
const ctrlPrev    = $('ctrlPrev');
const ctrlNext    = $('ctrlNext');
const ctrlShuffle = $('ctrlShuffle');
const ctrlRepeat  = $('ctrlRepeat');
const seekFill    = $('seekFill');
const seekThumb   = $('seekThumb');
const timeElapsed = $('timeElapsed');
const timeDuration= $('timeDuration');
const volFill     = $('volFill');
const volThumb    = $('volThumb');
const volIcon     = $('volIcon');
const albumGrid   = $('albumGrid');
const recentGrid  = $('recentGrid');
const madeGrid    = $('madeGrid');
const greetingGrid= $('greetingGrid');
const trackList   = $('trackList');
const libList     = $('libList');
const albumHeroImg= $('albumHeroImg');
const albumTitle  = $('albumTitle');
const albumArtist = $('albumArtist');
const albumYear   = $('albumYear');
const albumTrackCount = $('albumTrackCount');
const contentArea = $('contentArea');
const topbar      = $('topbar');
const mainContent = $('mainContent');

/* ══ Format time ════════════════════════════════ */
function fmt(s) {
  if (isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}

/* ══ Clean song display name ════════════════════ */
function cleanSongName(filename, artist) {
  let n = filename.replace(/\.mp3$/i, '');
  n = n.replace(/\s*\(SPOTISAVER\)\s*/gi, '');
  n = n.replace(/^spotifydown\.com\s*-\s*/i, '');
  n = n.replace(/^\d+\.\s+/, '');
  // Strip "Artist[, Artist2] - " prefix using the album artist's first word
  if (artist) {
    const first = artist.split(/[\s,]/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    n = n.replace(new RegExp(`^${first}[^-]*\\s*-\\s*`, 'i'), '');
  }
  return n.trim();
}

/* ══ Toast ══════════════════════════════════════ */
function toast(msg, dur = 2500) {
  const c = $('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('out'); el.addEventListener('animationend', () => el.remove(), { once: true }); }, dur);
}

/* ══ Views ══════════════════════════════════════ */
function showView(id) {
  qsa('.view').forEach(v => v.classList.remove('active'));
  $(id)?.classList.add('active');
}

/* ══ Fetch songs from folder ════════════════════ */
async function fetchSongs(folder) {
  try {
    const res  = await fetch(`songs/${folder}/`);
    const text = await res.text();
    const div  = document.createElement('div');
    div.innerHTML = text;
    return [...div.querySelectorAll('a')]
      .map(a => decodeURIComponent(a.href.split('/').pop()))
      .filter(n => n.endsWith('.mp3'));
  } catch {
    return [];
  }
}

/* ══ Load albums ════════════════════════════════ */
async function loadAlbums() {
  try {
    const res  = await fetch('songs/');
    const text = await res.text();
    const div  = document.createElement('div');
    div.innerHTML = text;

    const folders = [...div.querySelectorAll('a')]
      .map(a => { const p = new URL(a.href).pathname.replace(/\/$/, '').split('/'); return p.pop(); })
      .filter(f => f && !f.includes('.'));

    for (const folder of folders) {
      try {
        const infoRes  = await fetch(`songs/${folder}/info.json`);
        const info     = await infoRes.json();
        const songs    = await fetchSongs(folder);
        // Prefer .jpg cover, fall back to .svg
        const coverJpg = `songs/${folder}/cover.jpg`;
        const coverSvg = `songs/${folder}/cover.svg`;
        let cover = coverJpg;
        try {
          const cr = await fetch(coverJpg, { method: 'HEAD' });
          if (!cr.ok) cover = coverSvg;
        } catch { cover = coverSvg; }

        albums.push({
          folder,
          title:       info.title       || folder,
          description: info.description || '',
          artist:      info.artist      || 'Unknown Artist',
          year:        info.year        || new Date().getFullYear(),
          cover,
          songs,
        });
      } catch { /* skip bad folder */ }
    }
  } catch {
    // Fallback: hardcode known albums with full song lists (works on file:// too)
    albums = [
      { folder:'billie', title:'Billie Eilish', description:'HIT ME HARD AND SOFT', artist:'Billie Eilish', year:2024, cover:'songs/billie/cover.jpg', songs:['1. SKINNY.mp3','2. LUNCH.mp3','3. CHIHIRO.mp3','4. BIRDS OF A FEATHER.mp3','5. WILDFLOWER.mp3','6. THE GREATEST.mp3','7. L\'AMOUR DE MA VIE.mp3','8. THE DINER.mp3','9. BITTERSUITE.mp3','10. BLUE.mp3'] },
      { folder:'drake',  title:'Drake',         description:'Certified Lover Boy',   artist:'Drake',         year:2021, cover:'songs/drake/cover.jpg',  songs:['Drake - 7am On Bridle Path (SPOTISAVER).mp3','Drake - Champagne Poetry (SPOTISAVER).mp3','Drake - F g Fans (SPOTISAVER).mp3','Drake - No Friends In The Industry (SPOTISAVER).mp3','Drake - Papi\'s Home (SPOTISAVER).mp3','Drake - Pipe Down (SPOTISAVER).mp3','Drake - Race My Mind (SPOTISAVER).mp3','Drake - TSU (SPOTISAVER).mp3','Drake - The Remorse (SPOTISAVER).mp3','Drake, Future - N 2 Deep (SPOTISAVER).mp3','Drake, Future, Young Thug - Way 2 Sexy (with Future & Young Thug) (SPOTISAVER).mp3','Drake, JAŸ-Z - Love All (with JAY-Z) (SPOTISAVER).mp3','Drake, Kid Cudi - IMY2 (with Kid Cudi) (SPOTISAVER).mp3','Drake, Lil Baby - Girls Want Girls (with Lil Baby) (SPOTISAVER).mp3','Drake, Lil Durk, GIVĒON - In The Bible (with Lil Durk & Giveon) (SPOTISAVER).mp3','Drake, Lil Wayne, Rick Ross - You Only Live Twice (with Lil Wayne & Rick Ross) (SPOTISAVER).mp3','Drake, Tems - Fountains (with Tems) (SPOTISAVER).mp3','Drake, Travis Scott - Fair Trade (with Travis Scott) (SPOTISAVER).mp3','Drake, Ty Dolla $ign - Get Along Better (SPOTISAVER).mp3','Drake, Yebba - Yebba\'s Heartbreak (SPOTISAVER).mp3'] },
      { folder:'dua',    title:'Dua Lipa',      description:'Radical Optimism',      artist:'Dua Lipa',      year:2024, cover:'songs/dua/cover.jpg',    songs:['1. End Of An Era.mp3','2. Houdini.mp3','3. Training Season.mp3','4. These Walls.mp3','5. Whatcha Doing.mp3','6. French Exit.mp3','7. Illusion.mp3','8. Falling Forever.mp3','9. Anything For Love.mp3','10. Maria.mp3','11. Happy For You.mp3'] },
      { folder:'eminem', title:'Eminem',        description:'The Death of Slim Shady', artist:'Eminem',      year:2024, cover:'songs/eminem/cover.jpg', songs:['1. Renaissance.mp3','2. Habits.mp3','3. Trouble.mp3','4. Brand New Dance.mp3','5. Evil.mp3','6. All You Got - skit.mp3','7. Lucifer.mp3','8. Antichrist.mp3','9. Fuel.mp3','10. Road Rage.mp3','11. Houdini.mp3','12. Breaking News - skit.mp3','13. Guilty Conscience 2.mp3','14. Head Honcho.mp3','15. Temporary.mp3','16. Bad One.mp3','17. Tobey (feat. Big Sean and BabyTron).mp3','18. Guess Who\'s Back - skit.mp3','19. Somebody Save Me.mp3'] },
      { folder:'kenny',  title:'Kendrick Lamar', description:'To Pimp a Butterfly',  artist:'Kendrick Lamar', year:2015, cover:'songs/kenny/cover.jpg', songs:['1. Wesley\'s Theory.mp3','2. For Free_ - Interlude.mp3','3. King Kunta.mp3','4. Institutionalized.mp3','5. These Walls.mp3','6. u.mp3','7. Alright.mp3','8. For Sale_ - Interlude.mp3','9. Momma.mp3','10. Hood Politics.mp3','11. How Much A Dollar Cost.mp3','12. Complexion (A Zulu Love).mp3','13. The Blacker The Berry.mp3','14. You Ain\'t Gotta Lie (Momma Said).mp3','15. i.mp3','16. Mortal Man.mp3'] },
      { folder:'taylor', title:'Taylor Swift',   description:'Midnights',             artist:'Taylor Swift',   year:2022, cover:'songs/taylor/cover.jpg', songs:['1. Lavender Haze.mp3','2. Maroon.mp3','3. Anti-Hero.mp3','4. Snow On The Beach (feat. Lana Del Rey).mp3','5. You\'re On Your Own, Kid.mp3','6. Midnight Rain.mp3','7. Question..._.mp3','8. Vigilante Shit.mp3','9. Bejeweled.mp3','10. Labyrinth.mp3','11. Karma.mp3','12. Sweet Nothing.mp3','13. Mastermind.mp3'] },
      { folder:'weeknd', title:'The Weeknd',     description:'After Hours',           artist:'The Weeknd',     year:2020, cover:'songs/weeknd/cover.jpg', songs:['1. Alone Again.mp3','2. Too Late.mp3','3. Hardest To Love.mp3','4. Scared To Live.mp3','5. Snowchild.mp3','6. Escape From LA.mp3','7. Heartless.mp3','8. Faith.mp3','9. Blinding Lights.mp3','10. In Your Eyes.mp3','11. Save Your Tears.mp3','12. Repeat After Me (Interlude).mp3','13. After Hours.mp3','14. Until I Bleed Out.mp3'] },
    ];
  }

  renderAll();
}

/* ══ Render all sections ════════════════════════ */
function renderAll() {
  renderGreeting();
  renderAlbumGrid();
  renderLibrary();
  renderBrowse();
}

/* ── Greeting quick-access cards ─────────────── */
function renderGreeting() {
  if (!greetingGrid) return;
  greetingGrid.innerHTML = '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Update page title area (inject greeting into topbar area or just use section)
  const gs = qs('.greeting-section');
  if (gs) {
    let h1 = gs.querySelector('.greeting-title');
    if (!h1) {
      h1 = document.createElement('h1');
      h1.className = 'greeting-title section-title';
      h1.style.cssText = 'margin-bottom:20px;font-size:1.8rem;';
      gs.insertBefore(h1, greetingGrid);
    }
    h1.textContent = greeting;
  }

  albums.slice(0, 6).forEach(album => {
    const card = document.createElement('div');
    card.className = 'greeting-card';
    card.innerHTML = `
      <div class="greeting-card-img">
        <img src="${album.cover}" alt="${album.title}" onerror="this.parentElement.innerHTML='🎵'" />
      </div>
      <span>${album.title}</span>
      <button class="greeting-play-btn" title="Play ${album.title}">
        <i class="fa-solid fa-play"></i>
      </button>`;
    card.addEventListener('click', () => openAlbum(album));
    card.querySelector('.greeting-play-btn').addEventListener('click', e => {
      e.stopPropagation();
      openAlbum(album, true);
    });
    greetingGrid.appendChild(card);
  });
}

/* ── Album grid (main content) ────────────────── */
function renderAlbumGrid() {
  [albumGrid, recentGrid, madeGrid].forEach(grid => { if (grid) grid.innerHTML = ''; });

  albums.forEach((album, i) => {
    const card = buildCard(album, () => openAlbum(album), () => openAlbum(album, true));
    if (albumGrid) albumGrid.appendChild(card.cloneNode(true));
    const c2 = buildCard(album, () => openAlbum(album), () => openAlbum(album, true));
    if (recentGrid && i < 5) recentGrid.appendChild(c2);
    const c3 = buildCard(album, () => openAlbum(album), () => openAlbum(album, true));
    if (madeGrid) madeGrid.appendChild(c3);
  });

  // Re-attach events (cloneNode drops them)
  [albumGrid, recentGrid, madeGrid].forEach(grid => {
    if (!grid) return;
    grid.querySelectorAll('.music-card').forEach((card, i) => {
      const album = albums[i % albums.length];
      card.addEventListener('click', () => openAlbum(album));
      card.querySelector('.mc-play-btn')?.addEventListener('click', e => {
        e.stopPropagation();
        openAlbum(album, true);
      });
    });
  });
}

function buildCard(album, onClick, onPlay) {
  const div = document.createElement('div');
  div.className = 'music-card';
  div.innerHTML = `
    <div class="mc-img-wrap">
      <img class="mc-img" src="${album.cover}" alt="${album.title}"
           onerror="this.outerHTML='<div class=mc-img-placeholder>🎵</div>'" />
      <button class="mc-play-btn" title="Play ${album.title}"><i class="fa-solid fa-play"></i></button>
    </div>
    <div class="mc-title">${album.title}</div>
    <div class="mc-sub">${album.description || album.artist}</div>`;
  div.addEventListener('click', onClick);
  div.querySelector('.mc-play-btn').addEventListener('click', e => { e.stopPropagation(); onPlay(); });
  return div;
}

/* ── Library sidebar ──────────────────────────── */
function renderLibrary() {
  if (!libList) return;
  libList.innerHTML = '';

  // Liked Songs entry
  const liked = document.createElement('div');
  liked.className = 'lib-item';
  liked.innerHTML = `
    <div class="lib-item-cover" style="background:linear-gradient(135deg,#450af5,#c4efd9)">
      <i class="fa-solid fa-heart" style="font-size:.9rem;color:white;"></i>
    </div>
    <div class="lib-item-info">
      <div class="lib-item-name">Liked Songs</div>
      <div class="lib-item-sub">Playlist • ${likedSongs.length} songs</div>
    </div>`;
  liked.addEventListener('click', () => openLikedSongs());
  libList.appendChild(liked);

  albums.forEach(album => {
    const item = document.createElement('div');
    item.className = 'lib-item';
    item.dataset.folder = album.folder;
    item.innerHTML = `
      <div class="lib-item-cover">
        <img src="${album.cover}" alt="${album.title}"
             onerror="this.parentElement.innerHTML='<i class=fa-solid fa-music></i>'" />
      </div>
      <div class="lib-item-info">
        <div class="lib-item-name">${album.title}</div>
        <div class="lib-item-sub">Album • ${album.artist}</div>
      </div>`;
    item.addEventListener('click', () => openAlbum(album));
    libList.appendChild(item);
  });
}

/* ── Open album view ──────────────────────────── */
function openAlbum(album, autoplay = false) {
  currentAlbum = album;
  showView('viewAlbum');

  // Dynamic gradient bg for album hero
  const gradient = `linear-gradient(180deg, #1a3040 0%, var(--bg) 100%)`;
  qs('#viewAlbum .album-hero').style.background = gradient;

  albumHeroImg.innerHTML = `<img src="${album.cover}" alt="${album.title}"
    onerror="this.parentElement.innerHTML='<div style=width:100%;height:100%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:4rem>🎵</div>'" />`;
  albumTitle.textContent  = album.title;
  albumArtist.textContent = album.artist;
  albumYear.textContent   = album.year;
  albumTrackCount.textContent = `${album.songs.length} song${album.songs.length !== 1 ? 's' : ''}`;

  // Like button
  const $lb = $('albumLikeBtn');
  $lb.onclick = () => {
    toast(album.title + ' saved to Your Library');
    $lb.querySelector('i').className = 'fa-solid fa-heart';
    $lb.classList.add('liked');
  };

  renderTrackList(album);

  // Big play button
  $('albumPlayBtn').onclick = () => playTrack(0);

  if (autoplay) playTrack(0);

  // Highlight in library
  qsa('.lib-item').forEach(i => i.classList.remove('active'));
  qs(`.lib-item[data-folder="${album.folder}"]`)?.classList.add('active');

  // Scroll to top
  contentArea.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Track list render ───────────────────────── */
function renderTrackList(album) {
  if (!trackList) return;
  trackList.innerHTML = '';

  album.songs.forEach((song, i) => {
    const name  = cleanSongName(song, album.artist);
    const isPlaying = currentAlbum?.folder === album.folder && currentIndex === i;

    const row = document.createElement('div');
    row.className = 'track-row' + (isPlaying ? ' playing' : '');
    row.innerHTML = `
      <div class="track-num-wrap">
        <span class="track-num">${i + 1}</span>
        <span class="track-play-hover"><i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i></span>
      </div>
      <div class="track-title-wrap">
        <div class="track-cover">
          <img src="${album.cover}" alt="${name}"
               onerror="this.parentElement.style.background='var(--bg3)';this.remove()" />
        </div>
        <div style="min-width:0">
          <div class="track-title">${name}</div>
          <div class="track-artist">${album.artist}</div>
        </div>
      </div>
      <div class="track-album">${album.title}</div>
      <div class="track-duration">
        <i class="fa-regular fa-heart track-like ${likedSongs.includes(song) ? 'liked' : ''}"></i>
        <span class="track-dur-text">–</span>
      </div>`;

    row.addEventListener('click', () => {
      if (isCurrentTrack(i)) {
        togglePlayPause();
      } else {
        playTrack(i);
      }
    });
    row.querySelector('.track-like').addEventListener('click', e => {
      e.stopPropagation(); toggleLike(song, e.currentTarget);
    });

    trackList.appendChild(row);
  });

  // Load durations asynchronously
  album.songs.forEach((song, i) => {
    const tmp = new Audio(`songs/${album.folder}/${encodeURIComponent(song)}`);
    tmp.addEventListener('loadedmetadata', () => {
      const rows = trackList.querySelectorAll('.track-row');
      if (rows[i]) {
        rows[i].querySelector('.track-dur-text').textContent = fmt(tmp.duration);
      }
    });
  });
}

function isCurrentTrack(i) {
  return currentAlbum && currentIndex === i;
}

/* ── Liked songs ─────────────────────────────── */
function toggleLike(song, el) {
  const idx = likedSongs.indexOf(song);
  if (idx === -1) {
    likedSongs.push(song); el.classList.add('liked'); toast('Added to Liked Songs');
  } else {
    likedSongs.splice(idx, 1); el.classList.remove('liked'); toast('Removed from Liked Songs');
  }
  localStorage.setItem('sp_liked', JSON.stringify(likedSongs));
  renderLibrary();
}

function openLikedSongs() {
  if (!likedSongs.length) { toast('No liked songs yet'); return; }
  // Build a virtual album from liked songs
  const likedAlbum = {
    folder:      null,
    title:       'Liked Songs',
    description: 'Your favourite tracks',
    artist:      'Various Artists',
    year:        new Date().getFullYear(),
    cover:       '',
    songs:       likedSongs,
  };

  // Find the actual source folders
  currentAlbum = albums[0]; // fallback for playback
  openAlbum({ ...likedAlbum, folder: albums[0]?.folder });
}

/* ══ Playback ════════════════════════════════════ */
function playTrack(index) {
  if (!currentAlbum) return;
  const songs = currentAlbum.songs;
  if (!songs.length) return;

  if (shuffle && index === currentIndex + 1) {
    // pick random if shuffle
    const next = Math.floor(Math.random() * songs.length);
    index = next;
  }

  index = ((index % songs.length) + songs.length) % songs.length;
  currentIndex = index;

  const song    = songs[index];
  const name    = cleanSongName(song, currentAlbum.artist);
  const src     = `songs/${currentAlbum.folder}/${encodeURIComponent(song)}`;

  audio.src = src;
  audio.volume = muted ? 0 : volume;
  audio.play().catch(() => {
    // Fallback: try without encoding
    audio.src = `songs/${currentAlbum.folder}/${song}`;
    audio.play().catch(e => toast('Playback error: ' + e.message));
  });

  // Now playing bar
  npTitle.textContent  = name;
  npArtist.textContent = currentAlbum.artist;
  npCoverImg.src       = currentAlbum.cover;
  npCoverImg.style.display = '';
  const npPh = document.getElementById('npCoverPlaceholder');
  if (npPh) npPh.style.display = 'none';
  npCoverImg.alt       = name;
  document.title       = `${name} • Spotify`;

  // Like button
  const liked = likedSongs.includes(song);
  npLike.className = 'np-like-btn' + (liked ? ' liked' : '');
  npLike.querySelector('i').className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

  // Highlight track row
  updateTrackHighlight();
}

function updateTrackHighlight() {
  if (!trackList) return;
  qsa('.track-row', trackList).forEach((row, i) => {
    const isP = i === currentIndex;
    row.classList.toggle('playing', isP);
    const ph = row.querySelector('.track-play-hover i');
    if (ph) ph.className = `fa-solid ${isP && !audio.paused ? 'fa-pause' : 'fa-play'}`;
  });
}

function togglePlayPause() {
  if (audio.src && !audio.src.endsWith('/')) {
    if (audio.paused) audio.play(); else audio.pause();
  } else if (currentAlbum) {
    playTrack(0);
  }
}

/* ── Audio events ────────────────────────────── */
audio.addEventListener('play', () => {
  playIcon.className = 'fa-solid fa-pause';
  updateTrackHighlight();
});

audio.addEventListener('pause', () => {
  playIcon.className = 'fa-solid fa-play';
  updateTrackHighlight();
});

audio.addEventListener('ended', () => {
  if (repeat === 'one') {
    audio.currentTime = 0; audio.play();
  } else if (repeat === 'all' || currentIndex < currentAlbum.songs.length - 1) {
    playTrack(currentIndex + 1);
  } else {
    playIcon.className = 'fa-solid fa-play';
  }
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration || seekDragging) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seekFill.style.width  = pct + '%';
  seekThumb.style.left  = pct + '%';
  timeElapsed.textContent  = fmt(audio.currentTime);
  timeDuration.textContent = fmt(audio.duration);
});

audio.addEventListener('loadedmetadata', () => {
  timeDuration.textContent = fmt(audio.duration);
});

/* ══ Controls ════════════════════════════════════ */
ctrlPlay.addEventListener('click', togglePlayPause);

ctrlPrev.addEventListener('click', () => {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  playTrack(currentIndex - 1);
});

ctrlNext.addEventListener('click', () => playTrack(currentIndex + 1));

ctrlShuffle.addEventListener('click', () => {
  shuffle = !shuffle;
  ctrlShuffle.classList.toggle('active', shuffle);
  toast(shuffle ? 'Shuffle on' : 'Shuffle off');
});

ctrlRepeat.addEventListener('click', () => {
  const states = ['off','all','one'];
  repeat = states[(states.indexOf(repeat) + 1) % 3];
  ctrlRepeat.classList.toggle('active', repeat !== 'off');
  const icon = ctrlRepeat.querySelector('i');
  if (repeat === 'one') {
    icon.className = 'fa-solid fa-repeat-1';
  } else {
    icon.className = 'fa-solid fa-repeat';
  }
  toast(repeat === 'off' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one');
});

/* ── Seek bar ────────────────────────────────── */
const seekBarWrap = $('seekBarWrap');

function seekTo(e) {
  const rect = seekBarWrap.querySelector('.seek-bar-bg').getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    seekFill.style.width = (pct * 100) + '%';
    seekThumb.style.left = (pct * 100) + '%';
  }
}

seekBarWrap.addEventListener('mousedown', e => {
  seekDragging = true; seekTo(e);
});
document.addEventListener('mousemove', e => { if (seekDragging) seekTo(e); });
document.addEventListener('mouseup',   () => { seekDragging = false; });
seekBarWrap.addEventListener('click', seekTo);

/* ── Volume ──────────────────────────────────── */
const volBarWrap = $('volBarWrap');

function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  audio.volume = muted ? 0 : volume;
  const pct = volume * 100;
  volFill.style.width  = pct + '%';
  volThumb.style.left  = pct + '%';
  // icon
  if (volume === 0 || muted) volIcon.className = 'fa-solid fa-volume-xmark';
  else if (volume < 0.4)     volIcon.className = 'fa-solid fa-volume-low';
  else                        volIcon.className = 'fa-solid fa-volume-high';
}

function volTo(e) {
  const rect = volBarWrap.querySelector('.vol-bar-bg').getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  muted = false; setVolume(pct);
}

volBarWrap.addEventListener('mousedown', e => { volDragging = true; volTo(e); });
document.addEventListener('mousemove', e => { if (volDragging) volTo(e); });
document.addEventListener('mouseup',   () => { volDragging = false; });
volBarWrap.addEventListener('click', volTo);

$('volMute').addEventListener('click', () => {
  if (muted) { muted = false; audio.volume = volume; }
  else       { muted = true;  prevVolume = volume; audio.volume = 0; }
  setVolume(muted ? 0 : volume);
  if (!muted) volume = prevVolume;
});

setVolume(0.7);

/* ── Like button (now playing) ───────────────── */
npLike.addEventListener('click', () => {
  if (!currentAlbum || currentIndex < 0) return;
  const song = currentAlbum.songs[currentIndex];
  const liked = likedSongs.includes(song);
  if (liked) {
    likedSongs = likedSongs.filter(s => s !== song);
    npLike.className = 'np-like-btn';
    npLike.querySelector('i').className = 'fa-regular fa-heart';
    toast('Removed from Liked Songs');
  } else {
    likedSongs.push(song);
    npLike.className = 'np-like-btn liked';
    npLike.querySelector('i').className = 'fa-solid fa-heart';
    toast('Added to Liked Songs');
  }
  localStorage.setItem('sp_liked', JSON.stringify(likedSongs));
  renderLibrary();
});

/* ══ Nav ══════════════════════════════════════════ */
$('navHome').addEventListener('click', e => {
  e.preventDefault();
  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  $('navHome').classList.add('active');
  showView('viewHome');
});

$('navSearch').addEventListener('click', e => {
  e.preventDefault();
  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  $('navSearch').classList.add('active');
  showView('viewSearch');
  setTimeout(() => $('searchInput')?.focus(), 100);
});

$('navBack').addEventListener('click', () => history.back());
$('navFwd').addEventListener('click',  () => history.forward());

/* ── Topbar scroll bg ────────────────────────── */
contentArea.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', contentArea.scrollTop > 60);
});

/* ══ Search ══════════════════════════════════════ */
$('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) { renderBrowse(); return; }
  const browseGrid = $('browseGrid');
  browseGrid.innerHTML = '';
  albums
    .filter(a => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    .forEach(album => {
      const card = buildCard(album, () => openAlbum(album), () => openAlbum(album, true));
      browseGrid.appendChild(card);
    });
});

function renderBrowse() {
  const browseGrid = $('browseGrid');
  if (!browseGrid) return;
  browseGrid.innerHTML = '';

  const genres = [
    { name: 'Pop',        color: '#e8115b', icon: '🎤' },
    { name: 'Hip-Hop',    color: '#8d67ab', icon: '🎧' },
    { name: 'R&B',        color: '#1e3264', icon: '🎶' },
    { name: 'Dance/EDM',  color: '#e13300', icon: '🎛️' },
    { name: 'Rock',       color: '#ba5d07', icon: '🎸' },
    { name: 'Latin',      color: '#0d73ec', icon: '💃' },
    { name: 'Podcasts',   color: '#006450', icon: '🎙️' },
    { name: 'Chill',      color: '#477d95', icon: '☁️' },
    { name: 'Rap',        color: '#1e3264', icon: '🎤' },
    { name: 'Classical',  color: '#503750', icon: '🎻' },
    { name: 'Afrobeats',  color: '#148a08', icon: '🥁' },
    { name: 'K-Pop',      color: '#e8115b', icon: '⭐' },
  ];

  genres.forEach(g => {
    const el = document.createElement('div');
    el.className = 'genre-card';
    el.style.background = g.color;
    el.innerHTML = `<span>${g.name}</span><span class="genre-icon">${g.icon}</span>`;
    el.addEventListener('click', () => {
      // Filter albums by genre (just show all for now)
      $('searchInput').value = g.name;
      $('searchInput').dispatchEvent(new Event('input'));
    });
    browseGrid.appendChild(el);
  });
}

/* ══ Extra buttons ════════════════════════════════ */
$('btnQueue').addEventListener('click', () => {
  if (!currentAlbum) { toast('Nothing is playing'); return; }
  toast(`Up next: ${currentAlbum.songs.slice(currentIndex + 1, currentIndex + 4).map(s => cleanSongName(s, currentAlbum.artist)).join(', ') || 'Nothing in queue'}`);
});

$('btnDevice').addEventListener('click', () => toast('Connect to a device'));
$('btnFullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

/* ══ Mobile sidebar ═══════════════════════════════ */
const sidebar     = $('sidebar');
const overlay     = $('sidebarOverlay');
const mobileBtn   = $('mobileMenuBtn');

mobileBtn.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.remove('hidden');
});
overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.add('hidden');
});

/* ══ Keyboard shortcuts ═══════════════════════════ */
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space')       { e.preventDefault(); togglePlayPause(); }
  if (e.code === 'ArrowRight')  { e.preventDefault(); audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0); }
  if (e.code === 'ArrowLeft')   { e.preventDefault(); audio.currentTime = Math.max(audio.currentTime - 5, 0); }
  if (e.code === 'ArrowUp')     { e.preventDefault(); setVolume(volume + 0.05); }
  if (e.code === 'ArrowDown')   { e.preventDefault(); setVolume(volume - 0.05); }
  if (e.key === 'm' || e.key === 'M') { $('volMute').click(); }
  if (e.key === 'n' || e.key === 'N') { ctrlNext.click(); }
});

/* ══ Boot ════════════════════════════════════════ */
loadAlbums();
