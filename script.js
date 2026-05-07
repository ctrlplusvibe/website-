// Security: Prevent Right-Click and Common Copy Shortcuts
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    // Disable Copy/Paste/Save
    const activeElement = document.activeElement;
    const allowTextShortcut = activeElement && activeElement.closest && activeElement.closest('.allow-copy');
    if (!allowTextShortcut && (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u' || e.key === 'c' || e.key === 'v' || e.key === 'p')) {
        e.preventDefault();
    }
    // Disable Developer Tools (F12, Cmd+Opt+I)
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.metaKey && e.altKey && e.key === 'i')) {
        e.preventDefault();
    }
});

// Discourage Screenshots: Blur content when window loses focus
window.addEventListener('blur', () => {
    document.body.style.filter = 'blur(20px)';
});
window.addEventListener('focus', () => {
    document.body.style.filter = 'none';
});

// Countdown Timer Logic
const timerCard = document.querySelector('.timer-card');
const launchDate = timerCard ? new Date(timerCard.dataset.launchDate).getTime() : NaN;
let countdownInterval;

const setCountdownValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.innerText = value.toString().padStart(2, '0');
};

const updateCountdown = () => {
    if (!Number.isFinite(launchDate)) return;

    const now = Date.now();
    const distance = Math.max(launchDate - now, 0);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setCountdownValue('days', days);
    setCountdownValue('hours', hours);
    setCountdownValue('minutes', minutes);
    setCountdownValue('seconds', seconds);

    if (distance === 0) {
        const timerTitle = document.querySelector('.timer-header h3');
        if (timerTitle) timerTitle.innerText = 'System Online';
        clearInterval(countdownInterval);
    }
};

if (Number.isFinite(launchDate)) {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Core Application Logic
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Animations
    const elements = document.querySelectorAll('.glass-card:not(.reveal), .hero-content');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 150 * index + 100);
    });

    // 2. Waitlist Form Handling
    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            
            if (email) {
                const submitBtn = waitlistForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
                submitBtn.disabled = true;

                fetch('/api/waitlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })
                .then(res => res.json())
                .then(data => {
                    handleSuccess(email, waitlistForm);
                })
                .catch(err => {
                    console.error('Network Error:', err);
                    handleSuccess(email, waitlistForm);
                });
            }
        });
    }

    // 3. Scroll Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 4. Hero Carousel (events.html)
    const newlyCarouselTrack = document.getElementById('newly-carousel-track');
    if (newlyCarouselTrack) {
        const slides = newlyCarouselTrack.querySelectorAll('img');
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            newlyCarouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 4000);
    }

    // 5. Detail Page Premium Slider (event-details.html)
    const slideshowTrack = document.getElementById('slideshow-track');
    if (slideshowTrack) {
        const slides = slideshowTrack.querySelectorAll('img');
        const thumbnails = document.querySelectorAll('.thumb-card'); // Updated selector
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        const progressBar = document.getElementById('slideshow-progress-bar');
        
        let currentIndex = 0;
        let autoScrollInterval;
        let progressInterval;
        let progress = 0;
        const autoScrollDuration = 5000;
        const progressStep = 100;
        
        const updateSlider = () => {
            slideshowTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            thumbnails.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === currentIndex);
            });
            resetProgress();
        };
        
        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        };
        
        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        };
        
        const startAutoScroll = () => {
            stopAutoScroll();
            autoScrollInterval = setInterval(nextSlide, autoScrollDuration);
            progress = 0;
            progressInterval = setInterval(() => {
                progress += (progressStep / autoScrollDuration) * 100;
                if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
            }, progressStep);
        };
        
        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
            clearInterval(progressInterval);
        };
        
        const resetProgress = () => {
            progress = 0;
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.transition = 'width 0.1s linear';
                }, 10);
            }
        };

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoScroll(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoScroll(); });
        
        thumbnails.forEach((thumb, idx) => {
            thumb.addEventListener('click', () => {
                currentIndex = idx;
                updateSlider();
                startAutoScroll();
            });
        });

        const container = slideshowTrack.closest('.slideshow-container');
        if (container) {
            container.addEventListener('mouseenter', stopAutoScroll);
            container.addEventListener('mouseleave', startAutoScroll);
        }

        startAutoScroll();
    }

    initCardBuilder();
    initFloatingGetCardButton();
});

