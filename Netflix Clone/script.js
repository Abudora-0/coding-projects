/* ═══════════════════════════════════════════════
   Netflix Clone — script.js
   ═══════════════════════════════════════════════ */

const TMDB = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACK = 'https://image.tmdb.org/t/p/w780';

const SHOWS = {
  trending: [
    { id:1,  title:'Stranger Things',       poster:'/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',  backdrop:'/rcA35mCmHNf47b6W0wT5sLRZq21.jpg', year:2022, match:97, rating:'U/A 16+', seasons:'4 Seasons', genres:'Sci-Fi, Horror, Drama',   desc:'When a boy vanishes in Hawkins, Indiana, supernatural forces, secret government experiments, and one terrifying monster collide in this gripping sci-fi horror.' },
    { id:2,  title:'Money Heist',           poster:'/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',  backdrop:'/7D430eqZj8y3oVkLFfsWXGRcpEG.jpg', year:2021, match:95, rating:'A',       seasons:'5 Seasons', genres:'Crime, Thriller, Drama',   desc:'A criminal mastermind who goes by "The Professor" recruits a team of criminals to carry out an ambitious heist against the Royal Mint of Spain.' },
    { id:3,  title:'Wednesday',             poster:'/jeGtaMwGxPmQN5xM4ClnwPQcNQG.jpg',  backdrop:'/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', year:2022, match:96, rating:'U/A 16+', seasons:'1 Season',  genres:'Horror, Comedy, Mystery',  desc:'Wednesday Addams navigates life as a student at Nevermore Academy, uncovering a monstrous killing spree while attempting to master her own psychic ability.' },
    { id:4,  title:'Squid Game',            poster:'/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',  backdrop:'/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg', year:2021, match:99, rating:'A',       seasons:'2 Seasons', genres:'Thriller, Survival, Drama', desc:'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a deadly game with a ₩45.6 billion prize awaits.' },
    { id:5,  title:'Dark',                  poster:'/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',  backdrop:'/hm58ncp41BqHSEzPu1tXi5bWMBZ.jpg', year:2020, match:94, rating:'A',       seasons:'3 Seasons', genres:'Sci-Fi, Thriller, Mystery', desc:'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the double lives and fractured past of four families.' },
    { id:6,  title:'Ozark',                 poster:'/pHkHCHEuYPCUVrEjnDpSmNSnKtP.jpg',  backdrop:'/1TqjBBZ9BFwcHRIJ8xQzuGWmfhI.jpg', year:2022, match:93, rating:'A',       seasons:'4 Seasons', genres:'Crime, Thriller, Drama',   desc:'A financial planner moves his family to the Missouri Ozarks to launder money for a drug boss, and must navigate an increasingly dangerous web of criminality.' },
    { id:7,  title:'The Crown',             poster:'/hYZ4a0JvPETdfgJJ5iswaac8mFk.jpg',  backdrop:'/1GKp0s2UkVwqTqkq1JxDIiIbNmo.jpg', year:2023, match:91, rating:'U/A 16+', seasons:'6 Seasons', genres:'Historical, Drama, Biography', desc:'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the 20th century.' },
    { id:8,  title:'Peaky Blinders',        poster:'/vUUqzWa2LnHIVqkaKVn3nyfVnBs.jpg',  backdrop:'/3JsD7ILMXoqSm0VX0RtMJfXxhLw.jpg', year:2022, match:96, rating:'A',       seasons:'6 Seasons', genres:'Crime, Drama, Historical',  desc:'A gangster family epic set in 1900s England, centering on the Peaky Blinders gang and their ambitious and fearless leader Tommy Shelby.' },
  ],
  popular: [
    { id:9,  title:'Narcos',                poster:'/rTmal9fDbwh5F0waol2hq35U4ah.jpg',  backdrop:'/xBO8R3CsZbMeRvDGGlnIFdBBKZN.jpg', year:2017, match:90, rating:'A',       seasons:'3 Seasons', genres:'Crime, Biography, Drama',   desc:'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country.' },
    { id:10, title:'Bridgerton',            poster:'/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg',  backdrop:'/or06FN3Dka5tukK1e9sl16pB3iy.jpg', year:2023, match:88, rating:'A',       seasons:'3 Seasons', genres:'Romance, Drama, Period',    desc:'The eight close-knit Bridgerton siblings are trying to find love and happiness in London\'s competitive high society. Witty, opulent Regency-era romance.' },
    { id:11, title:'You',                   poster:'/41yaWnIT8AjIHqrMGkWuHgOHsoY.jpg',  backdrop:'/vykGSCLRxeibBqijExHsNLF0qRb.jpg', year:2023, match:92, rating:'A',       seasons:'4 Seasons', genres:'Thriller, Drama, Crime',    desc:'A New York-based bookstore manager uses social media and technology to stalk, manipulate and insert himself into the life of each of his targets.' },
    { id:12, title:'Cobra Kai',             poster:'/6POBOFEd3KWfAkzHpRtdBWiL5TS.jpg',  backdrop:'/5n5SdAW5LUPkBnhsPHklgmqjVA9.jpg', year:2023, match:94, rating:'U/A 13+', seasons:'6 Seasons', genres:'Drama, Action, Sport',      desc:'34 years after the events of the All Valley Karate Tournament, a down-and-out Johnny Lawrence seeks redemption by reopening the infamous Cobra Kai dojo.' },
    { id:13, title:'Emily in Paris',        poster:'/qDumpdBKGJd1gSAFqnfHRw5K1OD.jpg',  backdrop:'/jTswp6KyDYKtvC52GbHagrZbGvD.jpg', year:2023, match:85, rating:'U/A 16+', seasons:'4 Seasons', genres:'Romance, Comedy, Drama',    desc:'Emily, an ambitious 20-something American from Chicago, unexpectedly lands her dream job in Paris when her company acquires a French luxury marketing company.' },
    { id:14, title:'Lupin',                 poster:'/sgxzT54GnvgeMnOZgpQQx9csAdd.jpg',  backdrop:'/3Rfvhy1Nl6sSGJwyjHl4j6pAQkm.jpg', year:2023, match:89, rating:'U/A 13+', seasons:'3 Seasons', genres:'Crime, Thriller, Mystery',  desc:'Inspired by the adventures of Arsène Lupin, gentleman thief Assane Diop sets out to avenge his father for an injustice inflicted by a wealthy family.' },
    { id:15, title:'The Witcher',           poster:'/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',  backdrop:'/pBpKrEHzFNiOFQv1zYfIGbRofGw.jpg', year:2023, match:88, rating:'A',       seasons:'3 Seasons', genres:'Fantasy, Adventure, Drama', desc:'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.' },
    { id:16, title:'Mindhunter',            poster:'/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg',  backdrop:'/mQHHQWUeRjWeSM6uWNrHiWl3NhC.jpg', year:2019, match:95, rating:'A',       seasons:'2 Seasons', genres:'Crime, Thriller, Drama',    desc:'In the late 1970s, two FBI agents broaden the scope of criminal science by delving into the psychology of murder and getting inside the minds of serial killers.' },
    { id:17, title:'Umbrella Academy',      poster:'/scZlQQqnsc1pZKTG4rFHlheIXJx.jpg',  backdrop:'/luKKRHvJLPRPQeXE2siRpPm3BLo.jpg', year:2023, match:90, rating:'U/A 16+', seasons:'3 Seasons', genres:'Superhero, Sci-Fi, Comedy', desc:'A dysfunctional family of adopted sibling superheroes reunites to solve the mystery of their father\'s death and the threat of an apocalypse.' },
  ],
  new: [
    { id:18, title:'Sex Education',         poster:'/7ERbQEt6V0qHiGrjQ6t0C5Lh4tV.jpg',  backdrop:'/mBxnXjTPT0wGtNpWJNm7DTWHX7R.jpg', year:2023, match:93, rating:'A',       seasons:'4 Seasons', genres:'Comedy, Drama, Coming-of-age', desc:'Awkward teenager Otis has all the answers when it comes to sex advice, thanks to his therapist mom. So naturally his classmates think he should set up an underground clinic.' },
    { id:19, title:'Haunting of Hill House',poster:'/dlcmumHHVeFNjOPIwINM6ouBrha.jpg',  backdrop:'/jbDmXI1cDV45VoHNLYdMKlV6ZK6.jpg', year:2018, match:96, rating:'A',       seasons:'1 Season',  genres:'Horror, Drama, Supernatural', desc:'Flashing between past and present, a fractured family confronts haunting memories of their old home and the terrifying events that drove them from it.' },
    { id:20, title:'Manifest',              poster:'/oGnxm4MF0xtJzGMrHHRVRcqHUna.jpg',  backdrop:'/6Q7A9VbAVd9O1wUB0uCVBqJKsQZ.jpg', year:2023, match:87, rating:'U/A 13+', seasons:'4 Seasons', genres:'Sci-Fi, Mystery, Drama',    desc:'When Montego Air Flight 828 landed safely, the 191 passengers discovered the world had moved on without them for five and a half years.' , poster:'/picsum.photos/seed/manifest/500/750' },
    { id:21, title:'The Good Place',        poster:'/1CPxuGfj5vSGRMRcjNFXUEW5p7S.jpg',  backdrop:'/9SsHDhBfkwPVxvYSzEAHCuCMXXk.jpg', year:2020, match:91, rating:'U/A 7+',  seasons:'4 Seasons', genres:'Comedy, Fantasy, Philosophy', desc:'Eleanor Shellstrop, an ordinary Arizona girl, accidentally ends up in an extraordinary afterlife where all decisions are made by a points system.' },
    { id:22, title:'Outer Banks',           poster:'/zfzNBrOFLrGFnmPHGRlzWexbS0u.jpg',  backdrop:'/k2tVCbSBzLzm8RaBL4jM6KLhB1q.jpg', year:2023, match:89, rating:'U/A 16+', seasons:'3 Seasons', genres:'Adventure, Teen, Mystery',  desc:'A group of teenagers on their quest to find a legendary treasure hidden somewhere on a small island. On that island, there are two sides: the rich and the poor.' },
    { id:23, title:'Black Mirror',          poster:'/7iPNRzgouguSSZCiUBkwdU3DCNQ.jpg',  backdrop:'/xOOSJfJVJdAJvuPqMBaXBQKrGFv.jpg', year:2023, match:92, rating:'A',       seasons:'6 Seasons', genres:'Sci-Fi, Thriller, Anthology', desc:'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations and darkest instincts collide in the near future.' },
    { id:24, title:'The OA',                poster:'/q4tZ2AhUv7fZFGgOIjijZPt1Wpl.jpg',  backdrop:'/3s76ChK1GEJQ93lXqLlFMJEDSI1.jpg', year:2019, match:88, rating:'U/A 16+', seasons:'2 Seasons', genres:'Mystery, Sci-Fi, Drama',    desc:'Prairie Johnson, a blind girl who emerges after missing for seven years with her sight restored, leads five strangers in practicing a series of movements.' },
    { id:25, title:'Ginny & Georgia',       poster:'/h5J4W4veyxMXDMjeMLxOs6DQPkS.jpg',  backdrop:'/mS5rkEGpBVDqePEcPlPEKqBnLNa.jpg', year:2023, match:86, rating:'U/A 16+', seasons:'3 Seasons', genres:'Drama, Comedy, Family',     desc:'15-year-old Ginny feels mature beyond her years and is often more mature than her charming, vivacious 30-year-old mom Georgia. Georgia is determined to give her family a fresh start.' },
  ],
};

