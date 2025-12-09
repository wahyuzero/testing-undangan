# 💍 Wedding Invitation Website

Website undangan pernikahan elegan dengan animasi menarik, RSVP terintegrasi, dan berbagai fitur interaktif.

## ✨ Fitur

- **Opening Cover** - Animasi entrance, countdown timer, musik otomatis
- **Personalized Greeting** - Nama tamu dari URL (?to=NamaTamu)
- **Profil Mempelai** - Foto, bio, social media, quote pilihan
- **Kisah Cinta** - Timeline interaktif dengan scroll animation
- **Multi Acara** - Akad, Resepsi, Ngunduh Mantu, After Party
- **Lokasi Pintar** - Google Maps embed, share WhatsApp
- **RSVP & Buku Tamu** - Form dengan validasi, simpan ke JSONBin
- **Live Message Wall** - Ucapan tamu real-time
- **Gallery** - Kategori dengan filter, lightbox
- **Amplop Digital** - Multi rekening, QRIS, copy button
- **Tema Siang/Malam** - Toggle dengan localStorage
- **Responsive** - Tampilan optimal di semua device

## 🚀 Cara Menggunakan

### 1. Setup JSONBin

1. Daftar di [jsonbin.io](https://jsonbin.io)
2. Buat Bin baru dengan isi awal:
   ```json
   { "guests": [] }
   ```
3. Salin **Bin ID** dan **Master Key**
4. Edit file `js/config.js`:
   ```javascript
   jsonbin: {
     binId: 'YOUR_BIN_ID_HERE',
     apiKey: '$2a$10$YOUR_API_KEY_HERE',
   }
   ```

### 2. Kustomisasi Data

Edit file `js/config.js` untuk mengubah:

- **Data Mempelai** - Nama, foto, bio, orang tua, social media
- **Tanggal Pernikahan** - Tanggal & waktu countdown
- **Detail Acara** - Akad, resepsi, dll dengan lokasi & dresscode
- **Kisah Cinta** - 4 fase cerita dengan foto
- **Gallery** - URL foto prewedding, engagement, keluarga
- **Rekening** - Nomor rekening & QRIS
- **Protokol** - Aturan, parkir, contact person

### 3. Personalisasi Tamu

Gunakan URL parameter untuk nama tamu:
```
https://yoursite.com/?to=Budi%20Santoso
```

Untuk tamu dengan foto khusus, tambahkan di `config.js`:
```javascript
specialGuests: {
  'Budi Santoso': 'https://url-foto.jpg'
}
```

### 4. Deploy

Upload semua file ke hosting:
- GitHub Pages
- Netlify
- Vercel
- Hosting lainnya

## 📁 Struktur File

```
├── index.html          # Halaman utama
├── css/
│   └── styles.css      # Semua styling
├── js/
│   ├── config.js       # Konfigurasi data
│   ├── app.js          # Logika aplikasi
│   └── jsonbin.js      # API JSONBin
└── assets/
    ├── images/         # Foto-foto
    ├── music/          # Musik background
    └── icons/          # Icon custom
```

## 🎨 Teknologi

- HTML5, CSS3, JavaScript (Vanilla)
- Tailwind CSS (CDN)
- Font Awesome Icons
- AOS (Animate on Scroll)
- Google Fonts
- JSONBin API

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📝 License

MIT License - Bebas digunakan untuk keperluan pribadi.

---

Made with ❤️ for your special day
