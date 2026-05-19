// ===== PAGE-LEVEL AI EFFECTS (cursor glow + parallax) =====
(function initPageEffects() {
  const glow  = document.getElementById('page-cursor-glow');
  const layer = document.getElementById('page-parallax');

  document.addEventListener('mousemove', (e) => {
    if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
    if (layer) {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      layer.style.transform = `translate(${dx * 16}px, ${dy * 12}px)`;
    }
  });
})();

// ===== VIDEO INTRO + INACTIVITY LOGIC =====
const videoOverlay  = document.getElementById('video-overlay');
const introVideo    = document.getElementById('intro-video');
const experienceBtn = document.getElementById('experience-btn');
const mainContent   = document.getElementById('main-content');

// --- Show main content, hide video ---
function showMainContent() {
  videoOverlay.classList.add('hidden');
  mainContent.classList.add('visible');
  setTimeout(() => videoOverlay.style.display = 'none', 700);
}

// --- Replay video ---
function replayVideo() {
  sessionStorage.setItem('goaVideoTime', 0);
  introVideo.currentTime = 0;
  mainContent.classList.remove('visible');
  videoOverlay.style.display = 'flex';
  requestAnimationFrame(() => videoOverlay.classList.remove('hidden'));
  introVideo.play();
}

function clearIdleUI() {}

// --- Experience button click ---
experienceBtn.addEventListener('click', showMainContent);
experienceBtn.addEventListener('touchend', (e) => { e.preventDefault(); showMainContent(); });

// --- Replay button ---
const replayBtn = document.getElementById('replay-video-btn');
if (replayBtn) {
  replayBtn.addEventListener('click', replayVideo);
  replayBtn.addEventListener('touchend', (e) => { e.preventDefault(); replayVideo(); });
}

// --- Autoplay with sound fallback ---
introVideo.play().catch(() => {
  // Autoplay blocked — unmute on first interaction
  introVideo.muted = true;
  introVideo.play();
  const unmute = () => { introVideo.muted = false; document.removeEventListener('click', unmute); };
  document.addEventListener('click', unmute);
});

// ===== VIBE CARD SELECTION =====
const cards = document.querySelectorAll('.vibe-card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    clearIdleUI();
    // Save video position so selfie page can resume from here
    if (introVideo) {
      sessionStorage.setItem('goaVideoTime', introVideo.currentTime);
      introVideo.pause();
    }
    const vibe = card.getAttribute('data-vibe');
    setTimeout(() => {
      window.location.href = `selfie.html?vibe=${vibe}`;
    }, 450);
  });
});
