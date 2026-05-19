// ===== VIBE CARD SELECTION =====
const cards = document.querySelectorAll('.vibe-card');

cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // Get the vibe ID to pass to next page
    const vibe = card.getAttribute('data-vibe');
    
    // Short delay for the click animation
    setTimeout(() => {
      window.location.href = `selfie.html?vibe=${vibe}`;
    }, 450);
  });
});
