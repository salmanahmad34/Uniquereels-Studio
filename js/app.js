/**
 * ====================================================================
 * UNIQUE REELS — Frontend Application Controller
 * Interactive Spotlight Video Carousel • Single-Playback Enforcement
 * Dynamic WhatsApp Binding • FAQ Accordion
 * ====================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initWhatsAppLinks();
  initHeroVideoControls();
  init3DVideoGallery();
  initShortShowcasePlayers();
  initFaqAccordion();
  initScrollEffects();
  initMobileNavigation();
  initModals();
  updateCurrentYear();
});

/**
 * Shared Helper: Sync Play/Pause & Mute/Unmute SVG icons on video control buttons
 */
function syncMediaControlIcons(videoEl, playBtn, audioBtn) {
  const isPlaying = !videoEl.paused && !videoEl.ended;
  const playIcon = playBtn?.querySelector(".play-icon");
  const pauseIcon = playBtn?.querySelector(".pause-icon");
  if (playIcon && pauseIcon) {
    playIcon.style.display = isPlaying ? "none" : "block";
    pauseIcon.style.display = isPlaying ? "block" : "none";
  }

  const muteIcon = audioBtn?.querySelector(".mute-icon");
  const unmutedIcon = audioBtn?.querySelector(".unmuted-icon");
  if (muteIcon && unmutedIcon) {
    muteIcon.style.display = videoEl.muted ? "block" : "none";
    unmutedIcon.style.display = videoEl.muted ? "none" : "block";
  }
}

/**
 * Shared Helper: Silence all unmuted inline videos except optional active element
 */
function silenceOtherInlinePlayers(exceptVideo = null) {
  document.querySelectorAll(".hero-video, .short-feed-video").forEach((vid) => {
    if (vid !== exceptVideo && !vid.muted) {
      vid.muted = true;
      const card = vid.closest(".short-showcase-card, .phone-card");
      if (card) {
        syncMediaControlIcons(
          vid,
          card.querySelector(".short-play-btn, #heroPlayBtn"),
          card.querySelector(".short-audio-btn, #heroAudioBtn")
        );
      }
    }
  });
}

/**
 * Hero Device Video Controls
 * Allows user to play/pause and mute/unmute the phone mockup video.
 */
function initHeroVideoControls() {
  const heroVideo = document.getElementById("heroVideo");
  const playBtn = document.getElementById("heroPlayBtn");
  const audioBtn = document.getElementById("heroAudioBtn");
  const phoneCard = document.querySelector(".phone-card");

  if (!heroVideo) return;

  const syncHero = () => syncMediaControlIcons(heroVideo, playBtn, audioBtn);
  syncHero();

  function toggleHeroPlay() {
    if (heroVideo.paused) {
      heroVideo.play().then(syncHero).catch(() => {});
    } else {
      heroVideo.pause();
      syncHero();
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleHeroPlay();
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      heroVideo.muted = !heroVideo.muted;
      if (!heroVideo.muted) {
        silenceOtherInlinePlayers(heroVideo);
        if (heroVideo.paused) heroVideo.play().catch(() => {});
      }
      syncHero();
    });
  }

  if (phoneCard) {
    phoneCard.addEventListener("click", (e) => {
      if (e.target.closest(".hero-ctrl-btn")) return;
      toggleHeroPlay();
    });
  }

  heroVideo.addEventListener("play", syncHero);
  heroVideo.addEventListener("pause", syncHero);
  heroVideo.addEventListener("volumechange", syncHero);
}

/**
 * 1. Dynamic WhatsApp Binding
 * Reads central CONFIG and attaches appropriate pre-filled messages.
 * Note: Never prints the phone number visually on screen.
 */
