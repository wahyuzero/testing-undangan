// ========================================
// ADMIN PANEL JAVASCRIPT (Deno Deploy Version)
// ========================================

// ========================================
// CONFIGURATION
// ========================================
const ADMIN_CONFIG = {
    // Data Mempelai (untuk reply)
    groom: {
        nickname: 'Kukuh',
        photo: '/assets/images/groom.png'
    },
    bride: {
        nickname: 'Fitriani',
        photo: '/assets/images/bride.png'
    },

    // Base URL untuk invitation links (production)
    productionBaseUrl: 'https://kukuh-fitriani.site',
    
    // Detect tenant (groom or bride) from current path
    get invitationBaseUrl() {
        const isBride = window.location.pathname.startsWith('/undangan');
        const basePath = isBride ? '/undangan/' : '/';
        return this.productionBaseUrl + basePath;
    },

    // Template pesan undangan untuk clipboard
    invitationMessage: `Assalamu'alaikum warahmatullahi wabarakatuh,

Dengan segala kerendahan hati dan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk berkenan menghadiri acara pernikahan kami.

Melalui pesan ini, izinkan kami menyampaikan undangan pernikahan kami dalam bentuk undangan digital, yang dapat diakses melalui tautan berikut:

{LINK}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan meluangkan waktu untuk hadir dan memberikan doa restu kepada kami.

Atas perhatian serta kehadiran Bapak/Ibu/Saudara/i, kami ucapkan terima kasih yang sebesar-besarnya.

Wassalamu'alaikum warahmatullahi wabarakatuh.

Hormat kami,
Kukuh & Fitriani`
};

// ========================================
// API WRAPPER (Uses weddingAPI from api.js)
// ========================================
const AdminAPI = {
    async getData() {
        return await weddingAPI.getData();
    },

    async getGuestsData() {
        return await weddingAPI.getGuestsData();
    },

    async deleteMessage(id) {
        return await weddingAPI.deleteMessage(id);
    },

    async addReply(messageId, replyData) {
        return await weddingAPI.addReply(messageId, replyData);
    },

    async addGuest(guestData, type = 'invited') {
        return await weddingAPI.addGuest(guestData, type);
    },

    async deleteGuest(guestId, type = 'invited') {
        return await weddingAPI.deleteGuest(guestId, type);
    },

    async login(password) {
        return await weddingAPI.login(password);
    },

    async logout() {
        return await weddingAPI.logout();
    },

    async changePassword(currentPassword, newPassword) {
        return await weddingAPI.changePassword(currentPassword, newPassword);
    }
};

// ========================================
// ADMIN PANEL CLASS
// ========================================
class AdminPanel {
    constructor() {
        this.data = { guests: [] };
        this.guestsData = { invitedGuests: [], specialGuests: [] };
        this.filteredData = [];
        this.charts = {};
        this.deleteTargetId = null;

        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        this.bindEvents();
        this.checkAuth();
        this.initTheme();
    }