// ── Render Rows ────────────────────────────────────────
function renderRow(rowId, items, showNumbers = false) {
  const track = document.getElementById('row-' + rowId);
  if (!track) return;

  track.innerHTML = items.map((item, i) => {
    const poster = item.poster.startsWith('/picsum')
      ? item.poster
      : `${TMDB}${item.poster}`;
    const fallback = `https://picsum.photos/seed/${item.id}show/300/450`;
    return `
    <div class="movie-card" data-id="${item.id}" title="${item.title}">
      <div class="card-img-wrap">
        <img src="${poster}" alt="${item.title}" loading="lazy"
             onerror="this.onerror=null;this.src='${fallback}'" />
      </div>
      <div class="card-hover">
        <div class="card-hover-title">${item.title}</div>
        <div class="card-hover-btns">
          <button class="chb play" title="Play"><i class="fas fa-play"></i></button>
          <button class="chb" title="Add to List"><i class="fas fa-plus"></i></button>
          <button class="chb" title="Like"><i class="fas fa-thumbs-up"></i></button>
          <button class="chb" title="More Info"><i class="fas fa-chevron-down"></i></button>
        </div>
      </div>
      ${showNumbers ? `<div class="card-num">${i + 1}</div>` : ''}
    </div>`;
  }).join('');

  // Card clicks → modal
  track.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = +card.dataset.id;
      const all = [...Object.values(SHOWS)].flat();
      const item = all.find(x => x.id === id);
      if (item) openModal(item);
    });
  });
}