function initWhatsAppLinks() {
  if (typeof CONFIG === "undefined") {
    console.warn("CONFIG object not found. Make sure js/config.js is loaded.");
    return;
  }

  const waElements = document.querySelectorAll("[data-wa]");
  waElements.forEach((el) => {
    const messageType = el.getAttribute("data-wa") || "defaultOrder";
    const customText = el.getAttribute("data-wa-custom") || null;
    const url = CONFIG.getWhatsAppUrl(messageType, customText);

    if (el.tagName.toLowerCase() === "a") {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      el.addEventListener("click", () => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }
  });

  // Also bind any element with class 'floating-wa-btn' if not already configured
  const floatingBtn = document.querySelector(".floating-wa-btn");
  if (floatingBtn && !floatingBtn.hasAttribute("data-wa")) {
    floatingBtn.href = CONFIG.getWhatsAppUrl("defaultOrder");
    floatingBtn.target = "_blank";
    floatingBtn.rel = "noopener noreferrer";
  }
}

/**
 * 2. Immersive 3D Infinite Floating Video Exhibition Room
 * - Continuously plays all floating preview videos (muted, looping, GIF-like)
 * - Smooth desktop mouse parallax + mobile touch rotation
 * - IntersectionObserver to pause previews when scrolled out of view
 * - Clicking any screen opens fullscreen Cinematic Modal with audio & WhatsApp action
 */
function init3DVideoGallery() {
  const stage = document.getElementById("room3dStage");
  const space = document.getElementById("room3dSpace");
  const screenCards = document.querySelectorAll(".screen-3d-card");
  const previewVideos = document.querySelectorAll(".screen-preview-video");

  // Cinematic Modal Elements
  const modal = document.getElementById("cinematicVideoModal");
  const modalVideo = document.getElementById("cinematicPlayerVideo");
  const modalClose = document.getElementById("cinematicModalClose");
  const modalCatBadge = document.getElementById("cinematicCatBadge");
  const modalTitle = document.getElementById("cinematicVideoTitle");
  const modalDesc = document.getElementById("cinematicVideoDesc");
  const modalOrderBtn = document.getElementById("cinematicOrderBtn");

  if (!stage || !space) return;

  // 1. Initialize preview flags & let IntersectionObserver drive playback near viewport
  previewVideos.forEach((vid) => {
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
  });

  // 2. IntersectionObserver: Play previews only near/in viewport to avoid starving sockets
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isModalOpen = modal && modal.classList.contains("active");
          if (!entry.isIntersecting) {
            previewVideos.forEach((vid) => {
              if (!vid.paused) vid.pause();
            });
          } else if (!isModalOpen) {
            previewVideos.forEach((vid) => {
              if (vid.paused) {
                vid.play().catch(() => {
                  const triggerPlay = () => {
                    vid.play().catch(() => {});
                    window.removeEventListener("click", triggerPlay);
                    window.removeEventListener("touchstart", triggerPlay);
                  };
                  window.addEventListener("click", triggerPlay, { once: true });
                  window.addEventListener("touchstart", triggerPlay, { once: true });
                });
              }
            });
          }
        });
      },
      { threshold: 0.01, rootMargin: "200px 0px" }
    );
    observer.observe(stage);
  } else {
    previewVideos.forEach((vid) => vid.play().catch(() => {}));
  }

  // 3. Smooth 3D Mouse Parallax & Touch Drag
  let currentRx = 0;
  let currentRy = 0;
  let targetRx = 0;
  let targetRy = 0;
  let isDragging = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let initialRx = 0;
  let initialRy = 0;
  let isHovering = false;

  // Desktop Mouse Movement
  stage.addEventListener("mousemove", (e) => {
    isHovering = true;
    const rect = stage.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
    targetRx = -ny * 16; // Pitch tilt up/down (deg)
    targetRy = nx * 22;  // Yaw rotation left/right (deg)
  });

  stage.addEventListener("mouseleave", () => {
    isHovering = false;
    targetRx = 0;
    targetRy = 0;
  });

  // Mobile Touch Interaction
  let touchMoved = false;

  stage.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      touchMoved = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      initialRx = currentRx;
      initialRy = currentRy;
    }
  }, { passive: true });

  stage.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      if (!touchMoved && Math.hypot(deltaX, deltaY) < 10) return;
      touchMoved = true;
      targetRy = Math.max(-28, Math.min(28, initialRy + deltaX * 0.18));
      targetRx = Math.max(-20, Math.min(20, initialRx - deltaY * 0.14));
    }
  }, { passive: true });

  stage.addEventListener("touchend", () => {
    isDragging = false;
    // Slowly reset or let idle sway take over
    setTimeout(() => {
      if (!isDragging) {
        targetRx = 0;
        targetRy = 0;
      }
    }, 2500);
  });

  // Render loop with lerp (linear interpolation) for buttery-smooth motion
  function animateRoom() {
    // If not hovering and not dragging on mobile, add a subtle breathing sway
    if (!isHovering && !isDragging) {
      const time = Date.now() * 0.0006;
      const swayY = Math.sin(time) * 3;
      const swayX = Math.cos(time * 0.8) * 2;
      targetRy = swayY;
      targetRx = swayX;
    }

    currentRx += (targetRx - currentRx) * 0.08;
    currentRy += (targetRy - currentRy) * 0.08;

    space.style.transform = `rotateX(${currentRx.toFixed(2)}deg) rotateY(${currentRy.toFixed(2)}deg)`;
    requestAnimationFrame(animateRoom);
  }
  requestAnimationFrame(animateRoom);

  function captureVideoPoster(videoEl) {
    if (!videoEl || videoEl.readyState < 2 || !videoEl.videoWidth || !videoEl.videoHeight) {
      return "";
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.82);
    } catch {
      return "";
    }
  }

  // 4. Click to Open Fullscreen Cinematic Modal
  function openCinematicModal(card) {
    if (!modal || !modalVideo) return;

    const videoSrc = card.getAttribute("data-video");
    if (!videoSrc) return;
    const category = card.getAttribute("data-category") || "Custom Reel";
    const title = card.getAttribute("data-title") || "Unique Video Concept";
    const desc = card.getAttribute("data-desc") || "Original custom-made short-form reel designed for high retention.";

    // Populate modal info
    if (modalCatBadge) modalCatBadge.textContent = `✦ ${category}`;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;

    // Instant poster frame from card video so modal never flashes empty/black while buffering
    const cardPreview = card.querySelector("video.screen-preview-video");
    const posterUrl = captureVideoPoster(cardPreview);
    if (posterUrl) {
      modalVideo.poster = posterUrl;
    } else {
      modalVideo.removeAttribute("poster");
    }

    // Set modal video & un-mute inside user gesture
    modalVideo.playsInline = true;
    modalVideo.setAttribute("webkit-playsinline", "true");
    modalVideo.preload = "auto";
    modalVideo.muted = false;
    modalVideo.src = videoSrc;
    modalVideo.load();

    // Setup custom WhatsApp order link for this specific reel style
    if (modalOrderBtn && typeof CONFIG !== "undefined") {
      const message = `Hello Unique Reels, I want to order a custom reel in the ${category} (${title}) style I saw on your website.`;
      modalOrderBtn.href = CONFIG.getWhatsAppUrl(null, message);
      modalOrderBtn.rel = "noopener noreferrer";
    }

    // Pause all background previews & silence inline audio while cinematic player is active
    previewVideos.forEach((vid) => {
      if (!vid.paused) vid.pause();
    });
    silenceOtherInlinePlayers();

    // Reveal modal and ensure mobile modal body starts at the video player
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const modalBody = modal.querySelector(".cinematic-modal-body");
    if (modalBody) modalBody.scrollTop = 0;

    // Play modal video with muted fallback if browser blocks unmuted playback
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        modalVideo.muted = true;
        modalVideo.play().catch(() => {});
      });
    }
  }

  function closeCinematicModal() {
    if (!modal || !modal.classList.contains("active")) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Stop modal video playback cleanly without requesting empty href ""
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.removeAttribute("poster");
      modalVideo.load();
    }

    // Resume floating preview videos
    previewVideos.forEach((vid) => {
      vid.play().catch(() => {});
    });
  }

  // Bind click handlers to each 3D floating screen
  screenCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (touchMoved) {
        touchMoved = false;
        return;
      }
      e.stopPropagation();
      openCinematicModal(card);
    });
  });

  // Modal close triggers: Close button, backdrop click, Escape key
  if (modalClose) {
    modalClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeCinematicModal();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeCinematicModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeCinematicModal();
    }
  });
}

