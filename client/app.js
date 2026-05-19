// ===== VIDEO INTRO + INACTIVITY LOGIC =====
const videoOverlay  = document.getElementById('video-overlay');
const introVideo    = document.getElementById('intro-video');
const experienceBtn = document.getElementById('experience-btn');
const mainContent   = document.getElementById('main-content');

let idleTimer       = null;
const IDLE_TIMEOUT  = 10000; // 10 seconds

// --- Idle countdown ring ---
const ring = document.createElement('div');
ring.className = 'idle-ring';
ring.innerHTML = `<svg viewBox="0 0 52 52" width="52" height="52">
  <circle class="track" cx="26" cy="26" r="22"/>
  <circle class="fill"  cx="26" cy="26" r="22" id="ring-fill"/>
</svg>`;
document.body.appendChild(ring);
const ringFill = document.getElementById('ring-fill');
const CIRCUMFERENCE = 2 * Math.PI * 22; // ≈ 138.2

function setRingProgress(fraction) {
  ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
}

// --- Show main content, hide video ---
function showMainContent() {
  videoOverlay.classList.add('hidden');
  mainContent.classList.add('visible');
  setTimeout(() => videoOverlay.style.display = 'none', 700);
  resetIdleTimer();
}

// --- Return to video from saved position ---
function returnToVideo() {
  clearIdleUI();
  mainContent.classList.remove('visible');
  videoOverlay.style.display = 'flex';
  requestAnimationFrame(() => videoOverlay.classList.remove('hidden'));
  introVideo.play();
}

// --- Idle timer ---
function resetIdleTimer() {
  clearTimeout(idleTimer);
  clearIdleUI();

  let elapsed = 0;
  ring.classList.add('visible');
  setRingProgress(0);

  const tick = setInterval(() => {
    elapsed += 1000;
    setRingProgress(elapsed / IDLE_TIMEOUT);
    if (elapsed >= IDLE_TIMEOUT) {
      clearInterval(tick);
      returnToVideo();
    }
  }, 1000);

  idleTimer = tick;
}

function clearIdleUI() {
  clearTimeout(idleTimer);
  clearInterval(idleTimer);
  ring.classList.remove('visible');
  setRingProgress(0);
}

// Reset timer on any interaction on the main page
['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (mainContent.classList.contains('visible')) resetIdleTimer();
  }, { passive: true });
});

// --- Experience button click ---
experienceBtn.addEventListener('click', showMainContent);
experienceBtn.addEventListener('touchend', (e) => { e.preventDefault(); showMainContent(); });

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