function initFloatingGetCardButton() {
    const button = document.querySelector('[data-floating-card-cta]');
    if (!button) return;

    const storageKey = 'ctrlVibeGetCardButtonPosition';
    const edgeGap = 16;
    const dragThreshold = 5;
    let dragState = null;
    let suppressNextClick = false;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const getBounds = () => ({
        maxX: Math.max(edgeGap, window.innerWidth - button.offsetWidth - edgeGap),
        maxY: Math.max(edgeGap, window.innerHeight - button.offsetHeight - edgeGap)
    });

    const clampPosition = (x, y) => {
        const bounds = getBounds();
        return {
            x: clamp(x, edgeGap, bounds.maxX),
            y: clamp(y, edgeGap, bounds.maxY)
        };
    };

    const setPosition = (x, y) => {
        const position = clampPosition(x, y);
        button.style.left = `${position.x}px`;
        button.style.top = `${position.y}px`;
        button.style.right = 'auto';
        button.style.bottom = 'auto';
        return position;
    };

    const getDefaultPosition = () => ({
        x: window.innerWidth - button.offsetWidth - edgeGap,
        y: window.innerHeight - button.offsetHeight - edgeGap
    });

    const getSavedPosition = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
            if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
                return saved;
            }
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
        return null;
    };

    const savePosition = (position) => {
        localStorage.setItem(storageKey, JSON.stringify(position));
    };

    const snapToNearestEdge = () => {
        const rect = button.getBoundingClientRect();
        const bounds = getBounds();
        const leftEdge = edgeGap;
        const rightEdge = bounds.maxX;
        const snapX = rect.left + rect.width / 2 < window.innerWidth / 2 ? leftEdge : rightEdge;
        const snapped = setPosition(snapX, rect.top);

        button.classList.add('is-snapping');
        window.setTimeout(() => button.classList.remove('is-snapping'), 320);
        savePosition(snapped);
    };

    const restorePosition = () => {
        const position = getSavedPosition() || getDefaultPosition();
        const clamped = setPosition(position.x, position.y);
        savePosition(clamped);
    };

    requestAnimationFrame(restorePosition);

    button.addEventListener('click', (event) => {
        if (!suppressNextClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressNextClick = false;
    });

    button.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;

        const rect = button.getBoundingClientRect();
        dragState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: rect.left,
            originY: rect.top,
            didDrag: false
        };

        button.classList.remove('is-snapping');
        button.classList.add('is-dragging');
        button.setPointerCapture(event.pointerId);
    });

    button.addEventListener('pointermove', (event) => {
        if (!dragState || event.pointerId !== dragState.pointerId) return;

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
            dragState.didDrag = true;
            suppressNextClick = true;
        }

        if (dragState.didDrag) {
            event.preventDefault();
            setPosition(dragState.originX + deltaX, dragState.originY + deltaY);
        }
    });

    const endDrag = (event) => {
        if (!dragState || event.pointerId !== dragState.pointerId) return;

        if (button.hasPointerCapture(event.pointerId)) {
            button.releasePointerCapture(event.pointerId);
        }

        const dragged = dragState.didDrag;
        dragState = null;
        button.classList.remove('is-dragging');

        if (dragged) {
            snapToNearestEdge();
        }
    };

    button.addEventListener('pointerup', endDrag);
    button.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', () => {
        const rect = button.getBoundingClientRect();
        const position = setPosition(rect.left, rect.top);
        savePosition(position);
    });
}

function initCardBuilder() {
    const fileInput = document.getElementById('card-photo-input');
    const uploadZone = document.getElementById('card-upload-zone');
    const previewImg = document.getElementById('card-photo-preview');
    const photoFrame = previewImg ? previewImg.closest('.preview-photo-frame') : null;
    const downloadButton = document.getElementById('download-card');
    const shareButton = document.getElementById('share-card');
    const copyButton = document.getElementById('copy-caption');
    const captionInput = document.getElementById('card-caption');
    const status = document.getElementById('card-status');

    if (!fileInput || !uploadZone || !previewImg || !downloadButton || !shareButton || !copyButton || !captionInput) {
        return;
    }

    let objectUrl = '';

    const setStatus = (message) => {
        if (status) status.textContent = message;
    };

    const loadPhoto = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setStatus('Please upload a PNG, JPG, or WEBP image.');
            return;
        }

        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        previewImg.src = objectUrl;
        if (photoFrame) photoFrame.classList.add('has-photo');
        setStatus('Photo loaded. Your card is ready to export.');
    };

    fileInput.addEventListener('change', (event) => {
        loadPhoto(event.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadZone.classList.remove('drag-over');
        });
    });

    uploadZone.addEventListener('drop', (event) => {
        loadPhoto(event.dataTransfer.files[0]);
    });

    downloadButton.addEventListener('click', async () => {
        const blob = await renderCardBlob(previewImg);
        downloadBlob(blob, 'ctrl-vibe-card.png');
        setStatus('Card downloaded.');
    });

    shareButton.addEventListener('click', async () => {
        const blob = await renderCardBlob(previewImg);
        const file = new File([blob], 'ctrl-vibe-card.png', { type: 'image/png' });
        const shareData = {
            title: 'My Ctrl + Vibe card',
            text: captionInput.value.trim(),
            files: [file]
        };

        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
            try {
                await navigator.share(shareData);
                setStatus('Share sheet opened.');
            } catch (error) {
                if (error.name !== 'AbortError') setStatus('Sharing was not completed.');
            }
            return;
        }

        downloadBlob(blob, 'ctrl-vibe-card.png');
        await copyText(captionInput.value.trim());
        setStatus('Native sharing is not available here. Card downloaded and caption copied.');
    });

    copyButton.addEventListener('click', async () => {
        await copyText(captionInput.value.trim());
        setStatus('Caption copied.');
    });
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.className = 'allow-copy';
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