/**
 * 2.5 Featured Shorts Showcase Controls
 * - Supports Play/Pause and Mute/Unmute on each 9:16 vertical short
 * - Enforces single unmuted audio source at a time across inline videos
 */
function initShortShowcasePlayers() {
  const section = document.getElementById("shorts-showcase");
  const cards = document.querySelectorAll(".short-showcase-card");
  if (!section || !cards.length) return;

  cards.forEach((card) => {
    const stage = card.querySelector(".short-video-stage");
    const video = card.querySelector(".short-feed-video");
    const playBtn = card.querySelector(".short-play-btn");
    const audioBtn = card.querySelector(".short-audio-btn");
    if (!stage || !video) return;

    const syncCard = () => syncMediaControlIcons(video, playBtn, audioBtn);
    syncCard();

    function togglePlay() {
      if (video.paused) {
        card.dataset.userPaused = "false";
        video.play().then(syncCard).catch(() => {});
      } else {
        card.dataset.userPaused = "true";
        video.pause();
        syncCard();
      }
    }

    if (playBtn) {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    if (audioBtn) {
      audioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (!video.muted) {
          silenceOtherInlinePlayers(video);
          if (video.paused) {
            card.dataset.userPaused = "false";
            video.play().catch(() => {});
          }
        }
        syncCard();
      });
    }

    stage.addEventListener("click", (e) => {
      if (e.target.closest(".hero-ctrl-btn")) return;
      togglePlay();
    });

    video.addEventListener("play", syncCard);
    video.addEventListener("pause", syncCard);
    video.addEventListener("volumechange", syncCard);
  });

  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target;
          const video = card.querySelector(".short-feed-video");
          if (!video) return;
          if (!entry.isIntersecting) {
            if (!video.paused) video.pause();
          } else if (card.dataset.userPaused !== "true" && video.paused) {
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.05, rootMargin: "250px 0px" }
    );
    cards.forEach((card) => cardObserver.observe(card));
  } else {
    cards.forEach((card) => {
      const video = card.querySelector(".short-feed-video");
      if (video) video.play().catch(() => {});
    });
  }
}

