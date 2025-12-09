// ========================================
// MAIN APPLICATION LOGIC
// ========================================

class WeddingApp {
    constructor() {
        this.guestName = '';
        this.isPlaying = false;
        this.isDarkMode = false;
        this.audio = null;
        this.init();
    }

    init() {
        // Parse URL params
        this.parseURLParams();

        // Setup function
        const setup = () => {
            console.log('WeddingApp: Setting up...');
            this.setupEventListeners();
            this.initAOS();
            this.initCountdown();
            this.initMusic();
            this.initTheme();
            this.populateData();
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
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Initialize section animations with Intersection Observer
        this.initSectionAnimations();
    }

    // ========================================
    // SECTION ANIMATIONS (Intersection Observer)
    // ========================================
    initSectionAnimations() {
        const sections = document.querySelectorAll('.couple-section, .story-section, .events-section, .location-section, .rsvp-section, .messages-section, .gallery-section, .gift-section, .protocol-section, .closing-section');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Don't unobserve - keep watching in case user scrolls up
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
                urgencyClass = 'countdown-relaxed';      // Hijau - masih lama
            } else if (days > 7) {
                urgencyClass = 'countdown-soon';         // Gold - mendekati
            } else if (days > 1) {
                urgencyClass = 'countdown-urgent';       // Orange - segera
            } else {
                urgencyClass = 'countdown-imminent';     // Merah - besok/hari ini
            }

            // Reset dan apply class baru
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

        // Love story
        this.populateLoveStory();

        // Gallery
        this.populateGallery();

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

        eventsContainer.innerHTML = CONFIG.events.map((event, index) => `
      <div class="event-card glass-card p-6 rounded-2xl" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="flex items-center gap-4 mb-4">
          <div class="event-icon w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <i class="fas ${event.icon} text-2xl text-white"></i>
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-primary dark:text-primary-light">${event.name}</h3>
            <p class="text-gray-600 dark:text-gray-300">${this.formatDate(event.date)}</p>
          </div>
        </div>
        <div class="space-y-3 text-gray-700 dark:text-gray-200">
          <div class="flex items-center gap-3">
            <i class="fas fa-clock text-primary"></i>
            <span>${event.startTime} - ${event.endTime} ${CONFIG.wedding.timezone}</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fas fa-location-dot text-primary"></i>
            <span>${event.venue}</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fas fa-map text-primary"></i>
            <span class="text-sm">${event.address}</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fas fa-shirt text-primary"></i>
            <span>Dresscode: ${event.dresscode}</span>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <a href="${event.mapsUrl}" target="_blank" class="btn-secondary flex-1 text-center py-2 rounded-lg">
            <i class="fas fa-map-marker-alt mr-2"></i>Buka Maps
          </a>
          <button onclick="app.shareLocation('${event.venue}', '${event.mapsUrl}')" class="btn-outline px-4 py-2 rounded-lg">
            <i class="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    `).join('');
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

    populateGallery() {
        const galleryContainer = document.getElementById('galleryGrid');
        if (!galleryContainer) return;

        const allPhotos = [
            ...CONFIG.gallery.prewedding.map(p => ({ ...p, category: 'prewedding' })),
            ...CONFIG.gallery.engagement.map(p => ({ ...p, category: 'engagement' })),
            ...CONFIG.gallery.family.map(p => ({ ...p, category: 'family' }))
        ];

        galleryContainer.innerHTML = allPhotos.map((photo, index) => `
      <div class="gallery-item cursor-pointer" data-category="${photo.category}" data-aos="zoom-in" data-aos-delay="${index * 50}">
        <img src="${photo.src}" alt="${photo.caption}" class="w-full h-64 object-cover rounded-xl" loading="lazy" onclick="app.openLightbox('${photo.src}', '${photo.caption}')">
        <div class="gallery-overlay absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <span class="text-white text-sm">${photo.caption}</span>
        </div>
      </div>
    `).join('');
    }

    populateGiftAccounts() {
        const giftContainer = document.getElementById('giftAccounts');
        if (!giftContainer) return;

        giftContainer.innerHTML = CONFIG.giftAccounts.map((account, index) => `
      <div class="gift-card glass-card p-6 rounded-2xl text-center" data-aos="fade-up" data-aos-delay="${index * 100}">
        <img src="${account.logo}" alt="${account.bank}" class="h-12 mx-auto mb-4 object-contain">
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
          <img src="${CONFIG.qrisImage}" alt="QRIS" class="w-64 h-64 mx-auto rounded-xl">
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
            attendance: document.getElementById('rsvpAttendance').value,
            guestCount: parseInt(document.getElementById('rsvpGuests').value) || 1,
            message: document.getElementById('rsvpMessage').value,
            photo: this.getGuestPhoto(document.getElementById('rsvpName').value)
        };

        // Check spam
        const isSpam = await jsonBinAPI.checkSpam(formData.name);
        if (isSpam) {
            this.showNotification('Anda baru saja mengirim ucapan. Silakan tunggu beberapa saat.', 'warning');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Save to JSONBin
        const result = await jsonBinAPI.saveData(formData);

        if (result.success) {
            this.showNotification('Terima kasih atas ucapan Anda! 💕', 'success');
            e.target.reset();

            // Redirect to messages section
            setTimeout(() => {
                window.location.href = window.location.pathname + window.location.search + '#messages';
                window.location.reload();
            }, 1500);
        } else {
            this.showNotification('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    getGuestPhoto(name) {
        // Check if guest has custom photo
        if (CONFIG.specialGuests && CONFIG.specialGuests[name]) {
            return CONFIG.specialGuests[name];
        }
        // Return default avatar
        return null;
    }

    // ========================================
    // LOAD MESSAGES
    // ========================================
    async loadMessages() {
        const messagesContainer = document.getElementById('messageWall');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-primary"></i></div>';

        const messages = await jsonBinAPI.getMessages();

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-comments text-4xl mb-4"></i>
          <p>Belum ada ucapan. Jadilah yang pertama!</p>
        </div>
      `;
            return;
        }

        messagesContainer.innerHTML = messages.map(msg => `
      <div class="message-card glass-card p-4 rounded-xl" data-aos="fade-up">
        <div class="flex items-start gap-4">
          <div class="message-avatar w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${!msg.photo ? 'bg-gradient-to-br from-primary to-secondary flex items-center justify-center' : ''}">
            ${msg.photo
                ? `<img src="${msg.photo}" alt="${msg.name}" class="w-full h-full object-cover">`
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
            <p class="text-gray-600 dark:text-gray-300">${msg.message}</p>
            <span class="text-xs text-gray-400 mt-2 block">${this.formatMessageTime(msg.timestamp)}</span>
          </div>
        </div>
      </div>
    `).join('');
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
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
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
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;

        const bgColors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };

        notification.classList.add(...bgColors[type].split(' '));
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