async function renderCardBlob(photoElement) {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    drawCardBackground(ctx, canvas.width, canvas.height);
    drawCardChrome(ctx);
    drawCardPhoto(ctx, photoElement);
    drawCardText(ctx);

    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.95);
    });
}

function drawCardBackground(ctx, width, height) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#070711');
    bg.addColorStop(0.52, '#111327');
    bg.addColorStop(1, '#050506');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    drawGlow(ctx, 140, 120, 380, 'rgba(0, 243, 255, 0.26)');
    drawGlow(ctx, 980, 250, 320, 'rgba(255, 0, 234, 0.2)');
    drawGlow(ctx, 280, 1220, 360, 'rgba(255, 123, 0, 0.14)');

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(990, 345, 360, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-40, 1110, 400, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGlow(ctx, x, y, radius, color) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1350);
}

function drawCardChrome(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 46px "Space Grotesk", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ctrl + Vibe', 540, 108);
}

function drawCardPhoto(ctx, photoElement) {
    const x = 222;
    const y = 205;
    const size = 636;
    const center = x + size / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, y + size / 2, size / 2 + 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.16)';
    ctx.lineWidth = 30;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, y + size / 2, size / 2 + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, y + size / 2, size / 2 - 8, 0, Math.PI * 2);
    ctx.clip();

    if (photoElement && photoElement.complete && photoElement.naturalWidth > 0) {
        drawImageCover(ctx, photoElement, x, y, size, size);
    } else {
        const placeholder = ctx.createLinearGradient(x, y, x + size, y + size);
        placeholder.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        placeholder.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
        ctx.fillStyle = placeholder;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.font = '800 42px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Your photo', center, y + size / 2 + 14);
    }
    ctx.restore();
}

function drawCardText(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f3ff';
    ctx.font = '800 24px Inter, sans-serif';
    ctx.fillText('SRI LANKA BUILDER COMMUNITY', 540, 925);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 72px "Space Grotesk", Inter, sans-serif';
    ctx.fillText('I am building with', 540, 1005);
    ctx.fillText('Ctrl + Vibe', 540, 1083);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
    ctx.font = '500 28px Inter, sans-serif';
    drawWrappedText(ctx, 'Code smart. Build vibes. Share what you are creating with the next wave of developers.', 540, 1162, 760, 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.font = '800 22px Inter, sans-serif';
    ctx.fillText('#CtrlPlusVibe     #BuildInPublic     #SriLankaTech', 540, 1284);
}

function drawImageCover(ctx, image, x, y, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    words.forEach((word, index) => {
        const testLine = line ? `${line} ${word}` : word;
        const isLast = index === words.length - 1;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lineHeight;
        } else {
            line = testLine;
        }

        if (isLast) ctx.fillText(line, x, y);
    });
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Success UI Handler
function handleSuccess(email, form) {
    let waitlist = JSON.parse(localStorage.getItem('ctrlVibeWaitlist') || '[]');
    if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('ctrlVibeWaitlist', JSON.stringify(waitlist));
    }
    
    form.innerHTML = `
        <div class="success-message" style="display: flex; align-items: center; gap: 12px; background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.2); padding: 16px 24px; border-radius: 8px; width: 100%; margin: 0; animation: fade-in 0.5s ease;">
            <i class="fa-solid fa-circle-check" style="color: var(--accent-cyan); font-size: 1.2rem;"></i>
            <span style="color: var(--text-primary); font-weight: 500; font-size: 1rem;">Access secured. We'll vibe soon.</span>
        </div>
    `;

    if (typeof confetti === 'function') {
        const end = Date.now() + 3 * 1000;
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1", "#00f3ff", "#ff00ea"];
        const frame = () => {
            if (Date.now() > end) return;
            confetti({ particleCount: 2, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.5 }, colors: colors });
            confetti({ particleCount: 2, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.5 }, colors: colors });
            requestAnimationFrame(frame);
        };
        frame();
    }
}