/**
 * 3. Interactive FAQ Accordion
 * - Single item expanded at a time
 * - First FAQ open by default
 * - Animated plus/minus toggle
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  function setFaqState(item, activate) {
    const trigger = item.querySelector(".faq-trigger");
    const icon = item.querySelector(".faq-icon-cross");
    if (activate) {
      item.classList.add("active");
      trigger?.setAttribute("aria-expanded", "true");
      if (icon) icon.textContent = "−";
    } else {
      item.classList.remove("active");
      trigger?.setAttribute("aria-expanded", "false");
      if (icon) icon.textContent = "+";
    }
  }

  // Ensure first FAQ is open by default, all others closed
  faqItems.forEach((item, idx) => {
    setFaqState(item, idx === 0);
  });

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isCurrentlyActive = item.classList.contains("active");

      // Close all items (accordion rule: only one open at a time)
      faqItems.forEach((i) => setFaqState(i, false));

      // If clicked wasn't active, activate it
      if (!isCurrentlyActive) {
        setFaqState(item, true);
      }
    });
  });
}

/**
 * 4. Scroll Reveal & Navbar State
 */
function initScrollEffects() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  }, { passive: true });

  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  function revealVisibleElements() {
    const triggerBottom = window.innerHeight + 120;
    revealElements.forEach((el) => {
      if (!el.classList.contains("revealed")) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerBottom) {
          el.classList.add("revealed");
        }
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: "120px 0px 0px 0px"
    });

    revealElements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", revealVisibleElements, { passive: true });
    revealVisibleElements();
  } else {
    revealElements.forEach((el) => el.classList.add("revealed"));
  }
}

/**
 * 5. Mobile Navigation
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById("mobileNavToggle");
  const navLinks = document.getElementById("navLinks");

  if (!toggleBtn || !navLinks) return;

  function setMenuOpen(open) {
    navLinks.classList.toggle("open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
  }

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !e.target.closest("header")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      setMenuOpen(false);
    }
  });
}

/**
 * 6. Modal Controls
 */
function initModals() {
  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  window.closeModalOnBackdrop = function (event, id) {
    if (event.target.id === id) {
      window.closeModal(id);
    }
  };

  document.querySelectorAll("[data-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("data-modal");
      if (targetId) window.openModal(targetId);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open").forEach((openEl) => {
        window.closeModal(openEl.id);
      });
    }
  });
}

/**
 * 7. Update Current Year
 */
function updateCurrentYear() {
  const yearEl = document.getElementById("yearLabel");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
