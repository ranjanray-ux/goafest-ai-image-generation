/* ── Video idle screensaver (30s inactivity) ── */
(function initVideoIdle() {
  const IDLE_MS = 60000;
  const overlay = document.getElementById('selfie-video-overlay');
  const vid = document.getElementById('selfie-intro-video');
  const btn = document.getElementById('selfie-experience-btn');
  if (!overlay || !vid || !btn) return;

  // Idle countdown ring
  const ring = document.createElement('div');
  ring.className = 'idle-ring';
  ring.innerHTML = '<svg viewBox="0 0 52 52" width="52" height="52"><circle class="track" cx="26" cy="26" r="22"/><circle class="fill" cx="26" cy="26" r="22"/></svg>';
  document.body.appendChild(ring);
  const ringFill = ring.querySelector('.fill');
  const CIRC = 2 * Math.PI * 22;

  function setRing(f) { ringFill.style.strokeDashoffset = CIRC * (1 - f); }

  let idleTick = null;

  function showVideo() {
    const t = parseFloat(sessionStorage.getItem('goaVideoTime') || '0');
    vid.currentTime = t;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.remove('hidden'));
    vid.play();
    ring.classList.remove('visible');
    clearInterval(idleTick);
  }

  function hideVideo() {
    sessionStorage.setItem('goaVideoTime', vid.currentTime);
    vid.pause();
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 700);
    resetIdle();
  }

  function resetIdle() {
    clearInterval(idleTick);
    ring.classList.remove('visible');
    setRing(0);
    let elapsed = 0;
    ring.classList.add('visible');
    idleTick = setInterval(() => {
      elapsed += 1000;
      setRing(elapsed / IDLE_MS);
      if (elapsed >= IDLE_MS) { clearInterval(idleTick); showVideo(); }
    }, 1000);
  }

  resetIdle();

  ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'].forEach(e => {
    document.addEventListener(e, () => {
      if (!overlay.classList.contains('hidden') || overlay.style.display === 'none') return;
      resetIdle();
    }, { passive: true });
  });

  btn.addEventListener('click', hideVideo);
  btn.addEventListener('touchend', (e) => { e.preventDefault(); hideVideo(); });
})();

/* ── Loading screen interactions ── */
function initLoadingInteractions() {
  const overlay = document.getElementById('loading-screen');
  const layer = document.getElementById('parallax-layer');
  const glow = document.getElementById('cursor-glow');
  if (!overlay) return;

  // Mouse parallax — particles follow cursor depth
  overlay.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = overlay.getBoundingClientRect();
    const dx = ((e.clientX - left) / width - 0.5) * 2;
    const dy = ((e.clientY - top) / height - 0.5) * 2;
    if (layer) layer.style.transform = `translate(${dx * 14}px, ${dy * 10}px)`;
    if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
  });

  overlay.addEventListener('mouseleave', () => {
    if (layer) layer.style.transform = 'translate(0,0)';
  });

  // Click / tap → expanding AI ripple ring
  overlay.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ai-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    overlay.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  });
}

// Typewriter — types text char-by-char; resolves when done
function typewriter(el, text, speed) {
  speed = speed || 38;
  const cursor = el.querySelector('.type-cursor');
  el.childNodes.forEach(n => { if (n.nodeType === 3) n.remove(); });
  el.insertBefore(document.createTextNode(''), cursor || el.firstChild);
  const textNode = el.childNodes[0];
  let i = 0;
  return new Promise(resolve => {
    const t = setInterval(() => {
      textNode.nodeValue = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(t); resolve(); }
    }, speed);
  });
}

