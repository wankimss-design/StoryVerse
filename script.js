/* ================================================================
   STORY VERSE - MAIN JAVASCRIPT
================================================================
*/

// --- 1. LOGIK PRELOADER (Mesti Jalan Dulu) ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderCircle = document.querySelector('.loader-circle');
    const loaderText = document.querySelector('.loader-text');
    const svgText = document.querySelector('.loader-text text');

    if (preloader) {
        // Mula animasi letup selepas 1.5s
        setTimeout(() => {
            if (loaderCircle) loaderCircle.classList.add('break');
            
            setTimeout(() => {
                if (loaderText) loaderText.classList.add('show');
                if (svgText) svgText.style.animation = 'writeText 2s ease-in-out forwards';
                
                // Hilangkan preloader & mula tarik data novel
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    // Panggil fetchNovels di sini supaya grid tak kosong bila preloader hilang
                    fetchNovels();
                }, 2800);
            }, 400); 
        }, 1500);
    }
});

// --- 2. FUNGSI UTAMA (TEMA & DOM READY) ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Kekalkan tema pilihan pengguna dari LocalStorage
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    }

    // Logik Tukar Tema (Dark/Light)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (themeIcon) themeIcon.innerText = isLight ? '☀️' : '🌙';
        });
    }
});

// --- 3. AMBIL DATA DARI FIRESTORE ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return; // Jika bukan di page index yang ada grid novel, abaikan
    
    // Papar animasi loading kecil dalam grid sementara tunggu Firebase
    grid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="opacity-50 tracking-widest text-xs uppercase">Menyambung ke Story Verse...</p>
        </div>
    `;

    try {
        // Tarik data dari collection 'novels', susun yang paling baru di atas
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-xs">Tiada novel ditemui dalam dimensi ini.</p>';
            return;
        }

        grid.innerHTML = ''; // Kosongkan loading animation tadi

        snapshot.forEach(doc => {
            const data = doc.data();
            const card = `
                <div class="novel-card group cursor-pointer" onclick="checkAccess('${doc.id}')">
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
                        <p class="text-xs text-gray-500 italic mt-1 uppercase font-bold tracking-tighter">${data.genre || 'General'}</p>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });
    } catch (error) {
        console.error("Firebase Error:", error);
        grid.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-10">
                <p class="font-black italic">! DATABASE ERROR !</p>
                <p class="text-xs mt-2 opacity-50">Pastikan Firestore Rules anda adalah 'public'.</p>
            </div>
        `;
    }
}

// --- 4. LOGIK AUTHENTICATION & AKSES ---
const authBtn = document.getElementById('authBtn');

// Pantau status pengguna secara real-time
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        if (authBtn) {
            if (user) {
                authBtn.innerText = "Log Keluar";
                authBtn.onclick = () => firebase.auth().signOut();
            } else {
                authBtn.innerText = "Log Masuk";
                authBtn.onclick = () => window.location.href = 'auth.html';
            }
        }
    });
}

// Fungsi Semak Akses sebelum membaca
function checkAccess(novelId) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Jika sudah login, bawa ke page bacaan (kita akan buat fail ini nanti)
        // window.location.href = `baca.html?id=${novelId}`;
        alert("Akses diberikan! Menghantar anda ke dunia novel..."); 
    } else {
        // Jika belum login, paksa ke page auth
        alert("Sila log masuk dahulu untuk menerokai karya ini!");
        window.location.href = 'auth.html';
    }
}
