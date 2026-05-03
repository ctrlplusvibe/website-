// Security: Prevent Right-Click and Common Copy Shortcuts
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'c' || e.key === 'v')) {
        e.preventDefault();
    }
    if (e.metaKey && (e.key === 's' || e.key === 'u' || e.key === 'c' || e.key === 'v')) {
        e.preventDefault();
    }
});

// Countdown Timer Logic
const countDownDate = new Date();
countDownDate.setDate(countDownDate.getDate() + 20); // 20 days from now

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("minutes");
    const secsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
    if (minsEl) minsEl.innerText = minutes.toString().padStart(2, '0');
    if (secsEl) secsEl.innerText = seconds.toString().padStart(2, '0');
};

setInterval(updateCountdown, 1000);
updateCountdown();

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

                fetch('http://127.0.0.1:3000/api/waitlist', {
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
});

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
