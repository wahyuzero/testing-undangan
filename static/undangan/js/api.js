// ========================================
// WEDDING API CLIENT
// Frontend API client (replaces JSONBin)
// ========================================

class WeddingAPI {
    constructor() {
        // Determine tenant based on URL path
        this.tenant = window.location.pathname.startsWith('/undangan') ? 'bride' : 'groom';
        this.baseUrl = '/api';
        this.token = sessionStorage.getItem(`${this.tenant}_auth_token`);
    }

    // ========================================
    // HTTP HELPERS
    // ========================================
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${this.tenant}/${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // ========================================
    // MESSAGES (RSVP)
    // ========================================
    async getData() {
        try {
            const data = await this.request('messages');
            return { guests: data.guests || [] };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { guests: [] };
        }
    }

    async getMessages() {
        try {
            const data = await this.getData();
            return data.guests || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async saveData(formData) {
        try {
            console.log('📤 Saving data...');
            const result = await this.request('messages', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            console.log('✅ Save successful:', result);
            return { success: true, data: result.data };
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return { success: false, error: error.message };
        }
    }

    async checkSpam(guestName) {
        // Anti-spam is handled server-side
        // Just return false for now, server will reject if spam
        return false;
    }

    async addReaction(messageId, type = 'love') {
        try {
            const result = await this.request(`messages/${messageId}/reaction`, {
                method: 'POST',
                body: JSON.stringify({ type }),
            });
            return result.success;
        } catch (error) {
            console.error('Error adding reaction:', error);
            return false;
        }
    }

    async addReply(messageId, replyData) {
        try {
            const result = await this.request(`messages/${messageId}/reply`, {
                method: 'POST',
                body: JSON.stringify(replyData),
            });
            return result.success;
        } catch (error) {
            console.error('Error adding reply:', error);
            return false;
        }
    }

    async deleteMessage(messageId) {
        try {
            const result = await this.request(`messages/${messageId}`, {
                method: 'DELETE',
            });
            return result.success;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    // ========================================
    // AUTHENTICATION
    // ========================================
    async login(password) {
        try {
            const result = await this.request('auth/login', {
                method: 'POST',
                body: JSON.stringify({ password }),
            });

            if (result.token) {
                this.token = result.token;
                sessionStorage.setItem(`${this.tenant}_auth_token`, result.token);
            }

            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        this.token = null;
        sessionStorage.removeItem(`${this.tenant}_auth_token`);
        await this.request('auth/logout', { method: 'POST' }).catch(() => {});
        return { success: true };
    }

    async checkAuth() {
        try {
            const result = await this.request('auth/check');
            return result.authenticated;
        } catch {
            return false;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const result = await this.request('auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // GUESTS
    // ========================================
    async getGuestsData() {
        try {
            const [invited, special] = await Promise.all([
                this.request('guests?type=invited'),
                this.request('guests?type=special'),
            ]);
            return {
                invitedGuests: invited.invitedGuests || [],
                specialGuests: special.specialGuests || [],
            };
        } catch (error) {
            console.error('Error fetching guests:', error);
            return { invitedGuests: [], specialGuests: [] };
        }
    }

    async addGuest(guestData, type = 'invited') {
        try {
            const result = await this.request(`guests?type=${type}`, {
                method: 'POST',
                body: JSON.stringify(guestData),
            });
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateGuest(guestId, guestData, type = 'invited') {
        try {
            const result = await this.request(`guests/${guestId}?type=${type}`, {
                method: 'PUT',
                body: JSON.stringify(guestData),
            });
            return { success: true, data: result.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteGuest(guestId, type = 'invited') {
        try {
            const result = await this.request(`guests/${guestId}?type=${type}`, {
                method: 'DELETE',
            });
            return result.success;
        } catch (error) {
            return false;
        }
    }

    async saveGuestsData(data) {
        // Note: Bulk save not supported, use individual methods
        console.warn('Bulk save not supported. Use addGuest/updateGuest/deleteGuest instead.');
        return false;
    }
}

// Create global instance (replaces jsonBinAPI)
const weddingAPI = new WeddingAPI();

// Backward compatibility alias
const jsonBinAPI = weddingAPI;
