// ========================================
// MAIN APPLICATION LOGIC
// ========================================

class WeddingApp {
    constructor() {
        this.guestName = '';
        this.isPlaying = false;
        this.isDarkMode = false;
        this.audio = null;
        this.specialGuestsCache = {}; // Cache for special guests with photos
        this.init();
    }

    init() {
        // Parse URL params
        this.parseURLParams();

        // Setup function
        const setup = async () => {
            console.log('WeddingApp: Setting up...');
            this.setupEventListeners();
            this.initPreloader();
            this.initAOS();
            this.initCountdown();
            this.initMainCountdown(); // Main content countdown
            this.initMusic();
            this.initTheme();
            this.initFlowers(); // New Premium Effect
            this.populateData();
            // Load special guests first so their photos appear in messages
            await this.loadSpecialGuests();
            this.loadMessages();
            console.log('WeddingApp: Setup complete!');
        };

        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            // DOM is already loaded, run setup immediately
            setup();
        }
    }

    // ========================================
    // URL PARAMETER HANDLING
    // ========================================
    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.guestName = urlParams.get('to') || urlParams.get('nama') || 'Tamu Undangan';
        this.guestName = decodeURIComponent(this.guestName);
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    setupEventListeners() {
        // Open invitation button
        const openBtn = document.getElementById('openInvitation');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openInvitation());
        }

        // Music toggle
        const musicToggle = document.getElementById('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => this.toggleMusic());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // RSVP form
        const rsvpForm = document.getElementById('rsvpForm');
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', (e) => this.handleRSVP(e));
        }

        // Gallery lightbox
        this.setupGallery();

        // Copy buttons
        this.setupCopyButtons();

        // Smooth scroll for navigation
        this.setupSmoothScroll();
    }

    // ========================================
    // ANIMATE ON SCROLL
    // ========================================
    initAOS() {
        if (typeof AOS !== 'undefined') {
            const isMobile = window.innerWidth < 768;
            AOS.init({
                duration: isMobile ? 400 : 800,
                easing: 'ease-out',
                once: true,
                offset: isMobile ? 50 : 100,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }

        // Initialize section animations with Intersection Observer
        this.initSectionAnimations();
    }

    // ========================================
    // PRELOADER
    // ========================================
    initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Hide preloader when everything is loaded
        window.addEventListener('load', () => {
            // Minimum show time of 500ms
            setTimeout(() => {
                preloader.classList.add('loaded');
                // Remove from DOM after transition
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 800);
            }, 500);
        });
    }

    // ========================================
    // SECTION ANIMATIONS (Intersection Observer)
    // ========================================
    initSectionAnimations() {
        const sections = document.querySelectorAll('.couple-section, .story-section, .events-section, .location-section, .rsvp-section, .messages-section, .gallery-section, .gift-section, .protocol-section, .closing-section, .prayers-section');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // ========================================
    // COUNTDOWN TIMER
    // ========================================
    initCountdown() {
        const weddingDate = new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);

        const updateCountdown = () => {
            const now = new Date();
            const diff = weddingDate - now;
            const countdownEl = document.getElementById('countdown');
            if (!countdownEl) return;

            // Hari acara atau sudah lewat
            if (diff <= 0) {
                countdownEl.innerHTML = `
                    <div class="countdown-live">
                        <span class="live-icon">🎊</span>
                        <span class="live-text">Acara Sedang Berlangsung</span>
                        <span class="live-icon">🎊</span>
                    </div>
                `;
                countdownEl.classList.add('countdown-celebration');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Tentukan warna berdasarkan hari tersisa
            let urgencyClass = '';
            if (days > 30) {
                urgencyClass = 'countdown-relaxed';
            } else if (days > 7) {
                urgencyClass = 'countdown-soon';
            } else if (days > 1) {
                urgencyClass = 'countdown-urgent';
            } else {
                urgencyClass = 'countdown-imminent';
            }

            countdownEl.className = urgencyClass;

            countdownEl.innerHTML = `
              <div class="countdown-item">
                <span class="countdown-number">${days}</span>
                <span class="countdown-label">Hari</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number">${hours}</span>
                <span class="countdown-label">Jam</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number">${minutes}</span>
                <span class="countdown-label">Menit</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-number">${seconds}</span>
                <span class="countdown-label">Detik</span>
              </div>
            `;
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ========================================
    // MAIN COUNTDOWN (In content area)
    // ========================================
    initMainCountdown() {
        const weddingDate = new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
        const mainCountdownEl = document.getElementById('mainCountdownTimer');
        if (!mainCountdownEl) return;

        const updateMainCountdown = () => {
            const now = new Date();
            const diff = weddingDate - now;

            if (diff <= 0) {
                mainCountdownEl.innerHTML = `
                    <div class="countdown-celebration p-6 rounded-xl">
                        <span class="text-2xl">🎊 Hari Bahagia Telah Tiba! 🎊</span>
                    </div>
                `;
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            mainCountdownEl.innerHTML = `
                <div class="countdown-box">
                    <span class="countdown-box-number">${days}</span>
                    <span class="countdown-box-label">Hari</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-box-number">${hours}</span>
                    <span class="countdown-box-label">Jam</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-box-number">${minutes}</span>
                    <span class="countdown-box-label">Menit</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-box-number">${seconds}</span>
                    <span class="countdown-box-label">Detik</span>
                </div>
            `;
        };

        updateMainCountdown();
        setInterval(updateMainCountdown, 1000);
    }
    // ========================================
    // MUSIC PLAYER
    // ========================================
    initMusic() {
        this.audio = new Audio(CONFIG.music.src);
        this.audio.loop = true;
        this.audio.volume = 0.5;
    }

    toggleMusic() {
        const icon = document.querySelector('#musicToggle i');
        if (this.isPlaying) {
            this.audio.pause();
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
        this.isPlaying = !this.isPlaying;
    }

    // ========================================
    // THEME TOGGLE
    // ========================================
    initTheme() {
        // Check system preference or saved preference
        const savedTheme = localStorage.getItem('weddingTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.isDarkMode = true;
            document.documentElement.classList.add('dark');
        }

        this.updateThemeIcon();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('weddingTheme', this.isDarkMode ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.classList.remove('fa-sun', 'fa-moon');
            icon.classList.add(this.isDarkMode ? 'fa-sun' : 'fa-moon');
        }
    }

    // ========================================
    // FLOWERS / PARTICLES CANVAS
    // ========================================
    initFlowers() {
        const canvas = document.getElementById('flowerCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let petals = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Petal Class
        class Petal {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height - height;
                this.size = Math.random() * 15 + 10;
                this.speed = Math.random() * 2 + 0.5;
                this.angle = Math.random() * 360;
                this.spin = Math.random() < 0.5 ? 1 : -1;
                this.color = `rgba(255, 230, 230, ${Math.random() * 0.5 + 0.3})`; // Soft pink/white
            }

            update() {
                this.y += this.speed;
                this.x += Math.sin(this.angle * Math.PI / 180) * 0.5;
                this.angle += this.spin;

                if (this.y > height) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);

                // Draw Petal Shape
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(10, -10, 10, 10, 0, 20);
                ctx.bezierCurveTo(-10, 10, -10, -10, 0, 0);
                ctx.fill();

                ctx.restore();
            }
        }

        // Initialize Petals - reduced count on mobile for performance
        const isMobile = window.innerWidth < 768;
        const petalCount = isMobile ? 12 : 25;
        for (let i = 0; i < petalCount; i++) {
            petals.push(new Petal());
        }

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            petals.forEach(petal => {
                petal.update();
                petal.draw();
            });
            this.flowersAnimationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopFlowers() {
        if (this.flowersAnimationId) {
            cancelAnimationFrame(this.flowersAnimationId);
            this.flowersAnimationId = null;
        }
    }

    // ========================================
    // OPEN INVITATION
    // ========================================
    openInvitation() {
        const cover = document.getElementById('cover');
        const mainContent = document.getElementById('mainContent');

        cover.classList.add('hidden');
        mainContent.classList.remove('hidden');

        // Auto play music if enabled
        if (CONFIG.music.autoplay && !this.isPlaying) {
            this.toggleMusic();
        }

        // Stop heavy background animation
        this.stopFlowers();

        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // ========================================
    // POPULATE DATA FROM CONFIG
    // ========================================
    populateData() {
        // Guest name
        document.querySelectorAll('.guest-name').forEach(el => {
            el.textContent = this.guestName;
        });

        // Groom data
        this.setTextContent('.groom-name', CONFIG.groom.fullName);
        this.setTextContent('.groom-nickname', CONFIG.groom.nickname);
        this.setTextContent('.groom-father', CONFIG.groom.fatherName);
        this.setTextContent('.groom-mother', CONFIG.groom.motherName);
        this.setTextContent('.groom-bio', CONFIG.groom.bio);
        this.setTextContent('.groom-city', CONFIG.groom.city);
        this.setTextContent('.groom-child-order', CONFIG.groom.childOrder);
        this.setImageSrc('.groom-photo', CONFIG.groom.photo);

        // Bride data
        this.setTextContent('.bride-name', CONFIG.bride.fullName);
        this.setTextContent('.bride-nickname', CONFIG.bride.nickname);
        this.setTextContent('.bride-father', CONFIG.bride.fatherName);
        this.setTextContent('.bride-mother', CONFIG.bride.motherName);
        this.setTextContent('.bride-bio', CONFIG.bride.bio);
        this.setTextContent('.bride-city', CONFIG.bride.city);
        this.setTextContent('.bride-child-order', CONFIG.bride.childOrder);
        this.setImageSrc('.bride-photo', CONFIG.bride.photo);

        // Quote
        this.setTextContent('.quote-text', CONFIG.quote.text);
        this.setTextContent('.quote-source', CONFIG.quote.source);

        // Wedding date display
        const weddingDateDisplay = this.formatDate(CONFIG.wedding.date);
        this.setTextContent('.wedding-date', weddingDateDisplay);
        this.setTextContent('.wedding-city', CONFIG.wedding.city);

        // Events
        this.populateEvents();

        // Locations (with lazy-loaded maps)
        this.populateLocations();

        // Love story
        this.populateLoveStory();

        // Gallery
        this.populateGallery();

        // Prayers
        this.populatePrayers();

        // Gift accounts
        this.populateGiftAccounts();

        // Protocol
        this.populateProtocol();

        // RSVP form - auto fill guest name
        const rsvpName = document.getElementById('rsvpName');
        if (rsvpName && this.guestName !== 'Tamu Undangan') {
            rsvpName.value = this.guestName;
        }

        // Social links
        this.setupSocialLinks();

        // Section Backgrounds
        this.initBackgrounds();
    }

    setTextContent(selector, text) {
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = text;
        });
    }

    setImageSrc(selector, src) {
        document.querySelectorAll(selector).forEach(el => {
            el.src = src;
            el.loading = 'lazy';
        });
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    populateEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = CONFIG.events.map((event, index) => {
            const calendarLink = this.generateCalendarLink(event);

            // Format date - handle multi-day events
            let dateDisplay = this.formatDate(event.date);
            if (event.endDate && event.endDate !== event.date) {
                const startDate = new Date(event.date);
                const endDate = new Date(event.endDate);
                const startDay = startDate.getDate();
                const endDay = endDate.getDate();
                const month = startDate.toLocaleDateString('id-ID', { month: 'long' });
                const year = startDate.getFullYear();
                dateDisplay = `${startDay} - ${endDay} ${month} ${year}`;
            }

            return `
      <div class="event-card glass-card p-6 rounded-2xl" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="flex items-center gap-4 mb-4">
          <div class="event-icon w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <i class="fas ${event.icon} text-2xl text-white"></i>
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-primary dark:text-primary-light">${event.name}</h3>
            <p class="text-gray-600 dark:text-gray-300">${dateDisplay}</p>
          </div>
        </div>
        <div class="space-y-3 text-gray-700 dark:text-gray-200">
          <div class="flex items-center gap-3">
            <i class="fas fa-clock text-primary"></i>
            <span>${event.startTime} ${CONFIG.wedding.timezone} - Selesai</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fas fa-location-dot text-primary"></i>
            <span>${event.venue}</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fas fa-map text-primary"></i>
            <span class="text-sm">${event.address}</span>
          </div>
          <!--
      <div class="flex items-center gap-3">
        <i class="fas fa-shirt text-primary"></i>
        <span>Dresscode: ${event.dresscode}</span>
      </div>
      -->
        </div>
        <div class="mt-4 flex flex-col gap-2">
           <div class="flex gap-2">
              <a href="${event.mapsUrl}" target="_blank" class="btn-secondary flex-1 text-center py-2 rounded-lg text-sm">
                <i class="fas fa-map-marker-alt mr-2"></i>Buka Maps
              </a>
              <button onclick="app.shareLocation('${event.venue}', '${event.mapsUrl}')" class="btn-outline px-4 py-2 rounded-lg">
                <i class="fab fa-whatsapp"></i>
              </button>
           </div>
           <a href="${calendarLink}" target="_blank" class="btn-outline w-full text-center py-2 rounded-lg text-sm hover:bg-primary hover:text-white transition-colors">
             <i class="fas fa-calendar-plus mr-2"></i>Simpan ke Kalender
           </a>
        </div>
      </div>
    `}).join('');
    }

    populateLocations() {
        const locationsContainer = document.getElementById('locationsContainer');
        if (!locationsContainer) return;

        locationsContainer.innerHTML = CONFIG.events.map((event, index) => `
      <div class="location-card glass-card p-6 rounded-2xl" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="location-header mb-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <i class="fas ${event.icon} text-white"></i>
            </div>
            <h3 class="text-xl font-display font-bold text-primary dark:text-primary-light">${event.name}</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">${event.venue}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${event.address}</p>
        </div>
        <div class="map-container rounded-xl overflow-hidden mb-4" data-embed="${event.mapsEmbed}">
          <div class="map-placeholder flex items-center justify-center bg-gray-100 dark:bg-gray-800 h-64">
            <div class="text-center">
              <i class="fas fa-map-marked-alt text-4xl text-primary mb-2"></i>
              <p class="text-sm text-gray-500">Memuat peta...</p>
            </div>
          </div>
        </div>
        <div class="location-actions flex gap-2">
          <a href="${event.mapsUrl}" target="_blank" class="btn-primary flex-1 text-center py-2 rounded-lg text-sm">
            <i class="fas fa-map-marker-alt mr-2"></i>Buka Maps
          </a>
          <button onclick="app.shareLocation('${event.name}', '${event.mapsUrl}')" class="btn-outline px-4 py-2 rounded-lg">
            <i class="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    `).join('');

        // Lazy load maps when section comes into view
        this.lazyLoadMaps();
    }

    lazyLoadMaps() {
        const mapContainers = document.querySelectorAll('.map-container[data-embed]');

        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const embedUrl = container.dataset.embed;

                    if (embedUrl && !container.querySelector('iframe')) {
                        container.innerHTML = `
              <iframe
                src="${embedUrl}"
                width="100%"
                height="256"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            `;
                    }

                    mapObserver.unobserve(container);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });

        mapContainers.forEach(container => {
            mapObserver.observe(container);
        });
    }

    populateLoveStory() {
        const storyContainer = document.getElementById('storyTimeline');
        if (!storyContainer) return;

        storyContainer.innerHTML = CONFIG.loveStory.map((story, index) => `
      <div class="story-item flex gap-6 ${index % 2 === 0 ? '' : 'flex-row-reverse'}" data-aos="${index % 2 === 0 ? 'fade-right' : 'fade-left'}">
        <div class="story-image w-1/2">
          <img src="${story.photo}" alt="${story.title}" class="rounded-2xl shadow-lg w-full h-64 object-cover" loading="lazy">
        </div>
        <div class="story-content w-1/2 flex flex-col justify-center">
          <span class="text-sm text-primary font-medium">${story.date}</span>
          <h3 class="text-2xl font-display font-bold text-gray-800 dark:text-white mb-2">${story.phase}</h3>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${story.story}</p>
        </div>
      </div>
    `).join('');
    }

    populatePrayers() {
        const prayersContainer = document.getElementById('prayersContainer');
        if (!prayersContainer) return;

        prayersContainer.innerHTML = `
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${CONFIG.prayers.map((prayer, index) => {
            const isArabic = /[\u0600-\u06FF]/.test(prayer.content);
            const contentClass = isArabic
                ? 'text-lg font-arabic text-right leading-loose text-gray-800 dark:text-gray-200'
                : 'text-base font-body text-left leading-relaxed text-gray-600 dark:text-gray-300 italic';
            const dir = isArabic ? 'rtl' : 'ltr';

            return `
                    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                        
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <i class="fas ${prayer.icon}"></i>
                                </div>
                                <div>
                                    <span class="text-xs font-bold tracking-wider text-primary uppercase">${prayer.category}</span>
                                    <h3 class="font-display font-semibold text-gray-800 dark:text-white text-lg leading-tight">${prayer.title}</h3>
                                </div>
                            </div>
                            
                            <div class="space-y-3">
                                <p class="${contentClass}" dir="${dir}">${prayer.content}</p>
                                ${prayer.translation ? `<p class="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-primary/30 pl-3">${prayer.translation}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    populateGallery() {
        const galleryContainer = document.getElementById('galleryGrid');
        if (!galleryContainer) return;

        // 1. Flatten and store data
        this.galleryData = [
            ...CONFIG.gallery.prewedding.map(p => ({
                ...p,
                category: 'prewedding'
            })),
            ...CONFIG.gallery.engagement.map(p => ({
                ...p,
                category: 'engagement'
            })),
            ...CONFIG.gallery.family.map(p => ({
                ...p,
                category: 'family'
            }))
        ];

        // 2. Initial state
        this.currentGalleryFilter = 'all';
        this.visibleGalleryCount = 8;
        this.galleryIncrement = 8;

        // 3. Render
        this.renderGallery();
    }

    renderGallery() {
        const galleryContainer = document.getElementById('galleryGrid');
        if (!galleryContainer) return;

        // Filter
        const filtered = this.currentGalleryFilter === 'all' ?
            this.galleryData :
            this.galleryData.filter(item => item.category === this.currentGalleryFilter);

        // Slice
        const toShow = filtered.slice(0, this.visibleGalleryCount);

        // Render Grid
        galleryContainer.innerHTML = toShow.map((photo, index) => `
      <div class="gallery-item cursor-pointer" data-category="${photo.category}" data-aos="zoom-in" data-aos-delay="${(index % 6) * 100}">
        <img src="${photo.src}" alt="${photo.caption}" class="w-full h-64 object-cover rounded-xl" loading="lazy" onclick="app.openLightbox('${photo.src}', '${photo.caption}')">
        <div class="gallery-overlay absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
          <span class="text-white text-sm font-medium tracking-wide">${photo.caption}</span>
        </div>
      </div>
    `).join('');

        // Manage Load More Button
        const existingBtn = document.getElementById('loadMoreGalleryBtn');
        if (existingBtn) existingBtn.remove();

        if (this.visibleGalleryCount < filtered.length) {
            const btnContainer = document.createElement('div');
            btnContainer.id = 'loadMoreGalleryBtn';
            btnContainer.className = 'text-center mt-8 w-full';
            btnContainer.innerHTML = `
        <button onclick="app.loadMoreGallery()" class="px-8 py-3 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto gap-2">
          <i class="fas fa-images"></i>
          <span>Lihat Lebih Banyak (${filtered.length - this.visibleGalleryCount})</span>
        </button>
      `;
            // Insert after the grid's parent if grid is tight, or just after grid
            galleryContainer.parentNode.insertBefore(btnContainer, galleryContainer.nextSibling);

            // Re-trigger AOS
            if (window.AOS) setTimeout(() => window.AOS.refresh(), 100);
        }
    }

    loadMoreGallery() {
        this.visibleGalleryCount += this.galleryIncrement;
        this.renderGallery();
    }

    populateGiftAccounts() {
        const giftContainer = document.getElementById('giftAccounts');
        if (!giftContainer) return;

        giftContainer.innerHTML = CONFIG.giftAccounts.map((account, index) => `
      <div class="gift-card glass-card p-6 rounded-2xl text-center" data-aos="fade-up" data-aos-delay="${index * 100}">
        <img src="${account.logo}" alt="${account.bank}" class="h-12 mx-auto mb-4 object-contain" loading="lazy">
        <h4 class="font-semibold text-gray-800 dark:text-white mb-2">${account.bank}</h4>
        <p class="text-2xl font-mono text-primary dark:text-primary-light mb-2" id="account-${index}">${account.accountNumber}</p>
        <p class="text-gray-600 dark:text-gray-300 mb-4">a.n ${account.accountName}</p>
        <button onclick="app.copyToClipboard('${account.accountNumber}', 'account-${index}')" class="btn-primary px-6 py-2 rounded-full">
          <i class="fas fa-copy mr-2"></i>Salin Nomor
        </button>
      </div>
    `).join('');

        // QRIS
        const qrisContainer = document.getElementById('qrisContainer');
        if (qrisContainer && CONFIG.qrisImage) {
            qrisContainer.innerHTML = `
        <div class="glass-card p-6 rounded-2xl text-center" data-aos="fade-up">
          <h4 class="font-semibold text-gray-800 dark:text-white mb-4">Scan QRIS</h4>
          <img src="${CONFIG.qrisImage}" alt="QRIS" class="w-64 h-64 mx-auto rounded-xl" loading="lazy">
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">Scan dengan aplikasi e-wallet atau m-banking</p>
        </div>
      `;
        }

        // Gift Address
        this.populateGiftAddress();
    }

    populateGiftAddress() {
        const giftAddressContainer = document.getElementById('giftAddressContainer');
        if (!giftAddressContainer || !CONFIG.giftAddress || !CONFIG.giftAddress.enabled) return;

        const { recipientName, address, city, province, postalCode, phone, notes } = CONFIG.giftAddress;
        const fullAddress = `${recipientName}\n${address}\n${city}\n${province} ${postalCode}\nTelp: ${phone}`;

        giftAddressContainer.innerHTML = `
      <div class="gift-address-card glass-card p-6 rounded-2xl text-center max-w-md mx-auto" data-aos="fade-up">
        <div class="text-4xl mb-4">🎁</div>
        <h4 class="font-display font-semibold text-xl text-gray-800 dark:text-white mb-4">Alamat Pengiriman Hadiah</h4>
        <div class="text-left bg-white/50 dark:bg-white/10 p-4 rounded-xl mb-4">
          <p class="font-semibold text-gray-800 dark:text-white mb-1">${recipientName}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm">${address}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm">${city}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm">${province} ${postalCode}</p>
          <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
            <i class="fas fa-phone text-primary mr-2"></i>${phone}
          </p>
        </div>
        <button onclick="app.copyToClipboard(\`${fullAddress.replace(/\n/g, '\\n')}\`)" class="btn-secondary px-6 py-2 rounded-full text-sm">
          <i class="fas fa-copy mr-2"></i>Salin Alamat
        </button>
        ${notes ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-4 italic"><i class="fas fa-info-circle mr-1"></i>${notes}</p>` : ''}
      </div>
    `;
    }

    populateProtocol() {
        const protocol = CONFIG.protocol;

        // Rules
        const rulesContainer = document.getElementById('protocolRules');
        if (rulesContainer) {
            rulesContainer.innerHTML = protocol.rules.map(rule => `
        <li class="flex items-start gap-3">
          <i class="fas fa-check-circle text-primary mt-1"></i>
          <span>${rule}</span>
        </li>
      `).join('');
        }

        // Arrival time
        this.setTextContent('.arrival-time', protocol.arrivalTime);
        this.setTextContent('.parking-info', protocol.parking);

        // Contact persons
        const contactContainer = document.getElementById('contactPersons');
        if (contactContainer) {
            contactContainer.innerHTML = protocol.contactPersons.map(cp => `
        <a href="https://wa.me/${cp.phone.replace(/\D/g, '')}" target="_blank" class="flex items-center gap-3 glass-card p-4 rounded-xl hover:bg-primary/10 transition-colors">
          <i class="fab fa-whatsapp text-2xl text-green-500"></i>
          <div>
            <p class="font-medium text-gray-800 dark:text-white">${cp.name}</p>
            <p class="text-sm text-gray-500">${cp.phone}</p>
          </div>
        </a>
      `).join('');
        }
    }

    setupSocialLinks() {
        // Groom social links
        const groomSocial = document.getElementById('groomSocial');
        if (groomSocial) {
            groomSocial.innerHTML = this.generateSocialLinks(CONFIG.groom);
        }

        // Bride social links
        const brideSocial = document.getElementById('brideSocial');
        if (brideSocial) {
            brideSocial.innerHTML = this.generateSocialLinks(CONFIG.bride);
        }
    }

    generateSocialLinks(person) {
        let html = '';
        if (person.instagram) {
            html += `<a href="${person.instagram}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`;
        }
        if (person.twitter) {
            html += `<a href="${person.twitter}" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>`;
        }
        if (person.linkedin) {
            html += `<a href="${person.linkedin}" target="_blank" class="social-link"><i class="fab fa-linkedin"></i></a>`;
        }
        return html;
    }

    initBackgrounds() {
        if (!CONFIG.backgrounds) return;

        Object.keys(CONFIG.backgrounds).forEach(key => {
            const section = document.getElementById(key);
            const bgUrl = CONFIG.backgrounds[key];

            if (section && bgUrl) {
                // Avoid duplicating if called multiple times
                if (section.querySelector('.section-bg-wrapper')) return;

                section.classList.add('has-background');
                const wrapper = document.createElement('div');
                wrapper.className = 'section-bg-wrapper';

                wrapper.innerHTML = `
            <div class="section-bg-overlay"></div>
            <img src="${bgUrl}" alt="Background" class="section-bg-image" loading="lazy" onload="this.classList.add('loaded')">
          `;

                section.prepend(wrapper);
            }
        });
    }

    // ========================================
    // RSVP HANDLING
    // ========================================
    async handleRSVP(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('rsvpSubmit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengirim...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('rsvpName').value,
            phone: document.getElementById('rsvpPhone')?.value || '-',
            attendance: document.getElementById('rsvpAttendance').value,
            guestCount: parseInt(document.getElementById('rsvpGuests').value) || 1,
            message: document.getElementById('rsvpMessage').value,
            photo: this.getGuestPhoto(document.getElementById('rsvpName').value)
        };

        // Check spam
        const isSpam = await weddingAPI.checkSpam(formData.name);
        if (isSpam) {
            this.showNotification('Anda baru saja mengirim ucapan. Silakan tunggu beberapa saat.', 'warning');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Save to JSONBin
        console.log('📤 Attempting to save RSVP...');
        const result = await weddingAPI.saveData(formData);
        console.log('📥 Save result:', result);

        if (result.success) {
            this.showNotification('Terima kasih atas ucapan Anda! 💕', 'success');
            e.target.reset();

            // Refresh messages without page reload
            await this.loadMessages();

            // Scroll to messages section smoothly
            setTimeout(() => {
                const messagesSection = document.getElementById('messages');
                if (messagesSection) {
                    messagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        } else {
            console.error('❌ RSVP save failed:', result.error);
            this.showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    getGuestPhoto(name) {
        // Check API-loaded special guests first (cached)
        if (this.specialGuestsCache && this.specialGuestsCache[name]) {
            return this.specialGuestsCache[name];
        }
        // Fall back to static CONFIG.specialGuests
        if (CONFIG.specialGuests && CONFIG.specialGuests[name]) {
            return CONFIG.specialGuests[name];
        }
        // Return default avatar
        return null;
    }

    // Load special guests from API and cache their photos
    async loadSpecialGuests() {
        try {
            const guestsData = await weddingAPI.getGuestsData();
            if (guestsData.specialGuests && guestsData.specialGuests.length > 0) {
                // Build a name -> avatar map for quick lookup
                this.specialGuestsCache = {};
                guestsData.specialGuests.forEach(guest => {
                    if (guest.name && guest.avatar) {
                        this.specialGuestsCache[guest.name] = guest.avatar;
                    }
                });
                console.log('Loaded special guests:', Object.keys(this.specialGuestsCache).length);
            }
        } catch (error) {
            console.error('Error loading special guests:', error);
        }
    }

    // ========================================
    // LOAD MESSAGES
    // ========================================
    async loadMessages() {
        const messagesContainer = document.getElementById('messageWall');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-primary"></i></div>';

        const messages = await weddingAPI.getMessages();

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-comments text-4xl mb-4"></i>
          <p>Belum ada ucapan. Jadilah yang pertama!</p>
        </div>
      `;
            return;
        }

        messagesContainer.innerHTML = `
        <div class="message-wall-container custom-scrollbar">
            ${messages.map(msg => this.createMessageHTML(msg)).join('')}
        </div>
        `;
    }

    createMessageHTML(msg) {
        const reactions = msg.reactions || {};
        // Backward compatibility for old "likes"
        if (msg.likes && !reactions.love) reactions.love = msg.likes;

        const replies = msg.replies || [];
        
        // Get photo from message or lookup by name in special guests cache
        const photo = msg.photo || this.getGuestPhoto(msg.name);

        return `
            <div class="message-card glass-card p-4 rounded-xl mb-4" data-aos="fade-up" id="msg-${msg.id}">
                <div class="flex items-start gap-4">
                <div class="message-avatar w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${!photo ? 'bg-gradient-to-br from-primary to-secondary flex items-center justify-center' : ''}">
                        ${photo
                ? `<img src="${photo}" alt="${msg.name}" class="w-full h-full object-cover">`
                : `<span class="text-white text-lg font-bold">${msg.name.charAt(0).toUpperCase()}</span>`
            }
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-semibold text-gray-800 dark:text-white">${msg.name}</h4>
                            <span class="text-xs px-2 py-0.5 rounded-full ${msg.attendance === 'hadir' ? 'bg-green-100 text-green-700' : msg.attendance === 'tidak' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">
                                ${msg.attendance === 'hadir' ? 'Hadir' : msg.attendance === 'tidak' ? 'Tidak Hadir' : 'Ragu-ragu'}
                            </span>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm md:text-base">${msg.message}</p>

                        <div class="message-actions flex-wrap gap-2">
                            <span class="text-xs text-gray-400 w-full md:w-auto mb-2 md:mb-0">${this.formatMessageTime(msg.timestamp)}</span>

                            <!-- Reaction Buttons -->
                            <div class="reaction-group flex gap-1 bg-white/50 dark:bg-black/20 rounded-full px-2 py-1">
                                <button onclick="app.handleReaction(${msg.id}, 'love')" class="action-btn text-sm ${this.isReacted(msg.id, 'love') ? 'text-red-500' : ''}" title="Love">
                                    ❤️ <span class="count-${msg.id}-love ml-1 text-xs">${reactions.love || ''}</span>
                                </button>
                                <button onclick="app.handleReaction(${msg.id}, 'amen')" class="action-btn text-sm ${this.isReacted(msg.id, 'amen') ? 'text-green-500' : ''}" title="Aamiin">
                                    🤲 <span class="count-${msg.id}-amen ml-1 text-xs">${reactions.amen || ''}</span>
                                </button>
                                <button onclick="app.handleReaction(${msg.id}, 'congrats')" class="action-btn text-sm ${this.isReacted(msg.id, 'congrats') ? 'text-yellow-500' : ''}" title="Selamat">
                                    🥳 <span class="count-${msg.id}-congrats ml-1 text-xs">${reactions.congrats || ''}</span>
                                </button>
                            </div>

                            <button onclick="app.showReplyForm(${msg.id})" class="action-btn text-sm ml-2">
                                <i class="far fa-comment-dots"></i> Balas
                            </button>
                        </div>

                        <!-- Replies -->
                        ${replies.length > 0 ? `
            <div class="replies-container">
                ${replies.map(reply => `
                <div class="reply-item flex gap-3">
                    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        ${reply.photo
                    ? `<img src="${reply.photo}" alt="${reply.name}" class="w-full h-full object-cover">`
                    : `<div class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">${reply.name.charAt(0)}</div>`
                }
                    </div>
                    <div class="flex-1">
                        <div class="reply-header">
                            <span class="reply-name text-sm">${reply.name}</span>
                            <span class="reply-time text-xs">${this.formatMessageTime(reply.timestamp)}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${reply.message}</p>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}

                        <!-- Reply Form Container -->
                        <div id="reply-form-${msg.id}"></div>
                    </div>
                </div>
      </div>
    `;
    }

    async handleReaction(id, type) {
        if (this.isReacted(id, type)) return;

        // Update UI optimistically
        const countSpan = document.querySelector(`.count-${id}-${type}`);
        if (countSpan) {
            let current = parseInt(countSpan.textContent) || 0;
            countSpan.textContent = current + 1;
        }

        this.saveReactionLocally(id, type);
        await weddingAPI.addReaction(id, type);
    }

    showReplyForm(id) {
        const container = document.getElementById(`reply-form-${id}`);
        if (container.innerHTML !== '') {
            container.innerHTML = ''; // Toggle close
            return;
        }

        const isKnownGuest = this.guestName && this.guestName !== 'Tamu Undangan';


        container.innerHTML = `
            <form onsubmit="app.submitReply(event, ${id})" class="reply-form flex-col items-start gap-2 bg-white/50 dark:bg-black/10 p-3 rounded-xl mt-2">
                <div class="flex items-center gap-2 w-full">
                    ${isKnownGuest ? `
                        <span class="text-xs text-gray-500">Membalas sebagai: <strong class="text-primary">${this.guestName}</strong></span>
                        <input type="hidden" name="replyName" value="${this.guestName}">
                    ` : `
                        <input type="text" name="replyName" class="reply-input text-sm py-1" placeholder="Nama Anda" required style="width: 50%">
                    `}
                </div>
                <div class="flex gap-2 w-full">
                    <input type="text" name="replyMessage" class="reply-input text-sm" placeholder="Tulis balasan..." required autocomplete="off">
                    <button type="submit" class="reply-submit w-10 h-10 flex-shrink-0">
                        <i class="fas fa-paper-plane text-sm"></i>
                    </button>
                </div>
            </form>
        `;
    }

    async submitReply(e, id) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button');
        const originalIcon = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const name = form.replyName.value;
        const replyData = {
            name: name,
            message: form.replyMessage.value,
            photo: this.getGuestPhoto(name)
        };

        const success = await weddingAPI.addReply(id, replyData);

        if (success) {
            this.showNotification('Balasan terkirim!', 'success');
            this.loadMessages(); // Reload to show new reply
        } else {
            this.showNotification('Gagal mengirim balasan', 'error');
            btn.innerHTML = originalIcon;
            btn.disabled = false;
        }
    }

    isReacted(id, type) {
        const reacted = localStorage.getItem(`reacted_${type}`);
        const reactedIds = reacted ? JSON.parse(reacted) : [];
        return reactedIds.includes(id);
    }

    saveReactionLocally(id, type) {
        const key = `reacted_${type}`;
        const reacted = localStorage.getItem(key);
        let reactedIds = reacted ? JSON.parse(reacted) : [];
        if (!reactedIds.includes(id)) {
            reactedIds.push(id);
            localStorage.setItem(key, JSON.stringify(reactedIds));
        }
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ========================================
    // GALLERY LIGHTBOX
    // ========================================
    setupGallery() {
        // Gallery filter buttons
        const filterBtns = document.querySelectorAll('.gallery-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.filterGallery(category);

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    filterGallery(category) {
        this.currentGalleryFilter = category;
        this.visibleGalleryCount = 6; // Reset count on filter change

        // Update active class on buttons
        const buttons = document.querySelectorAll('.gallery-filter');
        buttons.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.renderGallery();
    }

    openLightbox(src, caption) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');

        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        document.body.style.overflow = '';
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    generateCalendarLink(event) {
        const startTime = event.date.replace(/-/g, '') + 'T' + event.startTime.replace(':', '') + '00';
        const endTime = event.date.replace(/-/g, '') + 'T' + event.endTime.replace(':', '') + '00';

        const text = encodeURIComponent(`The Wedding of ${CONFIG.groom.nickname} & ${CONFIG.bride.nickname} - ${event.name} `);
        const dates = `${startTime}/${endTime}`;
        const details = encodeURIComponent(`Acara ${event.name} pernikahan ${CONFIG.groom.nickname} & ${CONFIG.bride.nickname}.\n\nLokasi: ${event.venue}\nAlamat: ${event.address}\nGoogle Maps: ${event.mapsUrl}`);
        const location = encodeURIComponent(`${event.venue}, ${event.address}`);

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    }

    copyToClipboard(text, elementId) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Berhasil disalin!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Berhasil disalin!', 'success');
        });
    }

    shareLocation(venue, mapsUrl) {
        const message = `Lokasi Acara Pernikahan\n${CONFIG.groom.nickname} & ${CONFIG.bride.nickname}\n\n📍 ${venue}\n🔗 ${mapsUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    showNotification(message, type = 'info') {
        if (typeof Toast !== 'undefined') {
            Toast.show(message, type);
        } else {
            alert(message);
        }
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupCopyButtons() {
        document.querySelectorAll('[data-copy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.copy;
                this.copyToClipboard(text);
            });
        });
    }

    // ========================================
    // DISTANCE CALCULATION
    // ========================================
    async calculateDistance(lat, lng) {
        if (!navigator.geolocation) {
            return null;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    // Haversine formula
                    const R = 6371; // Earth's radius in km
                    const dLat = this.toRad(lat - userLat);
                    const dLng = this.toRad(lng - userLng);
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(lat)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c;

                    resolve(distance.toFixed(1));
                },
                () => resolve(null)
            );
        });
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }
}

// Initialize app
const app = new WeddingApp();