renderRow('trending', SHOWS.trending, true);
renderRow('popular',  SHOWS.popular);
renderRow('new',      SHOWS.new);

// ── Row scroll arrows ──────────────────────────────────
document.querySelectorAll('.row-arrow').forEach(btn => {
  btn.addEventListener('click', () => {
    const rowId = btn.dataset.row;
    const track = document.getElementById('row-' + rowId);
    const dir   = btn.classList.contains('row-next') ? 1 : -1;
    const amount = track.clientWidth * 0.75;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  });
});

// ── Modal ──────────────────────────────────────────────
function openModal(item) {
  const backdropUrl = `${TMDB_BACK}${item.backdrop}`;
  const fallbackUrl = `https://picsum.photos/seed/${item.id}back/780/439`;

  document.getElementById('modalBanner').src = backdropUrl;
  document.getElementById('modalBanner').onerror = function () { this.src = fallbackUrl; };
  document.getElementById('modalTitle').textContent   = item.title;
  document.getElementById('modalMatch').textContent   = item.match + '% Match';
  document.getElementById('modalYear').textContent    = item.year;
  document.getElementById('modalRating').textContent  = item.rating;
  document.getElementById('modalSeasons').textContent = item.seasons;
  document.getElementById('modalDesc').textContent    = item.desc;
  document.getElementById('modalGenres').textContent  = item.genres;

  document.getElementById('movieModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('movieModal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('movieModal').addEventListener('click', e => {
  if (e.target === document.getElementById('movieModal')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── FAQ Accordion ──────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Navbar solid on scroll ─────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('solid', scrollY > 60);
}, { passive: true });

// ── Email validation & Get Started ────────────────────
function handleGetStarted(source = 'hero') {
  const inputId = source === 'footer' ? 'footerEmail' : 'heroEmail';
  const noteId  = source === 'footer' ? 'footerNote'  : 'heroNote';
  const input   = document.getElementById(inputId);
  const note    = document.getElementById(noteId);
  const email   = input.value.trim();
  const re      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    note.style.color = '#e87c1e';
    note.textContent = 'Email is required.';
    input.style.borderColor = '#e87c1e';
    return;
  }
  if (!re.test(email)) {
    note.style.color = '#e87c1e';
    note.textContent = 'Please enter a valid email address.';
    input.style.borderColor = '#e87c1e';
    return;
  }

  note.style.color = '#46d369';
  note.textContent = '✓ Great! Let\'s set up your Netflix membership.';
  input.style.borderColor = '#46d369';
}

// Allow Enter key on email inputs
['heroEmail','footerEmail'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleGetStarted(id === 'footerEmail' ? 'footer' : 'hero'); });
});