    bindEvents() {
        // Login
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        // Navigation
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // View all links
        document.querySelectorAll('.view-all[data-page]').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Refresh
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadData());

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Sidebar toggle (mobile)
        document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());

        // Search
        document.getElementById('searchRsvp')?.addEventListener('input', (e) => this.handleSearch(e));

        // Filter
        document.getElementById('filterAttendance')?.addEventListener('change', (_e) => this.handleFilter(_e));

        // Export
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportCSV());

        // Settings
        document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => this.handleChangePassword(e));
        document.getElementById('backupBtn')?.addEventListener('click', () => this.backupData());
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.confirmClearData());

        // Modal
        document.getElementById('cancelDelete')?.addEventListener('click', () => this.closeModal());
        document.getElementById('confirmDelete')?.addEventListener('click', () => this.executeDelete());
    }

    // ========================================
    // AUTHENTICATION (API-based)
    // ========================================
    async checkAuth() {
        // Check if we have a valid token
        const isAuthenticated = await weddingAPI.checkAuth();
        if (isAuthenticated) {
            this.showDashboard();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        // Show loading state
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        try {
            const result = await AdminAPI.login(password);
            
            if (result.success && result.token) {
                this.showDashboard();
                this.showToast('Login berhasil!', 'success');
            } else {
                this.showToast(result.error || 'Password salah!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login gagal. Coba lagi.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    async handleLogout() {
        await AdminAPI.logout();
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        this.showToast('Logout berhasil', 'success');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        this.loadData();
        this.loadGuestsData();
        this.updateSettingsInfo();
    }

    // ========================================
    // NAVIGATION
    // ========================================
    handleNavigation(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if (!page) return;

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

        // Update page title
        const titles = {
            overview: 'Dashboard',
            guests: 'Daftar Tamu',
            special: 'Tamu Spesial',
            rsvp: 'RSVP Management',
            messages: 'Messages',
            analytics: 'Analytics',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        // Show page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}Page`)?.classList.add('active');

        // Close sidebar on mobile
        document.querySelector('.sidebar')?.classList.remove('open');
    }

    toggleSidebar() {
        document.querySelector('.sidebar')?.classList.toggle('open');
    }

    // ========================================
    // THEME
    // ========================================
    initTheme() {
        const theme = localStorage.getItem('adminTheme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcon(true);
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('adminTheme', isLight ? 'light' : 'dark');
        this.updateThemeIcon(isLight);

        // Update charts for theme
        this.updateChartColors();
    }

    updateThemeIcon(isLight) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ========================================
    // DATA LOADING
    // ========================================
    async loadData() {
        try {
            // Show loading state
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }

            this.data = await AdminAPI.getData();
            this.filteredData = [...(this.data.guests || [])];

            this.updateStats();
            this.renderRecentActivity();
            this.renderRSVPTable();
            this.renderMessages();
            this.initCharts();
            this.updateAnalytics();

            // Reset refresh button
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            }

            console.log('✅ Data loaded:', this.data);
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showToast('Gagal memuat data', 'error');
        }
    }

    // ========================================
    // STATS
    // ========================================
    updateStats() {
        const guests = this.data.guests || [];

        const totalRsvp = guests.length;
        const totalHadir = guests.filter(g => g.attendance === 'hadir').length;
        const totalTidakHadir = guests.filter(g => g.attendance === 'tidak').length;
        const totalGuests = guests
            .filter(g => g.attendance === 'hadir')
            .reduce((sum, g) => sum + (g.guestCount || 1), 0);

        this.animateNumber('totalRsvp', totalRsvp);
        this.animateNumber('totalHadir', totalHadir);
        this.animateNumber('totalTidakHadir', totalTidakHadir);
        this.animateNumber('totalGuests', totalGuests);
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                element.textContent = target;
            } else {
                element.textContent = Math.round(current);
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // ========================================
    // RECENT ACTIVITY
    // ========================================
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const guests = (this.data.guests || []).slice(0, 10);

        if (guests.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <p style="color: var(--text-muted); text-align: center; width: 100%;">
                        Belum ada aktivitas
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = guests.map(guest => `
            <div class="activity-item">
                <div class="activity-avatar">${this.getInitials(guest.name)}</div>
                <div class="activity-content">
                    <div class="activity-name">${this.escapeHtml(guest.name)}</div>
                    <div class="activity-message">${this.escapeHtml(guest.message || '-')}</div>
                </div>
                <span class="activity-status ${guest.attendance}">${this.getAttendanceLabel(guest.attendance)}</span>
                <span class="activity-time">${this.formatTime(guest.timestamp)}</span>
            </div>
        `).join('');
    }

    // ========================================
    // RSVP TABLE
    // ========================================
    renderRSVPTable() {
        const tbody = document.getElementById('rsvpTableBody');
        const container = document.getElementById('rsvpPage');
        if (!tbody || !container) return;

        const isMobile = window.innerWidth <= 768;

        if (this.filteredData.length === 0) {
            if (isMobile) {
                container.querySelector('.table-container').style.display = 'none';
                const mobileContainer = container.querySelector('.rsvp-mobile-cards') || this.createRsvpMobileContainer(container);
                mobileContainer.style.display = 'grid';
                mobileContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Tidak ada data RSVP</p>
                    </div>
                `;
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                            Tidak ada data
                        </td>
                    </tr>
                `;
                container.querySelector('.table-container').style.display = 'block';
                const mobileContainer = container.querySelector('.rsvp-mobile-cards');
                if (mobileContainer) mobileContainer.style.display = 'none';
            }
            return;
        }

        if (isMobile) {
            // Mobile: Card Layout
            container.querySelector('.table-container').style.display = 'none';
            const mobileContainer = container.querySelector('.rsvp-mobile-cards') || this.createRsvpMobileContainer(container);
            mobileContainer.style.display = 'grid';

            mobileContainer.innerHTML = this.filteredData.map(guest => `
                <div class="rsvp-card">
                    <div class="rsvp-card-header">
                        <div class="rsvp-card-avatar">${this.getInitials(guest.name)}</div>
                        <div class="rsvp-card-info">
                            <div class="rsvp-card-name" onclick="admin.showFullName('${this.escapeHtml(guest.name).replace(/'/g, "\\'")}')">
                                ${this.getShortName(guest.name)}
                                ${guest.name.split(' ').length > 2 ? '<i class="fas fa-info-circle"></i>' : ''}
                            </div>
                            <div class="rsvp-card-meta">
                                <span class="activity-status ${guest.attendance}">${this.getAttendanceLabel(guest.attendance)}</span>
                                <span class="guest-count"><i class="fas fa-users"></i> ${guest.guestCount || 1}</span>
                            </div>
                        </div>
                    </div>
                    ${guest.message ? `<div class="rsvp-card-message">${this.escapeHtml(guest.message)}</div>` : ''}
                    <div class="rsvp-card-footer">
                        <span class="rsvp-time"><i class="fas fa-clock"></i> ${this.formatTime(guest.timestamp)}</span>
                        <button class="btn-delete" onclick="admin.confirmDelete(${guest.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            // Desktop: Table Layout
            container.querySelector('.table-container').style.display = 'block';
            const mobileContainer = container.querySelector('.rsvp-mobile-cards');
            if (mobileContainer) mobileContainer.style.display = 'none';

            tbody.innerHTML = this.filteredData.map(guest => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="activity-avatar" style="width: 36px; height: 36px; font-size: 0.8rem;">
                                ${this.getInitials(guest.name)}
                            </div>
                            <span>${this.escapeHtml(guest.name)}</span>
                        </div>
                    </td>
                    <td>
                        <span class="activity-status ${guest.attendance}">${this.getAttendanceLabel(guest.attendance)}</span>
                    </td>
                    <td>${guest.guestCount || 1}</td>
                    <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${this.escapeHtml(guest.message || '-')}
                    </td>
                    <td>${this.formatTime(guest.timestamp)}</td>
                    <td>
                        <button class="btn-delete" onclick="admin.confirmDelete(${guest.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    createRsvpMobileContainer(container) {
        const mobileCards = document.createElement('div');
        mobileCards.className = 'rsvp-mobile-cards';
        container.querySelector('.table-container').after(mobileCards);
        return mobileCards;
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filteredData = (this.data.guests || []).filter(guest =>
            guest.name.toLowerCase().includes(query) ||
            (guest.message && guest.message.toLowerCase().includes(query))
        );
        this.applyFilter();
    }

    handleFilter(e) {
        this.applyFilter();
    }

    applyFilter() {
        const filter = document.getElementById('filterAttendance')?.value || 'all';
        const searchQuery = document.getElementById('searchRsvp')?.value.toLowerCase() || '';

        this.filteredData = (this.data.guests || []).filter(guest => {
            const matchesSearch = guest.name.toLowerCase().includes(searchQuery) ||
                (guest.message && guest.message.toLowerCase().includes(searchQuery));
            const matchesFilter = filter === 'all' || guest.attendance === filter;
            return matchesSearch && matchesFilter;
        });

        this.renderRSVPTable();
    }

    // ========================================
    // MESSAGES
    // ========================================
    renderMessages() {
        const container = document.getElementById('messagesGrid');
        if (!container) return;

        const guests = this.data.guests || [];

        if (guests.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Belum ada ucapan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = guests.map(guest => `
            <div class="message-card">
                <div class="message-header">
                    <div class="message-author">
                        <div class="message-avatar">${this.getInitials(guest.name)}</div>
                        <div>
                            <div class="message-name">${this.escapeHtml(guest.name)}</div>
                            <div class="message-time">${this.formatTime(guest.timestamp)}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-reply" onclick="admin.openReplyModal(${guest.id})" title="Balas">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="btn-delete" onclick="admin.confirmDelete(${guest.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="message-body">${this.escapeHtml(guest.message || '-')}</div>
                ${this.renderReplies(guest.replies)}
                <div class="message-reactions">
                    <span class="reaction love">
                        <i class="fas fa-heart"></i> ${guest.reactions?.love || 0}
                    </span>
                    <span class="reaction aamiin">
                        <i class="fas fa-hands-praying"></i> ${guest.reactions?.aamiin || 0}
                    </span>
                    <span class="reaction congrats">
                        <i class="fas fa-gift"></i> ${guest.reactions?.congrats || 0}
                    </span>
                </div>
            </div>
        `).join('');
    }

    renderReplies(replies) {
        if (!replies || replies.length === 0) return '';

        return `
            <div class="message-replies">
                ${replies.map(reply => `
                    <div class="reply-item">
                        <img src="${reply.photo}" alt="${reply.name}" class="reply-avatar" onerror="this.style.display='none'">
                        <div class="reply-content">
                            <div class="reply-author ${reply.role}">${this.escapeHtml(reply.name)}</div>
                            <div class="reply-text">${this.escapeHtml(reply.message)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ========================================
    // CHARTS
    // ========================================
    initCharts() {
        this.initAttendanceChart();
        this.initTimelineChart();
        this.initDailyResponseChart();
    }

    initAttendanceChart() {
        const ctx = document.getElementById('attendanceChart')?.getContext('2d');
        if (!ctx) return;

        const guests = this.data.guests || [];
        const hadir = guests.filter(g => g.attendance === 'hadir').length;
        const tidak = guests.filter(g => g.attendance === 'tidak').length;
        const ragu = guests.filter(g => g.attendance === 'ragu').length;

        if (this.charts.attendance) {
            this.charts.attendance.destroy();
        }

        this.charts.attendance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hadir', 'Tidak Hadir', 'Ragu-ragu'],
                datasets: [{
                    data: [hadir, tidak, ragu],
                    backgroundColor: ['#22c55e', '#ef4444', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getChartTextColor(),
                            padding: 20
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initTimelineChart() {
        const ctx = document.getElementById('timelineChart')?.getContext('2d');
        if (!ctx) return;

        const guests = this.data.guests || [];
        const timeline = this.getTimelineData(guests);

        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.labels,
                datasets: [{
                    label: 'Responses',
                    data: timeline.data,
                    borderColor: '#7c9885',
                    backgroundColor: 'rgba(124, 152, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: this.getChartTextColor()
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: this.getChartTextColor(),
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initDailyResponseChart() {
        const ctx = document.getElementById('dailyResponseChart')?.getContext('2d');
        if (!ctx) return;

        const guests = this.data.guests || [];
        const daily = this.getDailyData(guests);

        if (this.charts.daily) {
            this.charts.daily.destroy();
        }

        this.charts.daily = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: daily.labels,
                datasets: [{
                    label: 'Responses per Day',
                    data: daily.data,
                    backgroundColor: 'rgba(124, 152, 133, 0.6)',
                    borderColor: '#7c9885',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: this.getChartTextColor()
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: this.getChartTextColor(),
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    getTimelineData(guests) {
        const last7Days = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));

            const count = guests.filter(g => {
                if (!g.timestamp) return false;
                return g.timestamp.startsWith(dateStr);
            }).length;
            data.push(count);
        }

        return { labels: last7Days, data };
    }

    getDailyData(guests) {
        const dailyCount = {};

        guests.forEach(g => {
            if (!g.timestamp) return;
            const date = g.timestamp.split('T')[0];
            dailyCount[date] = (dailyCount[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dailyCount).sort().slice(-14);
        const labels = sortedDates.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });
        const data = sortedDates.map(d => dailyCount[d]);

        return { labels, data };
    }

    getChartTextColor() {
        return document.body.classList.contains('light-theme') ? '#52525b' : '#a1a1aa';
    }

    updateChartColors() {
        // Reinitialize charts with new theme colors
        setTimeout(() => this.initCharts(), 100);
    }

    // ========================================
    // ANALYTICS
    // ========================================
    updateAnalytics() {
        const guests = this.data.guests || [];

        // Total reactions
        let totalReactions = 0;
        let totalReplies = 0;

        guests.forEach(g => {
            if (g.reactions) {
                totalReactions += (g.reactions.love || 0) + (g.reactions.aamiin || 0) + (g.reactions.congrats || 0);
            }
            if (g.replies) {
                totalReplies += g.replies.length;
            }
        });

        this.animateNumber('totalReactions', totalReactions);
        this.animateNumber('totalReplies', totalReplies);
    }

    // ========================================
    // EXPORT
    // ========================================
    exportCSV() {
        const guests = this.data.guests || [];

        if (guests.length === 0) {
            this.showToast('Tidak ada data untuk di-export', 'warning');
            return;
        }

        const headers = ['Nama', 'Telepon', 'Status', 'Jumlah Tamu', 'Pesan', 'Waktu'];
        const rows = guests.map(g => [
            g.name,
            g.phone || '-',
            this.getAttendanceLabel(g.attendance),
            g.guestCount || 1,
            `"${(g.message || '').replace(/"/g, '""')}"`,
            this.formatTime(g.timestamp)
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `rsvp_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
        this.showToast('Export berhasil!', 'success');
    }

    // ========================================
    // DELETE
    // ========================================
    confirmDelete(id) {
        this.deleteTargetId = id;
        document.getElementById('deleteModal')?.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('deleteModal')?.classList.add('hidden');
        this.deleteTargetId = null;
    }

    async executeDelete() {
        if (!this.deleteTargetId) return;

        try {
            const success = await AdminAPI.deleteMessage(this.deleteTargetId);
            if (success) {
                this.showToast('Data berhasil dihapus', 'success');
                this.loadData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            this.showToast('Gagal menghapus data', 'error');
        }

        this.closeModal();
    }

    // ========================================
    // SETTINGS
    // ========================================
    async handleChangePassword(e) {
        e.preventDefault();
        const currentPassword = prompt('Masukkan password saat ini:');
        if (!currentPassword) {
            this.showToast('Password saat ini diperlukan', 'error');
            return;
        }

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 6) {
            this.showToast('Password minimal 6 karakter', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showToast('Password tidak cocok', 'error');
            return;
        }

        try {
            const result = await AdminAPI.changePassword(currentPassword, newPassword);
            if (result.success) {
                document.getElementById('changePasswordForm').reset();
                this.showToast('Password berhasil diubah', 'success');
            } else {
                this.showToast(result.error || 'Gagal mengubah password', 'error');
            }
        } catch (error) {
            console.error('Change password error:', error);
            this.showToast('Gagal mengubah password', 'error');
        }
    }

    backupData() {
        const data = JSON.stringify(this.data, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showToast('Backup berhasil!', 'success');
    }

    confirmClearData() {
        if (confirm('PERINGATAN: Semua data akan dihapus permanen. Lanjutkan?')) {
            if (confirm('Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan.')) {
                this.clearAllData();
            }
        }
    }

    async clearAllData() {
        try {
            // Note: Clear all data not supported via API, would need backend endpoint
            this.showToast('Fitur ini memerlukan akses backend langsung', 'warning');
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showToast('Gagal menghapus data', 'error');
        }
    }

    updateSettingsInfo() {
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString('id-ID');
        document.getElementById('binIdDisplay').textContent = 'API Connected';
    }

    // ========================================
    // UTILITIES
    // ========================================
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    getAttendanceLabel(status) {
        const labels = {
            hadir: 'Hadir',
            tidak: 'Tidak Hadir',
            ragu: 'Ragu-ragu'
        };
        return labels[status] || status || '-';
    }

    formatTime(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========================================
    // GUEST LIST MANAGEMENT
    // ========================================
    initGuestManagement() {
        // Add Guest button
        document.getElementById('addGuestBtn')?.addEventListener('click', () => {
            document.getElementById('addGuestForm')?.classList.toggle('hidden');
        });

        // Cancel Add Guest
        document.getElementById('cancelAddGuest')?.addEventListener('click', () => {
            document.getElementById('addGuestForm')?.classList.add('hidden');
            document.getElementById('guestForm')?.reset();
        });

        // Guest Form Submit
        document.getElementById('guestForm')?.addEventListener('submit', (e) => this.handleAddGuest(e));

        // Special Guest button
        document.getElementById('addSpecialBtn')?.addEventListener('click', () => {
            document.getElementById('addSpecialForm')?.classList.toggle('hidden');
        });

        // Mobile Add Guest button
        document.getElementById('addGuestBtnMobile')?.addEventListener('click', () => {
            document.getElementById('addGuestForm')?.classList.toggle('hidden');
            document.getElementById('addGuestForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Mobile Add Special button
        document.getElementById('addSpecialBtnMobile')?.addEventListener('click', () => {
            document.getElementById('addSpecialForm')?.classList.toggle('hidden');
            document.getElementById('addSpecialForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Cancel Add Special
        document.getElementById('cancelAddSpecial')?.addEventListener('click', () => {
            document.getElementById('addSpecialForm')?.classList.add('hidden');
            document.getElementById('specialForm')?.reset();
        });

        // Special Form Submit
        document.getElementById('specialForm')?.addEventListener('submit', (e) => this.handleAddSpecialGuest(e));

        // Reply Modal
        document.getElementById('closeReplyModal')?.addEventListener('click', () => this.closeReplyModal());
        document.getElementById('cancelReply')?.addEventListener('click', () => this.closeReplyModal());
        document.getElementById('replyForm')?.addEventListener('submit', (e) => this.handleReply(e));

        // Initialize couple avatars in reply modal
        this.initCoupleAvatars();
    }

    initCoupleAvatars() {
        // Set groom avatar and name
        const groomAvatar = document.getElementById('groomAvatarPreview');
        const groomName = document.getElementById('groomNamePreview');
        if (groomAvatar && ADMIN_CONFIG.groom?.photo) {
            groomAvatar.src = ADMIN_CONFIG.groom.photo;
        }
        if (groomName && ADMIN_CONFIG.groom?.nickname) {
            groomName.textContent = ADMIN_CONFIG.groom.nickname;
        }

        // Set bride avatar and name
        const brideAvatar = document.getElementById('brideAvatarPreview');
        const brideName = document.getElementById('brideNamePreview');
        if (brideAvatar && ADMIN_CONFIG.bride?.photo) {
            brideAvatar.src = ADMIN_CONFIG.bride.photo;
        }
        if (brideName && ADMIN_CONFIG.bride?.nickname) {
            brideName.textContent = ADMIN_CONFIG.bride.nickname;
        }
    }

    async loadGuestsData() {
        try {
            this.guestsData = await AdminAPI.getGuestsData();
            this.renderGuestsTable();
            this.renderSpecialGuests();
        } catch (error) {
            console.error('Error loading guests data:', error);
            this.guestsData = { invitedGuests: [], specialGuests: [] };
        }
    }

    async saveGuestsData() {
        // Guest data is saved individually via API
        return true;
    }

    async handleAddGuest(e) {
        e.preventDefault();

        const name = document.getElementById('guestName').value;
        const phone = document.getElementById('guestPhone').value;
        const category = document.getElementById('guestCategory').value;
        const inviteCount = parseInt(document.getElementById('guestInviteCount').value) || 1;

        const newGuest = {
            id: Date.now(),
            name,
            phone,
            category,
            inviteCount,
            invitationLink: this.generateInvitationLink(name),
            status: 'draft',
            createdAt: new Date().toISOString()
        };

        try {
            const result = await weddingAPI.addGuest(newGuest, 'invited');
            if (result.success) {
                // Add to local data
                if (!this.guestsData.invitedGuests) {
                    this.guestsData.invitedGuests = [];
                }
                this.guestsData.invitedGuests.unshift(newGuest);
                
                this.showToast('Tamu berhasil ditambahkan!', 'success');
                document.getElementById('guestForm').reset();
                document.getElementById('addGuestForm').classList.add('hidden');
                this.renderGuestsTable();
            } else {
                this.showToast('Gagal menyimpan data tamu: ' + (result.error || ''), 'error');
            }
        } catch (error) {
            console.error('Error adding guest:', error);
            this.showToast('Gagal menyimpan data tamu', 'error');
        }
    }

    generateInvitationLink(name) {
        const baseUrl = ADMIN_CONFIG.invitationBaseUrl;
        const encodedName = encodeURIComponent(name);
        return `${baseUrl}?to=${encodedName}`;
    }

    renderGuestsTable() {
        const tbody = document.getElementById('guestsTableBody');
        const container = document.getElementById('guestsPage');
        if (!tbody || !container) return;

        const guests = this.guestsData?.invitedGuests || [];

        // Check if mobile
        const isMobile = window.innerWidth <= 768;

        if (guests.length === 0) {
            if (isMobile) {
                // Hide table, show empty message in mobile cards area
                const mobileContainer = container.querySelector('.guests-mobile-cards') || this.createMobileCardsContainer(container);
                mobileContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Belum ada tamu. Klik "Tambah Tamu" untuk menambahkan.</p>
                    </div>
                `;
                container.querySelector('.table-container').style.display = 'none';
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                            Belum ada tamu. Klik "Tambah Tamu" untuk menambahkan.
                        </td>
                    </tr>
                `;
                container.querySelector('.table-container').style.display = 'block';
                const mobileContainer = container.querySelector('.guests-mobile-cards');
                if (mobileContainer) mobileContainer.style.display = 'none';
            }
            return;
        }

        if (isMobile) {
            // Mobile: Card Layout
            container.querySelector('.table-container').style.display = 'none';
            const mobileContainer = container.querySelector('.guests-mobile-cards') || this.createMobileCardsContainer(container);
            mobileContainer.style.display = 'grid';

            mobileContainer.innerHTML = guests.map(guest => `
                <div class="guest-card">
                    <div class="guest-card-header">
                        <div class="guest-card-avatar">${this.getInitials(guest.name)}</div>
                        <div class="guest-card-info">
                            <div class="guest-card-name" onclick="admin.showFullName('${this.escapeHtml(guest.name).replace(/'/g, "\\'")}')">
                                ${this.getShortName(guest.name)}
                                ${guest.name.split(' ').length > 2 ? '<i class="fas fa-info-circle"></i>' : ''}
                            </div>
                            <div class="guest-card-meta">
                                <span class="category-badge">${guest.category || '-'}</span>
                                <span class="status-badge ${guest.status}">${this.getStatusLabel(guest.status)}</span>
                            </div>
                        </div>
                    </div>
                    ${guest.phone ? `<div class="guest-card-phone"><i class="fas fa-phone"></i> ${guest.phone}</div>` : ''}
                    <div class="guest-card-actions">
                        <button class="btn-action btn-copy-full" onclick="admin.copyLink('${guest.invitationLink}')">
                            <i class="fas fa-copy"></i> Salin
                        </button>
                        <button class="btn-action btn-wa-full" onclick="admin.shareViaWA('${guest.name}', '${guest.invitationLink}')">
                            <i class="fab fa-whatsapp"></i> WA
                        </button>
                        <button class="btn-action btn-delete-full" onclick="admin.deleteGuest(${guest.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            // Desktop: Table Layout
            container.querySelector('.table-container').style.display = 'block';
            const mobileContainer = container.querySelector('.guests-mobile-cards');
            if (mobileContainer) mobileContainer.style.display = 'none';

            tbody.innerHTML = guests.map(guest => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="activity-avatar" style="width: 36px; height: 36px; font-size: 0.8rem;">
                                ${this.getInitials(guest.name)}
                            </div>
                            <span>${this.escapeHtml(guest.name)}</span>
                        </div>
                    </td>
                    <td><span class="category-badge">${guest.category || '-'}</span></td>
                    <td>${guest.phone || '-'}</td>
                    <td>
                        <div class="link-actions">
                            <button class="btn-copy" onclick="admin.copyLink('${guest.invitationLink}')" title="Salin">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-wa" onclick="admin.shareViaWA('${guest.name}', '${guest.invitationLink}')" title="WA">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                        </div>
                    </td>
                    <td><span class="status-badge ${guest.status}">${this.getStatusLabel(guest.status)}</span></td>
                    <td>
                        <button class="btn-delete" onclick="admin.deleteGuest(${guest.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    createMobileCardsContainer(container) {
        const mobileCards = document.createElement('div');
        mobileCards.className = 'guests-mobile-cards';
        container.querySelector('.table-container').after(mobileCards);
        return mobileCards;
    }

    getShortName(fullName) {
        const parts = fullName.trim().split(' ');
        if (parts.length <= 2) {
            return this.escapeHtml(fullName);
        }
        // First name + middle initial + last initial
        const firstName = parts[0];
        const initials = parts.slice(1).map(p => p[0].toUpperCase() + '.').join(' ');
        return `${this.escapeHtml(firstName)} ${initials}`;
    }

    showFullName(name) {
        this.showToast(`Nama lengkap: ${name}`, 'success');
    }

    getStatusLabel(status) {
        const labels = {
            draft: 'Draft',
            sent: 'Terkirim',
            opened: 'Dibuka'
        };
        return labels[status] || status || '-';
    }

    copyLink(link) {
        // Use formatted invitation message
        const message = ADMIN_CONFIG.invitationMessage.replace('{LINK}', link);
        navigator.clipboard.writeText(message).then(() => {
            this.showToast('Pesan undangan berhasil disalin!', 'success');
        }).catch(() => {
            this.showToast('Gagal menyalin pesan', 'error');
        });
    }

    shareViaWA(name, link) {
        const message = ADMIN_CONFIG.invitationMessage.replace('{LINK}', link);
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');

        // Update status to sent
        const guest = this.guestsData.invitedGuests.find(g => g.invitationLink === link);
        if (guest && guest.status === 'draft') {
            guest.status = 'sent';
            this.renderGuestsTable();
        }
    }

    // Alias for shareViaWA
    shareViaWhatsApp(name, link) {
        this.shareViaWA(name, link);
    }

    async deleteGuest(id) {
        if (!confirm('Hapus tamu ini?')) return;

        try {
            const success = await weddingAPI.deleteGuest(id, 'invited');
            if (success) {
                this.guestsData.invitedGuests = this.guestsData.invitedGuests.filter(g => g.id !== id);
                this.showToast('Tamu berhasil dihapus', 'success');
                this.renderGuestsTable();
            } else {
                this.showToast('Gagal menghapus tamu', 'error');
            }
        } catch (error) {
            console.error('Error deleting guest:', error);
            this.showToast('Gagal menghapus tamu', 'error');
        }
    }

    // ========================================
    // SPECIAL GUESTS MANAGEMENT
    // ========================================
    async handleAddSpecialGuest(e) {
        e.preventDefault();

        const name = document.getElementById('specialName').value;
        const avatar = document.getElementById('specialAvatar').value;
        const instagram = document.getElementById('specialInstagram').value;
        const twitter = document.getElementById('specialTwitter').value;

        const newSpecial = {
            id: Date.now(),
            name,
            avatar,
            instagram,
            twitter,
            invitationLink: this.generateInvitationLink(name),
            createdAt: new Date().toISOString()
        };

        try {
            const result = await weddingAPI.addGuest(newSpecial, 'special');
            if (result.success) {
                // Add to local data
                if (!this.guestsData.specialGuests) {
                    this.guestsData.specialGuests = [];
                }
                this.guestsData.specialGuests.unshift(newSpecial);
                
                this.showToast('Tamu spesial berhasil ditambahkan!', 'success');
                document.getElementById('specialForm').reset();
                document.getElementById('addSpecialForm').classList.add('hidden');
                this.renderSpecialGuests();
            } else {
                this.showToast('Gagal menyimpan data: ' + (result.error || ''), 'error');
            }
        } catch (error) {
            console.error('Error adding special guest:', error);
            this.showToast('Gagal menyimpan data', 'error');
        }
    }

    renderSpecialGuests() {
        const container = document.getElementById('specialGuestsGrid');
        if (!container) return;

        const guests = this.guestsData?.specialGuests || [];

        if (guests.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Belum ada tamu spesial. Klik "Tambah Tamu Spesial" untuk menambahkan.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = guests.map(guest => {
            const invitationLink = guest.invitationLink || this.generateInvitationLink(guest.name);
            return `
            <div class="special-guest-card">
                <img src="${guest.avatar}" alt="${this.escapeHtml(guest.name)}" class="special-guest-avatar" onerror="this.src='https://via.placeholder.com/80'">
                <div class="special-guest-name">${this.escapeHtml(guest.name)}</div>
                <div class="special-guest-info">
                    <small class="text-muted">Photo akan muncul di komentar</small>
                </div>
                <div class="special-guest-socials">
                    ${guest.instagram ? `<a href="https://instagram.com/${guest.instagram.replace('@', '')}" target="_blank" class="social-link" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                    ${guest.twitter ? `<a href="https://twitter.com/${guest.twitter.replace('@', '')}" target="_blank" class="social-link" title="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
                </div>
                <div class="special-guest-link">
                    <input type="text" value="${invitationLink}" readonly class="link-input">
                    <button class="btn-copy" onclick="admin.copyLink('${invitationLink}')" title="Copy Link">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-share" onclick="admin.shareViaWhatsApp('${this.escapeHtml(guest.name)}', '${invitationLink}')" title="Share via WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
                <div class="special-guest-actions">
                    <button class="btn-delete" onclick="admin.deleteSpecialGuest(${guest.id})" title="Hapus">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `}).join('');
    }

    async deleteSpecialGuest(id) {
        if (!confirm('Hapus tamu spesial ini?')) return;

        try {
            const success = await weddingAPI.deleteGuest(id, 'special');
            if (success) {
                this.guestsData.specialGuests = this.guestsData.specialGuests.filter(g => g.id !== id);
                this.showToast('Tamu spesial berhasil dihapus', 'success');
                this.renderSpecialGuests();
            } else {
                this.showToast('Gagal menghapus tamu', 'error');
            }
        } catch (error) {
            console.error('Error deleting special guest:', error);
            this.showToast('Gagal menghapus tamu', 'error');
        }
    }

    // ========================================
    // REPLY AS COUPLE
    // ========================================
    openReplyModal(messageId) {
        const message = (this.data.guests || []).find(g => g.id === messageId);
        if (!message) return;

        // Set original message
        const originalContainer = document.getElementById('originalMessage');
        if (originalContainer) {
            originalContainer.innerHTML = `
                <div class="original-message-header">
                    <div class="original-message-avatar">${this.getInitials(message.name)}</div>
                    <div class="original-message-name">${this.escapeHtml(message.name)}</div>
                </div>
                <div class="original-message-text">${this.escapeHtml(message.message || '-')}</div>
            `;
        }

        // Set target ID
        document.getElementById('replyTargetId').value = messageId;

        // Show modal
        document.getElementById('replyModal')?.classList.remove('hidden');
    }

    closeReplyModal() {
        document.getElementById('replyModal')?.classList.add('hidden');
        document.getElementById('replyForm')?.reset();
    }

    async handleReply(e) {
        e.preventDefault();

        const targetId = parseInt(document.getElementById('replyTargetId').value);
        const role = document.querySelector('input[name="replyRole"]:checked').value;
        const message = document.getElementById('replyMessage').value;

        const replyData = {
            id: Date.now(),
            role,
            name: role === 'groom' ? ADMIN_CONFIG.groom.nickname : ADMIN_CONFIG.bride.nickname,
            photo: role === 'groom' ? ADMIN_CONFIG.groom.photo : ADMIN_CONFIG.bride.photo,
            message,
            timestamp: new Date().toISOString()
        };

        // Find the message and add reply
        const messageIndex = this.data.guests.findIndex(g => g.id === targetId);
        if (messageIndex === -1) {
            this.showToast('Pesan tidak ditemukan', 'error');
            return;
        }

        if (!this.data.guests[messageIndex].replies) {
            this.data.guests[messageIndex].replies = [];
        }

        this.data.guests[messageIndex].replies.push(replyData);

        // Save reply via API
        try {
            const success = await AdminAPI.addReply(targetId, replyData);

            if (success) {
                this.showToast('Balasan berhasil dikirim!', 'success');
                this.closeReplyModal();
                this.loadData();
            } else {
                throw new Error('Failed to save reply');
            }
        } catch (error) {
            console.error('Error saving reply:', error);
            this.showToast('Gagal mengirim balasan', 'error');
        }
    }
}

// Initialize admin panel
const admin = new AdminPanel();

// Call additional initializations after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    admin.initGuestManagement();
    admin.guestsData = { invitedGuests: [], specialGuests: [] };
});
