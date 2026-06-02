// ─── Song Data ────────────────────────────────────────────────────────────────
const gnxSongs = [
    { title: "wacced out murals", artist: "Kendrick Lamar", file: "songs/1.mp3",  cover: "covers/1.jpg",  duration: "5:17" },
    { title: "squabble up",       artist: "Kendrick Lamar", file: "songs/2.mp3",  cover: "covers/2.jpg",  duration: "2:37" },
    { title: "luther",            artist: "Kendrick Lamar", file: "songs/3.mp3",  cover: "covers/3.jpg",  duration: "2:57" },
    { title: "man at the garden", artist: "Kendrick Lamar", file: "songs/4.mp3",  cover: "covers/4.jpg",  duration: "3:53" },
    { title: "hey now",           artist: "Kendrick Lamar", file: "songs/5.mp3",  cover: "covers/5.jpg",  duration: "3:37" },
    { title: "reincarnated",      artist: "Kendrick Lamar", file: "songs/6.mp3",  cover: "covers/6.jpg",  duration: "4:35" },
    { title: "tv off",            artist: "Kendrick Lamar", file: "songs/7.mp3",  cover: "covers/7.jpg",  duration: "3:40" },
    { title: "dodger blue",       artist: "Kendrick Lamar", file: "songs/8.mp3",  cover: "covers/8.jpg",  duration: "2:11" },
    { title: "peekaboo",          artist: "Kendrick Lamar", file: "songs/9.mp3",  cover: "covers/9.jpg",  duration: "2:35" },
    { title: "heart pt.6",        artist: "Kendrick Lamar", file: "songs/10.mp3", cover: "covers/10.jpg", duration: "4:52" },
    { title: "gnx",               artist: "Kendrick Lamar", file: "songs/11.mp3", cover: "covers/11.jpg", duration: "3:13" },
    { title: "gloria",            artist: "Kendrick Lamar", file: "songs/12.mp3", cover: "covers/12.jpg", duration: "4:47" },
];

let uploadedSongs = [];

// ─── State ───────────────────────────────────────────────────────────────────
let currentPlaylist = 'gnx';
let currentQueue    = [];
let currentIndex    = 0;
let isPlaying       = false;
let isShuffle       = false;
let isRepeat        = false;
let shuffleOrder    = [];

const audio  = new Audio();
audio.volume = 0.8;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const masterPlay       = document.getElementById('masterPlay');
const prevBtn          = document.getElementById('prevBtn');
const nextBtn          = document.getElementById('nextBtn');
const progressBar      = document.getElementById('progressBar');
const volumeBar        = document.getElementById('volumeBar');
const currentTimeEl    = document.getElementById('currentTime');
const totalTimeEl      = document.getElementById('totalTime');
const nowPlayingTitle  = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const nowPlayingCover  = document.getElementById('nowPlayingCover');
const heartBtn         = document.getElementById('heartBtn');
const shuffleBtn       = document.getElementById('shuffleBtn');
const repeatBtn        = document.getElementById('repeatBtn');
const gnxSongList      = document.getElementById('gnxSongList');
const uploadedSongList = document.getElementById('uploadedSongList');
const fileInput        = document.getElementById('fileInput');
const dropZone         = document.getElementById('dropZone');
const uploadEmpty      = document.getElementById('uploadEmpty');
const uploadsTableWrap = document.getElementById('uploadsTableWrap');
const uploadCountEl    = document.getElementById('uploadCount');
const uploadCountMain  = document.getElementById('uploadCountMain');

// ─── Render GNX ───────────────────────────────────────────────────────────────
function renderGnxSongs() {
    gnxSongList.innerHTML = gnxSongs.map((s, i) => `
        <tr class="song-row" data-index="${i}" data-playlist="gnx" onclick="playSong('gnx',${i})">
            <td class="song-num"><span class="num-text">${i + 1}</span></td>
            <td>
                <div class="song-title-cell">
                    <img class="song-thumb" src="${s.cover}" alt="${s.title}">
                    <div>
                        <div class="song-title">${s.title}</div>
                        <div class="song-artist">${s.artist}</div>
                    </div>
                </div>
            </td>
            <td class="song-duration">${s.duration}</td>
        </tr>
    `).join('');
}

