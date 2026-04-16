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

// --- 3. FETCH NOVELS FROM FIRESTORE ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return;

    try {
        // Pastikan 'db' (Firestore) sudah di-init dalam firebase-config.js
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').limit(10).get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center opacity-50 uppercase tracking-widest text-xs">Tiada Novel Dijumpai</p>';
            return;
        }

        grid.innerHTML = ''; 
        snapshot.forEach(doc => {
            const data = doc.data();
            grid.innerHTML += `
                <div class="novel-card group cursor-pointer" onclick="checkAccess('${doc.id}')">
                    <div class="card-image-wrapper shadow-xl">
                        <img src="${data.image || ''}" class="card-img" alt="${data.title}" onerror="this.src='https://via.placeholder.com/300x450?text=StoryVerse'">
                    </div>
                    <div class="mt-4">
                        <h3 class="font-bold text-lg group-hover:text-purple-500 transition">${data.title}</h3>
                        <p class="text-xs text-gray-500 italic font-medium">${data.genre || 'Novel'}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Firestore Error:", error);
    }
}

// --- 4. FIREBASE AUTH & ACCESS ---
function checkAccess(id) {
    // Logik akses novel
    const user = firebase.auth()?.currentUser;
    if (user) {
        alert("Menuju ke dimensi novel...");
        // window.location.href = `read.html?id=${id}`;
    } else {
        alert("Sila Log Masuk untuk membaca!");
        window.location.href = 'auth.html';
    }
}
