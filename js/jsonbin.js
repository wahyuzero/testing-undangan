// ========================================
// JSONBIN API INTEGRATION
// ========================================

class JSONBinAPI {
    constructor() {
        this.binId = CONFIG.jsonbin.binId;
        this.accessKey = CONFIG.jsonbin.accessKey;
        this.baseUrl = 'https://api.jsonbin.io/v3';
    }

    // Headers untuk request
    getHeaders(forWrite = false) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Access-Key': this.accessKey
        };
        return headers;
    }

    // Ambil semua data dari bin
    async getData() {
        try {
            const response = await fetch(`${this.baseUrl}/b/${this.binId}/latest`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('JSONBin Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.record || { guests: [] };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { guests: [] };
        }
    }

    // Simpan data baru ke bin
    async saveData(newData) {
        try {
            console.log('📤 Saving data to JSONBin...');
            console.log('New data:', newData);

            // Ambil data existing
            const existingData = await this.getData();
            console.log('Existing data:', existingData);

            // Tambahkan guest baru
            if (!existingData.guests) {
                existingData.guests = [];
            }

            // Tambahkan timestamp dan ID
            newData.id = Date.now();
            newData.timestamp = new Date().toISOString();

            existingData.guests.unshift(newData); // Tambah di awal array

            console.log('Data to save:', existingData);

            // Update bin
            const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(existingData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ JSONBin Save Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Save successful:', result);

            return { success: true, data: newData };
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return { success: false, error: error.message };
        }
    }

    // Validasi anti-spam (cek duplikat dalam 1 menit)
    async checkSpam(guestName) {
        try {
            const data = await this.getData();
            if (!data.guests || data.guests.length === 0) return false;

            const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

            const recentSubmission = data.guests.find(guest =>
                guest.name && guest.name.toLowerCase() === guestName.toLowerCase() &&
                guest.timestamp > oneMinuteAgo
            );

            return !!recentSubmission;
        } catch (error) {
            console.error('Error checking spam:', error);
            return false;
        }
    }

    // Tambah like/reaction
    async addReaction(messageId, type = 'love') {
        try {
            const data = await this.getData();
            if (!data.guests) return false;

            const guestIndex = data.guests.findIndex(g => g.id === messageId);
            if (guestIndex === -1) return false;

            // Initialize reactions if not exists
            if (!data.guests[guestIndex].reactions) {
                data.guests[guestIndex].reactions = {};
            }

            // Initialize specific reaction type
            if (!data.guests[guestIndex].reactions[type]) {
                data.guests[guestIndex].reactions[type] = 0;
            }

            data.guests[guestIndex].reactions[type]++;

            // Update bin
            const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Error adding reaction:', error);
            return false;
        }
    }

    // Tambah reply
    async addReply(messageId, replyData) {
        try {
            const data = await this.getData();
            if (!data.guests) return false;

            const guestIndex = data.guests.findIndex(g => g.id === messageId);
            if (guestIndex === -1) return false;

            // Initialize replies if not exists
            if (!data.guests[guestIndex].replies) data.guests[guestIndex].replies = [];

            data.guests[guestIndex].replies.push({
                ...replyData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });

            // Update bin
            const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Error adding reply:', error);
            return false;
        }
    }

    // Ambil semua guest messages untuk live wall
    async getMessages() {
        try {
            const data = await this.getData();
            return data.guests || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }
}

// Initialize API instance
const jsonBinAPI = new JSONBinAPI();
