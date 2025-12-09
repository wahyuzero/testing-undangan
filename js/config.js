// ========================================
// WEDDING INVITATION CONFIGURATION
// Edit data di bawah ini sesuai kebutuhan
// ========================================

const CONFIG = {
    // === JSONBIN CONFIGURATION ===
    // Daftar di https://jsonbin.io dan buat bin baru
    // API Key harus dimulai dengan '$2a$10$' (hanya satu kali, tanpa duplikasi)
    jsonbin: {
        binId: '69377cded0ea881f401be286',
        apiKey: '$2a$10$k1qPlJVKmspLtGZUUo2Y7uke5fWfQI0oyir1WMdB7e0UMU5wtMZHy', // Master Key dari JSONBin
        collectionId: null // Opsional
    },

    // === DATA MEMPELAI PRIA ===
    groom: {
        fullName: 'Kukuh Widiyanto',
        nickname: 'Kukuh',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face',
        fatherName: 'Bapak Suratman',
        motherName: 'Sri Muryani',
        childOrder: 'Putra pertama dari',
        city: 'Surabaya',
        bio: 'Seorang insinyur software yang mencintai kopi dan coding. Percaya bahwa cinta sejati adalah yang tumbuh bersama dalam iman.',
        instagram: 'https://www.instagram.com/kukuhtuyen',
        twitter: '',
        linkedin: ''
    },

    // === DATA MEMPELAI WANITA ===
    bride: {
        fullName: 'Fitriani Desi Pratiwi',
        nickname: 'Fitriani',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop&crop=face',
        fatherName: 'Sahid',
        motherName: 'Sulyati',
        childOrder: 'Putri kedua dari',
        city: 'Malang',
        bio: 'Dokter muda yang passionate tentang kesehatan anak. Meyakini bahwa keluarga harmonis adalah fondasi masyarakat yang sehat.',
        instagram: 'https://www.instagram.com/fitrianidesipratiwi',
        twitter: '',
        linkedin: ''
    },

    // === QUOTE ===
    quote: {
        text: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."',
        source: 'QS. Ar-Rum: 21'
    },

    // === TANGGAL PERNIKAHAN ===
    wedding: {
        date: '2026-01-21', // Format: YYYY-MM-DD
        time: '09:00',
        city: 'Purbalingga',
        timezone: 'WIB'
    },

    // === DETAIL ACARA ===
    events: [
        {
            id: 'akad',
            name: 'Akad Nikah',
            date: '2026-01-21',
            startTime: '09:00',
            endTime: '12:00',
            venue: 'Rumah Mempelai Wanita',
            address: 'Jalan Selaraga, Desa Sirkandi Rt 06/05, Purwareja Klampok, Banjarnegara, Jawa Tengah',
            mapsUrl: 'https://maps.google.com/?q=Masjid+Agung+Surabaya',
            mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.6044!2d112.7378!3d-7.2575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTUnMjcuMCJTIDExMsKwNDQnMTYuMCJF!5e0!3m2!1sen!2sid!4v1234567890',
            dresscode: 'Putih & Sage Green',
            icon: 'fa-ring'
        },
        {
            id: 'resepsi',
            name: 'Resepsi',
            date: '2026-01-19',
            startTime: '12:00',
            endTime: '15:00',
            venue: 'Rumah Mempelai Pria',
            address: 'RT. 02 RW. 05 Kel. Penambongan Kec. Purbalingga Kab. Purbalingga',
            mapsUrl: 'https://maps.google.com/?q=Hotel+Majapahit+Surabaya',
            mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.6044!2d112.7378!3d-7.2575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTUnMjcuMCJTIDExMsKwNDQnMTYuMCJF!5e0!3m2!1sen!2sid!4v1234567890',
            dresscode: 'Formal - Earth Tone',
            icon: 'fa-champagne-glasses'
        }
    ],

    // === KISAH CINTA ===
    loveStory: [
        {
            phase: 'Pertemuan',
            date: 'Juni 2020',
            title: 'First Meet',
            story: 'Kami bertemu di sebuah konferensi teknologi kesehatan di Jakarta. Ahmad sebagai pembicara dan Aisyah sebagai peserta. Sebuah pertanyaan tentang AI dalam diagnosa medis menjadi awal percakapan kami.',
            photo: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop'
        },
        {
            phase: 'Pendekatan',
            date: 'Agustus 2020',
            title: 'Getting Closer',
            story: 'Setelah bertukar kontak, kami mulai sering berdiskusi tentang berbagai hal. Dari project kolaborasi hingga mimpi-mimpi masa depan. Pesan-pesan panjang menjadi rutinitas setiap malam.',
            photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop'
        },
        {
            phase: 'Lamaran',
            date: 'Desember 2024',
            title: 'The Proposal',
            story: 'Di puncak Gunung Bromo saat sunrise, Ahmad berlutut dan mengucapkan kata-kata yang selama ini dinanti. Dengan mata berkaca-kaca, Aisyah menjawab "Ya" dengan penuh keyakinan.',
            photo: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=400&fit=crop'
        },
        {
            phase: 'Pernikahan',
            date: 'Februari 2025',
            title: 'Our Wedding',
            story: 'Hari yang kami nanti-nantikan akhirnya tiba. Bersatu dalam ikatan suci yang diberkahi Allah SWT, memulai perjalanan baru sebagai satu keluarga.',
            photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop'
        }
    ],

    // === GALLERY ===
    gallery: {
        prewedding: [
            { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop', caption: 'Prewedding - Beach' },
            { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', caption: 'Prewedding - Garden' },
            { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', caption: 'Prewedding - Sunset' },
            { src: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&h=600&fit=crop', caption: 'Prewedding - Studio' }
        ],
        engagement: [
            { src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=600&fit=crop', caption: 'Engagement Day' },
            { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop', caption: 'Ring Exchange' },
            { src: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&h=600&fit=crop', caption: 'Family Celebration' }
        ],
        family: [
            { src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop', caption: 'Family Portrait' },
            { src: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800&h=600&fit=crop', caption: 'Parents Meeting' }
        ]
    },

    // === AMPLOP DIGITAL ===
    giftAccounts: [
        {
            bank: 'Bank Syariah Indonesia (BSI)',
            accountNumber: '1112182805',
            accountName: 'Fitriani Desi P',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bank_Syariah_Indonesia.svg/2560px-Bank_Syariah_Indonesia.svg.png'
        },
        {
            bank: 'Bank Central Asia (BCA)',
            accountNumber: '0661694121',
            accountName: 'Fitriani Desi P',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/2560px-Bank_Central_Asia.svg.png'
        },
        {
            bank: 'Bank Rakyat Indonesia (BRI)',
            accountNumber: '372601002694507',
            accountName: 'Kukuh Widiyanto',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/2560px-Bank_Central_Asia.svg.png'
        }
    ],
    qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126670016COM.NOBUBANK.WWW01189360010300000898240214NMID0001234567030300040520415204541253033605802ID5913AHMAD%20FAUZI6007JAKARTA61051234062070703A0163049E4F',

    // === PROTOKOL ACARA ===
    protocol: {
        rules: [
            'Tamu diharapkan hadir tepat waktu sesuai jadwal',
            'Menggunakan dresscode yang telah ditentukan',
            'Tidak membawa anak di bawah 5 tahun ke acara resepsi',
            'Menjaga protokol kesehatan',
            'Dilarang merokok di area indoor'
        ],
        arrivalTime: 'Harap hadir 30 menit sebelum acara dimulai',
        parking: 'Parkir tersedia di basement Hotel Majapahit (valet parking available)',
        contactPersons: [
            { name: 'Rizki (WO)', phone: '081234567890' },
            { name: 'Dian (Family)', phone: '089876543210' }
        ]
    },

    // === PENUTUP ===
    closing: {
        message: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.',
        signature: 'Dengan penuh cinta,',
        vendorLogo: '', // URL logo WO/vendor (opsional)
        vendorName: 'Organized by Wedding Organizer XYZ'
    },

    // === MUSIK ===
    music: {
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Ganti dengan URL musik Anda
        autoplay: true
    },

    // === TAMU KHUSUS DENGAN FOTO ===
    // Tamu dengan nama tertentu bisa punya foto profil custom
    specialGuests: {
        'Budi Santoso': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        'Siti Aminah': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
