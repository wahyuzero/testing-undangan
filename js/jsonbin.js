// ========================================
// JSONBIN API INTEGRATION
// ========================================

class JSONBinAPI {
    constructor() {
        this.binId = CONFIG.jsonbin.binId;
        this.apiKey = CONFIG.jsonbin.apiKey;
        this.baseUrl = 'https://api.jsonbin.io/v3';
    }

    // Headers untuk request
    getHeaders(forWrite = false) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
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
            // Ambil data existing
            const existingData = await this.getData();

            // Tambahkan guest baru
            if (!existingData.guests) {
                existingData.guests = [];
            }

            // Tambahkan timestamp dan ID
            newData.id = Date.now();
            newData.timestamp = new Date().toISOString();

            existingData.guests.unshift(newData); // Tambah di awal array

            // Update bin
            const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(existingData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('JSONBin Save Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { success: true, data: newData };
        } catch (error) {
            console.error('Error saving data:', error);
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