// Update which step is active / done
function setLoadingStep(index) {
  document.querySelectorAll('#loading-screen .step-item').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i < index) el.classList.add('done');
    else if (i === index) el.classList.add('active');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoadingInteractions();
  const videoElement = document.getElementById("webcam");
  const captureBtn = document.getElementById("capture-btn");
  const retakeBtn = document.getElementById("retake-btn");
  const generateBtn = document.getElementById("generate-btn");
  const backBtn = document.getElementById("back-btn");

  const loadingScreen = document.getElementById("loading-screen");
  const resultScreen = document.getElementById("result-screen");
  const resultImage = document.getElementById("result-image");

  // New elements
  const scanQrBtn = document.getElementById("scan-qr-btn");
  const printBtn = document.getElementById("print-btn");
  const restartBtn = document.getElementById("restart-btn");
  const qrModal = document.getElementById("qr-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const qrcodeContainer = document.getElementById("qrcode-container");

  // Lead modal elements
  const leadModal = document.getElementById("lead-modal");
  const leadForm = document.getElementById("lead-form");
  const leadSkipBtn = document.getElementById("lead-skip-btn");
  const closeLeadModalBtn = document.getElementById("close-lead-modal-btn");

  let capturedBlob = null;
  let cloudLink = null;
  let isUploading = false;

  // Get selected vibe from URL query parameters and map to correct backend value
  const urlParams = new URLSearchParams(window.location.search);
  const vibeMapping = {
    'night': 'THE NIGHT ENERGY',
    'sunset': 'THE SUNSET SOUL',
    'music': 'THE MUSIC TRIBE',
    'spirit': 'THE FREE SPIRIT'
  };
  const selectedVibe = vibeMapping[urlParams.get('vibe')] || 'THE NIGHT ENERGY';

  // Go back to main screen
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Attempt to access user's webcam
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      // Attach stream to video tag
      videoElement.srcObject = stream;
    })
    .catch(err => {
      console.error("Camera access denied or unavailable:", err);
      alert("Unable to access camera. Please check your permissions.");
    });

  if (captureBtn && retakeBtn) {
    captureBtn.addEventListener('click', () => {
      // Flash effect on capture
      const wrapper = document.querySelector('.webcam-box');
      wrapper.style.transition = "background-color 0.1s";
      wrapper.style.backgroundColor = "rgba(255, 255, 255, 0.8)";

      setTimeout(() => {
        wrapper.style.transition = "background-color 0.5s";
        wrapper.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
      }, 100);

      // Draw current video frame to canvas
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      // Mirror horizontally since front cameras are mirrored
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0);

      canvas.toBlob((blob) => {
        capturedBlob = blob;
      }, 'image/jpeg', 0.85);

      // Pause video to "capture" the frame visually
      videoElement.pause();

      // Swap buttons
      captureBtn.style.display = 'none';
      const actionBtns = document.getElementById('action-btns');
      if (actionBtns) actionBtns.style.display = 'flex';
    });

    retakeBtn.addEventListener('click', () => {
      // Play video again
      videoElement.play();
      capturedBlob = null;
      cloudLink = null;
      isUploading = false;

      // Swap buttons
      const actionBtns = document.getElementById('action-btns');
      if (actionBtns) actionBtns.style.display = 'none';
      captureBtn.style.display = 'flex';
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      if (!capturedBlob) {
        alert("Please snap a selfie first!");
        return;
      }

      // Show loading screen
      loadingScreen.style.display = 'flex';
      setLoadingStep(0);

      // Rotating loading messages with typewriter effect + step progress
      const loadingMessages = [
        "Analyzing selfie...",
        "Identifying facial structure...",
        "Applying styled vibe filter...",
        "Rendering dynamic poster details...",
        "Finalizing high-quality avatar..."
      ];

      let msgIndex = 0;
      const loadingMsgEl = document.getElementById("loading-message");

      // Kick off first typewriter immediately
      if (loadingMsgEl) typewriter(loadingMsgEl, loadingMessages[0]);

      const intervalId = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        setLoadingStep(msgIndex);
        if (loadingMsgEl) {
          loadingMsgEl.style.opacity = 0;
          setTimeout(() => {
            loadingMsgEl.style.opacity = 1;
            typewriter(loadingMsgEl, loadingMessages[msgIndex]);
          }, 220);
        }
      }, 2200);

      try {
        const formData = new FormData();
        formData.append('image', capturedBlob, 'selfie.jpg');
        formData.append('vibe', selectedVibe);

        let res;
        try {
          res = await fetch('/api/generate', {
            method: 'POST',
            body: formData
          });
        } catch (fetchErr) {
          throw fetchErr;
        }

        const data = await res.json();

        clearInterval(intervalId);
        loadingScreen.style.display = 'none';

        if (data.success && data.imageUrl) {
          // Display the returned base64 image URL
          resultImage.src = data.imageUrl;

          // Show result screen
          resultScreen.style.display = 'flex';

          // Trigger asynchronous background upload to generate a public cloud link
          triggerCloudUpload(data.imageUrl);
        } else {
          alert("Generation failed: " + (data.error || "Unknown error"));
          // Resume camera
          videoElement.play();
          capturedBlob = null;
          const actionBtns = document.getElementById('action-btns');
          if (actionBtns) actionBtns.style.display = 'none';
          captureBtn.style.display = 'flex';
        }
      } catch (err) {
        clearInterval(intervalId);
        loadingScreen.style.display = 'none';
        console.error("API Error:", err);
        alert("API Connection Error. Make sure your Node.js backend server is running!");

        // Resume camera
        videoElement.play();
        capturedBlob = null;
        const actionBtns = document.getElementById('action-btns');
        if (actionBtns) actionBtns.style.display = 'none';
        captureBtn.style.display = 'flex';
      }
    });
  }

  // Helper to trigger background upload for QR code
  async function triggerCloudUpload(imageBase64) {
    if (isUploading) return;
    isUploading = true;
    console.log("Uploading generated avatar to cloud service in background...");

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64: imageBase64 })
      });

      const uploadData = await response.json();
      if (uploadData.success && uploadData.url) {
        cloudLink = uploadData.url;
        console.log("Cloud link successfully created:", cloudLink);
      } else {
        throw new Error(uploadData.error || "Upload failed");
      }
    } catch (err) {
      console.warn("Background cloud upload failed, falling back to local base64 for QR code:", err);
      // Fallback to local image URL (base64) so QR code still generates locally!
      cloudLink = imageBase64;
    } finally {
      isUploading = false;
    }
  }

  // Function to actually generate and show QR code
  function generateAndShowQR() {
    if (!cloudLink) {
      alert("Preparing your QR code, please wait a brief moment...");
      return;
    }

    // Generate the QR Code using the loaded QRCode CDN
    qrcodeContainer.innerHTML = ""; // Clear existing QR Code
    try {
      new QRCode(qrcodeContainer, {
        text: cloudLink,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff"
      });
    } catch (err) {
      console.error("QR Code library error:", err);
    }

    // Show the Modal
    qrModal.style.display = 'flex';
  }

  // Scan QR Code logic - Opens Lead Modal First
  if (scanQrBtn) {
    scanQrBtn.addEventListener('click', () => {
      if (!cloudLink) {
        alert("Preparing your QR code, please wait a brief moment...");
        return;
      }

      // Open the Lead Capture modal
      leadModal.style.display = 'flex';
    });
  }

  // Block non-numeric characters and restrict typing to numbers only
  const phoneInput = document.getElementById("lead-phone");
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // Lead Form Submission
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById("lead-name").value;
      const email = document.getElementById("lead-email").value;
      const phone = document.getElementById("lead-phone").value;
      const org = document.getElementById("lead-org").value;

      // Validation check for exactly 10 digits
      if (phone.length !== 10) {
        alert("Please enter exactly 10 digits for your phone number!");
        return;
      }

      // Hide lead modal and immediately show QR code (instant feedback!)
      leadModal.style.display = 'none';
      generateAndShowQR();

      // Submit lead data asynchronously in the background
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            organization: org
          })
        });
        console.log("Lead successfully submitted in background!");
      } catch (leadErr) {
        console.warn("Background lead submission failed:", leadErr);
      }
    });
  }

  // Skip lead form logic - directly displays QR code
  if (leadSkipBtn) {
    leadSkipBtn.addEventListener('click', () => {
      leadModal.style.display = 'none';
      generateAndShowQR();
    });
  }

  // Close Lead Modal
  if (closeLeadModalBtn) {
    closeLeadModalBtn.addEventListener('click', () => {
      leadModal.style.display = 'none';
    });
  }

  // Close QR Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
  }

  if (leadModal) {
    leadModal.addEventListener('click', (e) => {
      if (e.target === leadModal) {
        leadModal.style.display = 'none';
      }
    });
  }

  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        qrModal.style.display = 'none';
      }
    });
  }

  // Print Logic
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // 1. Open high-quality print preview of the image
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print AI Avatar</title>
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; background: #000; height: 100vh; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body onload="window.print();window.close();">
              <img src="${resultImage.src}">
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      // 2. Fallback: Save local copy by downloading it instantly
      const a = document.createElement('a');
      a.href = resultImage.src;
      a.download = `goa-avatar-${selectedVibe}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // Create Again / Try Again Logic
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      // Go back to choice screen so they can choose a new vibe!
      window.location.href = 'index.html';
    });
  }
});
