// --- 1. PRELOADER & INITIAL THEME LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const circle = document.querySelector('.loader-circle');
    const text = document.querySelector('.loader-text');
    const svg = document.querySelector('.loader-text text');
    
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIconLucide'); // Kita kekalkan ID ini supaya tak perlu tukar HTML

    // Set tema segera sebelum preloader mula
    if (savedTheme === 'light') {
        if (preloader) preloader.style.background = '#fdfbf7'; 
        document.body.classList.add('light-mode');
        // Tukar ikon kepada matahari (Font Awesome class)
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    }

    if (!preloader) {
        if (typeof fetchNovels === 'function') fetchNovels();
        return;
    }

          // TIMING: Bulatan (1.5s) + Menulis (3.5s) + Extra (0.3s) = 5.3s
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('lift-up'); // Jalankan rollup
                
                if (typeof fetchNovels === 'function') fetchNovels();
                
                // Tunggu rollup 1.5s selesai baru buang terus dari DOM
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1500);
            }
        }, 5300); 
    });

// --- 2. THEME TOGGLE LOGIC (FONT AWESOME VERSION) ---
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIconLucide');

themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    // Tukar ikon menggunakan className (Font Awesome)
    if (isLight) {
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return;

    try {
        // Ambil 10 novel terbaru
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').limit(10).get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center opacity-50 uppercase tracking-widest text-xs py-20">Tiada Novel Dijumpai</p>';
            return;
        }

        grid.innerHTML = ''; 
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // --- LOGIK PEMILIHAN GAMBAR (PENTING) ---
            // Kita semak semua kemungkinan nama field yang mungkin anda guna di database
            const finalCover = data.coverImage || data.cover || data.image || 'https://via.placeholder.com/300x450?text=No+Cover';

            grid.innerHTML += `
                <div class="novel-card group cursor-pointer" onclick="checkAccess('${doc.id}')">
                    <div class="card-image-wrapper shadow-xl relative overflow-hidden rounded-2xl aspect-[3/4] bg-[#1a1a1a]">
                        <img src="${finalCover}" 
                             class="card-img w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                             alt="${data.title}" 
                             onerror="this.src='https://via.placeholder.com/300x450?text=StoryVerse'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                             <span class="text-[10px] font-bold uppercase tracking-widest text-white bg-purple-600 px-2 py-1 rounded">Baca Sekarang</span>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3 class="font-bold text-sm md:text-base group-hover:text-purple-500 transition truncate uppercase italic tracking-tighter">${data.title}</h3>
                        <p class="text-[10px] text-gray-500 italic font-medium uppercase tracking-widest">${data.genre || 'Novel'}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Firestore Error:", error);
        grid.innerHTML = '<p class="text-center text-red-500 text-xs">Ralat memuatkan data. Sila refresh.</p>';
    }
}

// --- 4. FIREBASE AUTH & ACCESS ---
function checkAccess(id) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Hantar ke halaman detail novel tersebut
        window.location.href = `detail.html?id=${id}`;
    } else {
        alert("Sila Log Masuk untuk mula membaca!");
        window.location.href = 'auth.html';
    }
}

// Letakkan ini di bahagian paling bawah script.js
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            if (user) {
                // Jika user dah login
                authBtn.innerText = "Log Keluar";
                authBtn.onclick = () => {
                    firebase.auth().signOut().then(() => window.location.reload());
                };
            } else {
                // Jika user belum login
                authBtn.innerText = "Log Masuk";
                authBtn.onclick = () => {
                    window.location.href = 'auth.html'; // Pastikan fail auth.html wujud
                };
            }
        }
    });
}

// Pantau status log masuk untuk butang nav
firebase.auth().onAuthStateChanged((user) => {
    const authBtn = document.getElementById('authBtn');
    const profileLink = document.querySelector('a[title="Profile"]');

    if (user) {
        // Jika sudah login
        if (authBtn) authBtn.innerText = "Keluar";
        if (profileLink) profileLink.href = "profile.html";
    } else {
        // Jika belum login
        if (authBtn) authBtn.innerText = "Log Masuk";
        if (profileLink) profileLink.href = "auth.html";
    }
});

// Fungsi untuk butang Log Masuk / Keluar
function handleAuthAction() {
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.auth().signOut().then(() => {
            window.location.reload();
        });
    } else {
        window.location.href = "auth.html";
    }
}