// ─── Render Uploads ───────────────────────────────────────────────────────────
function renderUploadedSongs() {
    const count = uploadedSongs.length;
    uploadCountEl.textContent   = count;
    uploadCountMain.textContent = count;

    if (count === 0) {
        uploadEmpty.style.display      = 'flex';
        uploadsTableWrap.style.display = 'none';
        return;
    }
    uploadEmpty.style.display      = 'none';
    uploadsTableWrap.style.display = 'table';

    uploadedSongList.innerHTML = uploadedSongs.map((s, i) => `
        <tr class="song-row" data-index="${i}" data-playlist="uploads" onclick="playSong('uploads',${i})">
            <td class="song-num"><span class="num-text">${i + 1}</span></td>
            <td>
                <div class="song-title-cell">
                    <div class="song-thumb-placeholder"><i class="fas fa-music"></i></div>
                    <div>
                        <div class="song-title">${s.title}</div>
                        <div class="song-artist">Uploaded</div>
                    </div>
                </div>
            </td>
            <td class="song-duration">${s.duration || '--:--'}</td>
            <td><button class="delete-btn" onclick="deleteSong(event,${i})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');

    document.getElementById('uploadedPlaylistItem').style.display = 'flex';
}

function deleteSong(e, i) {
    e.stopPropagation();
    if (currentPlaylist === 'uploads' && currentIndex === i) pauseAudio();
    URL.revokeObjectURL(uploadedSongs[i].file);
    uploadedSongs.splice(i, 1);
    renderUploadedSongs();
}

// ─── Switch View ──────────────────────────────────────────────────────────────
function switchPlaylist(pl) {
    document.getElementById('gnxView').style.display     = pl === 'gnx'     ? 'block' : 'none';
    document.getElementById('uploadsView').style.display = pl === 'uploads' ? 'block' : 'none';
    document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
    if (pl === 'gnx')     document.querySelector('.playlist-item').classList.add('active');
    if (pl === 'uploads') document.getElementById('uploadedPlaylistItem').classList.add('active');
}

// ─── Core Playback ────────────────────────────────────────────────────────────
function playSong(playlist, index) {
    const list = playlist === 'gnx' ? gnxSongs : uploadedSongs;
    const song = list[index];
    if (!song) return;

    currentQueue    = list;
    currentIndex    = index;
    currentPlaylist = playlist;

    audio.src = song.file;
    audio.currentTime = 0;
    audio.play().then(() => {
        isPlaying = true;
        updatePlayButton(true);
        updateNowPlaying(song);
        highlightRow(playlist, index);
    }).catch(err => console.warn('Playback error:', err));
}

function playPlaylist(pl) {
    const list = pl === 'gnx' ? gnxSongs : uploadedSongs;
    if (!list.length) return;
    if (isShuffle) buildShuffleOrder(list.length);
    playSong(pl, isShuffle ? shuffleOrder[0] : 0);
}

function updateNowPlaying(song) {
    nowPlayingTitle.textContent  = song.title;
    nowPlayingArtist.textContent = song.artist || 'Uploaded';
    nowPlayingCover.innerHTML    = song.cover
        ? `<img src="${song.cover}" alt="${song.title}">`
        : `<i class="fas fa-music"></i>`;
    document.title = `${song.title} — Spotify`;
}

function highlightRow(playlist, index) {
    document.querySelectorAll('.song-row').forEach(row => {
        row.classList.remove('active');
        const numEl = row.querySelector('.num-text');
        if (numEl) numEl.style.display = 'inline';
        const icon = row.querySelector('.playing-icon');
        if (icon) icon.remove();
    });
    const active = document.querySelector(`.song-row[data-playlist="${playlist}"][data-index="${index}"]`);
    if (active) {
        active.classList.add('active');
        const numEl = active.querySelector('.num-text');
        if (numEl) {
            numEl.style.display = 'none';
            numEl.insertAdjacentHTML('afterend', '<i class="fas fa-volume-up playing-icon"></i>');
        }
    }
}

function togglePlay() {
    if (!audio.src) { playPlaylist('gnx'); return; }
    if (isPlaying) pauseAudio(); else resumeAudio();
}

function pauseAudio()  { audio.pause(); isPlaying = false; updatePlayButton(false); }
function resumeAudio() { audio.play();  isPlaying = true;  updatePlayButton(true);  }

function updatePlayButton(playing) {
    masterPlay.innerHTML = playing
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play" style="padding-left:2px"></i>';
}

function playNext() {
    if (!currentQueue.length) return;
    let next = isShuffle
        ? shuffleOrder[(shuffleOrder.indexOf(currentIndex) + 1) % shuffleOrder.length]
        : (currentIndex + 1) % currentQueue.length;
    playSong(currentPlaylist, next);
}

function playPrev() {
    if (!currentQueue.length) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    let prev = isShuffle
        ? shuffleOrder[(shuffleOrder.indexOf(currentIndex) - 1 + shuffleOrder.length) % shuffleOrder.length]
        : (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    playSong(currentPlaylist, prev);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    document.querySelectorAll('.shuffle-big-btn').forEach(b => b.classList.toggle('active', isShuffle));
    if (isShuffle) buildShuffleOrder(currentQueue.length);
}

function buildShuffleOrder(len) {
    shuffleOrder = Array.from({ length: len }, (_, i) => i).sort(() => Math.random() - 0.5);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
    audio.loop = isRepeat;
}

// ─── Progress & Volume ────────────────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
    progressBar.value = 0;
});
audio.addEventListener('ended', () => { if (!isRepeat) playNext(); });

progressBar.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progressBar.value / 100) * audio.duration;
});
volumeBar.addEventListener('input', () => { audio.volume = volumeBar.value / 100; });

// ─── Keyboard ─────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight' && e.altKey) playNext();
    if (e.code === 'ArrowLeft'  && e.altKey) playPrev();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// ─── Upload ──────────────────────────────────────────────────────────────────
function triggerUpload() { fileInput.value = ''; fileInput.click(); }

fileInput.addEventListener('change', (e) => handleFiles(Array.from(e.target.files)));
document.getElementById('uploadBtn').addEventListener('click', triggerUpload);
document.getElementById('uploadBigBtn').addEventListener('click', triggerUpload);
document.getElementById('uploadCtaBtn').addEventListener('click', triggerUpload);

dropZone.addEventListener('click', triggerUpload);
dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/')));
});

function handleFiles(files) {
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    if (!audioFiles.length) return;

    audioFiles.forEach(file => {
        const url  = URL.createObjectURL(file);
        const name = file.name.replace(/\.[^/.]+$/, '');
        const tmp  = new Audio(url);

        const addSong = (dur) => {
            uploadedSongs.push({ title: name, artist: 'Uploaded', file: url, cover: null, duration: formatTime(dur) });
            renderUploadedSongs();
            if (uploadedSongs.length === 1) switchPlaylist('uploads');
        };
        tmp.addEventListener('loadedmetadata', () => addSong(tmp.duration));
        tmp.addEventListener('error',          () => addSong(NaN));
    });
}

// ─── Player button listeners ──────────────────────────────────────────────────
masterPlay.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);
heartBtn.addEventListener('click', () => heartBtn.classList.toggle('liked'));

// ─── Init ────────────────────────────────────────────────────────────────────
renderGnxSongs();
renderUploadedSongs();
switchPlaylist('gnx');
