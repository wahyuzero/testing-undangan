// ========================================
// WEDDING INVITATION CONFIGURATION
// Edit data di bawah ini sesuai kebutuhan
// ========================================

const CONFIG = {
    // === JSONBIN CONFIGURATION ===
    // Daftar di https://jsonbin.io dan buat bin baru
    // Gunakan Access Key (bukan Master Key) untuk keamanan frontend
    // Buat Access Key di: https://jsonbin.io/access-keys dengan permission Read + Update Bins
    jsonbin: {
        binId: '693e214b43b1c97be9ecb25e',
        accessKey: '$2a$10$vhb4wS1kT46UDn1caaOt0eukxI/Or4f7wPEBub813DsfmDImNQMuK' // Ganti dengan Access Key Anda
    },

    // === JSONBIN UNTUK DATA TAMU (Buat bin baru untuk ini) ===
    // Struktur: { "invitedGuests": [], "specialGuests": [] }
    jsonbinGuests: {
        binId: 'YOUR_GUESTS_BIN_ID', // Ganti dengan Bin ID baru
        accessKey: '$2a$10$vhb4wS1kT46UDn1caaOt0eukxI/Or4f7wPEBub813DsfmDImNQMuK' // Bisa sama dengan accessKey di atas
    },

    // === DATA MEMPELAI PRIA ===
    groom: {
        fullName: 'Kukuh Widiyanto',
        nickname: 'Kukuh',
        photo: '/assets/images/groom.png',
        fatherName: 'Bapak Suratman',
        motherName: 'Ibu Sri Muryani',
        childOrder: 'Putra pertama dari',
        city: 'Purbalingga',
        bio: '',
        instagram: 'https://www.instagram.com/kukuhtuyen',
        twitter: '',
        linkedin: ''
    },

    // === DATA MEMPELAI WANITA ===
    bride: {
        fullName: 'Fitriani Desi Pratiwi',
        nickname: 'Fitriani',
        photo: '/assets/images/bride.png',
        fatherName: 'Bapak Sahid',
        motherName: 'Ibu Sulyati',
        childOrder: 'Putri kedua dari',
        city: 'Banjarnegara',
        bio: '',
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
            id: 'tasyakur2',
            name: 'Tasyakuran',
            date: '2026-01-19',
            endDate: '2026-01-20',
            startTime: '12:00',
            endTime: '15:00',
            venue: 'Rumah Mempelai Wanita',
            address: 'Jalan Selaraga, Desa Sirkandi Rt 06/05, Purwareja Klampok, Banjarnegara, Jawa Tengah',
            mapsUrl: 'https://maps.app.goo.gl/ird8wX5NoLY2TtYz5',
            mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3955.4845707929767!2d109.45063599999999!3d-7.522005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zN8KwMzEnMTkuMiJTIDEwOcKwMjcnMDIuMyJF!5e0!3m2!1sid!2sid!4v1765289411373!5m2!1sid!2sid',
            dresscode: 'Formal - Earth Tone',
            icon: 'fa-champagne-glasses'
        },
        {
            id: 'tasyakur1',
            name: 'Tasyakuran',
            date: '2026-01-17',
            endDate: '2026-01-18',
            startTime: '12:00',
            endTime: '15:00',
            venue: 'Rumah Mempelai Pria',
            address: 'RT. 02 RW. 05 Kel. Penambongan Kec. Purbalingga Kab. Purbalingga',
            mapsUrl: 'https://maps.app.goo.gl/ohxNSJ1d75EXFrNH7',
            mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d247.28707365419965!2d109.3693694!3d-7.3993971!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6559d058a8f13b%3A0x19695c3a79517a49!2sJ929%2B7PX%2C%20Penambongan%2C%20Kec.%20Purbalingga%2C%20Kabupaten%20Purbalingga%2C%20Jawa%20Tengah%2053314!5e0!3m2!1sid!2sid!4v1765678527796!5m2!1sid!2sid',
            dresscode: 'Formal - Earth Tone',
            icon: 'fa-champagne-glasses'
        },
        {
            id: 'akad',
            name: 'Akad Nikah dan Resepsi',
            date: '2026-01-21',
            startTime: '09:00',
            endTime: '12:00',
            venue: 'Rumah Mempelai Wanita',
            address: 'Jalan Selaraga, Desa Sirkandi Rt 06/05, Purwareja Klampok, Banjarnegara, Jawa Tengah',
            mapsUrl: 'https://maps.app.goo.gl/ird8wX5NoLY2TtYz5',
            mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3955.4845707929767!2d109.45063599999999!3d-7.522005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zN8KwMzEnMTkuMiJTIDEwOcKwMjcnMDIuMyJF!5e0!3m2!1sid!2sid!4v1765289411373!5m2!1sid!2sid',
            dresscode: 'Putih & Sage Green',
            icon: 'fa-ring'
        },
        // {
        //     id: 'resepsi',
        //     name: 'Resepsi',
        //     date: '2026-01-18',
        //     endDate: '2026-01-19',
        //     startTime: '12:00',
        //     endTime: '15:00',
        //     venue: 'Rumah Mempelai Pria',
        //     address: 'RT. 02 RW. 05 Kel. Penambongan Kec. Purbalingga Kab. Purbalingga',
        //     mapsUrl: 'https://maps.app.goo.gl/ohxNSJ1d75EXFrNH7',
        //     mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d247.28707365419965!2d109.3693694!3d-7.3993971!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6559d058a8f13b%3A0x19695c3a79517a49!2sJ929%2B7PX%2C%20Penambongan%2C%20Kec.%20Purbalingga%2C%20Kabupaten%20Purbalingga%2C%20Jawa%20Tengah%2053314!5e0!3m2!1sid!2sid!4v1765678527796!5m2!1sid!2sid',
        //     dresscode: 'Formal - Earth Tone',
        //     icon: 'fa-champagne-glasses'
        // }
    ],


    // === DOA & HARAPAN ===
    prayers: [
        {
            category: 'Doa Pernikahan',
            title: 'Doa Kelancaran Pernikahan',
            content: 'وَأَلَّفَ بَيْنَ قُلُوبِهِمْ لَوْ أَنْفَقْتَ مَا فِي الْأَرْضِ جَمِيعًا مَا أَلَّفْتَ بَيْنَ قُلُوبِهِمْ وَلَٰكِنَّ اللَّهَ أَلَّفَ بَيْنَهُمْ',
            translation: 'Dan Dia mempersatukan hati mereka. Sekiranya kamu menghabiskan semua yang (ada) di bumi, niscaya kamu tidak dapat mempersatukan hati mereka, akan tetapi Allah telah mempersatukan mereka. (QS. Al-Anfal: 63)',
            icon: 'fa-hands-praying'
        },
        {
            category: 'Doa Pernikahan',
            title: 'Doa Keluarga Sakinah',
            content: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
            translation: 'Wahai Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan yang menjadi penyejuk hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa. (QS. Al-Furqan: 74)',
            icon: 'fa-heart'
        },
        {
            category: 'Harapan',
            title: 'Membangun Rumah Tangga',
            content: 'Semoga Allah SWT senantiasa melimpahkan rahmat dan berkah-Nya atas pernikahan kami, sehingga kami dapat membangun rumah tangga yang sakinah, mawaddah, warahmah.',
            translation: '',
            icon: 'fa-home'
        },
        {
            category: 'Harapan',
            title: 'Keberkahan dan Kesejahteraan',
            content: 'Semoga pernikahan ini membawa keberkahan dalam kehidupan dunia dan akhirat, serta menjadi awal dari perjalanan penuh cinta, kebahagiaan, dan kesejahteraan bersama.',
            translation: '',
            icon: 'fa-dove'
        },
        {
            category: 'Ucapan Terima Kasih',
            title: 'Untuk Orang Tua',
            content: 'Terima kasih kami ucapkan kepada kedua orang tua yang telah mendidik kami dengan penuh kasih sayang, serta merestui pernikahan kami. Doa kalian adalah bekal terberharga dalam perjalanan kami.',
            translation: '',
            icon: 'fa-hands-helping'
        },
        {
            category: 'Ucapan Terima Kasih',
            title: 'Untuk Para Sahabat',
            content: 'Terima kasih untuk sahabat-sahabat yang telah mendukung perjalanan cinta kami, dari awal pertemuan hingga saat ini. Kehadiran kalian adalah anugerah yang tak ternilai.',
            translation: '',
            icon: 'fa-users'
        }
    ],

    // === KISAH CINTA (COMMENTED) ===
    /*
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
    */

    // === GALLERY ===
    gallery: {
        prewedding: [
            { src: '/assets/images/1.jpeg', caption: 'Prewedding' },
            { src: '/assets/images/2.jpeg', caption: 'Prewedding' },
        ],
        engagement: [
            { src: '/assets/images/foto9.jpg', caption: 'Engagement' },
            { src: '/assets/images/foto10.jpg', caption: 'Engagement' },
            { src: '/assets/images/foto11.jpg', caption: 'Engagement' },
            // { src: '/assets/images/foto12.jpg', caption: 'Engagement' },
            // { src: '/assets/images/foto13.jpg', caption: 'Engagement' },
            // { src: '/assets/images/foto14.jpg', caption: 'Engagement' },
            { src: '/assets/images/foto15.jpg', caption: 'Engagement' },
            { src: '/assets/images/16.jpeg', caption: 'Engagement' },
            { src: '/assets/images/17.jpeg', caption: 'Engagement' },
            { src: '/assets/images/foto1.jpg', caption: 'Ring Exchange' },
            { src: '/assets/images/foto2.jpg', caption: 'Family Celebration' },
            { src: '/assets/images/foto3.jpg', caption: 'Family Celebration' },
            { src: '/assets/images/foto4.jpg', caption: 'Family Celebration' }
        ],
        family: [
            { src: '/assets/images/foto5.jpg', caption: 'Family Portrait' },
            { src: '/assets/images/foto6.jpg', caption: 'Parents Meeting' },
            { src: '/assets/images/foto7.jpg', caption: 'Parents Meeting' },
            { src: '/assets/images/foto8.jpg', caption: 'Parents Meeting' }
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
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/BRI_2025.svg/2560px-BRI_2025.svg.png'
        },
        {
            bank: 'Bank Jateng',
            accountNumber: '2027254490',
            accountName: 'Kukuh Widiyanto',
            logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/c/c4/Bank_Jateng_logo.svg/2560px-Bank_Jateng_logo.svg.png'
        }
    ],
    // qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126670016COM.NOBUBANK.WWW01189360010300000898240214NMID0001234567030300040520415204541253033605802ID5913AHMAD%20FAUZI6007JAKARTA61051234062070703A0163049E4F',
    qrisImage: '',

    // === ALAMAT HADIAH PERNIKAHAN ===
    giftAddress: {
        enabled: true,
        recipientName: 'Kukuh Widiyanto',
        address: 'RT. 02 RW. 05, Kel. Penambongan, Kec. Purbalingga',
        city: 'Kab. Purbalingga',
        province: 'Jawa Tengah',
        postalCode: '53319',
        phone: '085877116616', // Ganti dengan nomor asli
        notes: 'Mohon konfirmasi via WhatsApp sebelum mengirim hadiah fisik'
    },

    // === PROTOKOL ACARA ===
    protocol: {
        rules: [
            'Tamu diharapkan hadir sesuai jadwal',
            // 'Menggunakan dresscode yang telah ditentukan',
            // 'Tidak membawa anak di bawah 5 tahun ke acara resepsi',
            'Menjaga protokol keselamatan',
            'Dilarang merokok di area indoor'
        ],
        arrivalTime: 'Diharapkan bisa hadir sebelum acara dimulai',
        parking: 'Parkir secara rapi di tempat yang sudah disediakan',
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
        vendorName: 'Frugaldev'
    },

    // === MUSIK ===
    music: {
        src: '/assets/music/music.mp3', // Ganti dengan URL musik Anda
        autoplay: true
    },

    // === BACKGROUNDS ===
    backgrounds: {
        // Placeholder images from Unsplash
        couple: '/assets/images/main.webp',
        closing: '/assets/images/footer.webp'
    },

    // === TAMU KHUSUS DENGAN FOTO ===
    // Tamu dengan nama tertentu bisa punya foto profil custom
    specialGuests: {
        'Wahyu Febri Tamtomo': 'https://frugaldev.biz.id/img/profile.jpg',
        'Siti Aminah': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
