document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('novelGrid');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // --- 1. LOGIK TUKAR TEMA (DARK/LIGHT) ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (themeIcon) themeIcon.innerText = isLight ? '☀️' : '🌙';
        });
    }

    // Kekalkan tema pilihan pengguna
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    }

    // --- 2. AMBIL DATA DARI FIRESTORE ---
    async function fetchNovels() {
        if (!grid) return;
        
        // Animasi loading sementara
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="opacity-50 tracking-widest text-xs uppercase">Menyambung ke Story Verse...</p>
            </div>
        `;

        try {
            // Mengambil data dan susun mengikut waktu dicipta (CreatedAt) jika ada
            const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
            
            if (snapshot.empty) {
                grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Tiada novel ditemui di dalam pangkalan data.</p>';
                return;
            }

            grid.innerHTML = ''; 

            snapshot.forEach(doc => {
                const data = doc.data();
                // Template kad novel yang lebih kemas
                const card = `
                    <div class="novel-card group cursor-pointer">
                        <div class="card-image-wrapper shadow-xl shadow-black/50">
                            <img src="${data.image || 'https://via.placeholder.com/300x450'}" 
                                 class="card-img" 
                                 alt="${data.title}"
                                 onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
                            <div class="card-badge">${data.tag || 'New'}</div>
                        </div>
                        <div class="mt-4 px-1">
                            <h3 class="font-bold text-lg group-hover:text-purple-500 transition duration-300 uppercase tracking-tight leading-tight">
                                ${data.title || 'Untitled'}
                            </h3>
                            <p class="text-xs text-gray-500 italic mt-1">${data.genre || 'General'}</p>
                        </div>
                    </div>
                `;
                grid.innerHTML += card;
            });
        } catch (error) {
            console.error("Firebase Error:", error);
            grid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-red-500 font-bold">Ralat Pangkalan Data</p>
                    <p class="text-xs text-gray-600 mt-2">Sila pastikan Firestore Rules anda diset kepada 'public' atau 'test mode'.</p>
                </div>
            `;
        }
    }

    fetchNovels();
});

// --- LOGIK AUTHENTICATION ---
const authBtn = document.getElementById('authBtn');

// Pantau status pengguna (Login atau tidak)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Pengguna sudah login
        authBtn.innerText = "Log Keluar";
        authBtn.onclick = () => firebase.auth().signOut();
    } else {
        // Pengguna belum login
        authBtn.innerText = "Log Masuk";
        authBtn.onclick = () => window.location.href = 'auth.html';
    }
});

// Fungsi untuk semak akses sebelum baca (Panggil fungsi ini bila klik novel)
function checkAccess(novelId) {
    const user = firebase.auth().currentUser;
    if (user) {
        alert("Membuka novel..."); // Nanti kita tukar ke page bacaan
    } else {
        alert("Sila log masuk dahulu untuk membaca!");
        window.location.href = 'auth.html';
    }
}

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderCircle = document.querySelector('.loader-circle');
    const loaderText = document.querySelector('.loader-text');
    const svgText = document.querySelector('.loader-text text');

    // 1. Berhenti pusing & letupkan bulatan selepas 1.5 saat
    setTimeout(() => {
        loaderCircle.classList.add('break'); // Bulatan membesar & hilang
        
        // 2. Tepat masa dia putus, munculkan tulisan
        setTimeout(() => {
            loaderText.classList.add('show');
            // Mula animasi menulis stroke
            svgText.style.animation = 'writeText 2s ease-in-out forwards';
            
            // 3. Selepas selesai menulis, masuk ke website
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 2800); // Masa untuk orang tengok tulisan tu sekejap

        }, 400); // Delay kecil selepas bulatan pecah
    }, 1500);
});
