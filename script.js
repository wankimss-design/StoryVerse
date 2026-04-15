// --- 1. PRELOADER LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const circle = document.querySelector('.loader-circle');
    const text = document.querySelector('.loader-text');
    const svg = document.querySelector('.loader-text text');
    
    // 1. Ambil tema dari storage
    const savedTheme = localStorage.getItem('theme');
    
    // 2. Jika tema 'light', set warna preloader dan body SEGERA
    if (savedTheme === 'light') {
        if (preloader) preloader.style.background = '#fdfbf7'; // Warna cream
        document.body.classList.add('light-mode');
        
        // Tukar ikon nav ke matahari (sun)
        const themeIcon = document.getElementById('themeIconLucide');
        themeIcon?.setAttribute('data-lucide', 'sun');
    }

    if (!preloader) {
        // Jika preloader tiada, terus lukis ikon
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // 3. Animasi Preloader
    setTimeout(() => {
        circle?.classList.add('break');
        setTimeout(() => {
            text?.classList.add('show');
            if (svg) svg.style.animation = "writeText 2s ease-in-out forwards";

            setTimeout(() => {
                preloader.classList.add('lift-up');
                if (typeof fetchNovels === 'function') fetchNovels();
                
                setTimeout(() => { 
                    preloader.style.display = 'none'; 
                    // PENTING: Lukis semua ikon (termasuk footer & nav) selepas preloader hilang
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 1300);
            }, 3000);
        }, 400);
    }, 1000);
});

// --- 2. THEME TOGGLE LOGIC ---
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIconLucide');

themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    // Tukar ikon Lucide secara dinamik
    if (isLight) {
        themeIcon?.setAttribute('data-lucide', 'sun');
    } else {
        themeIcon?.setAttribute('data-lucide', 'moon');
    }
    
    // Refresh semua ikon lucide dalam halaman
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// --- 3. FETCH NOVELS FROM FIRESTORE ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return;

    try {
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

// --- 4. FIREBASE AUTH LOGIC ---
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            if (user) {
                authBtn.innerText = "Log Keluar";
                authBtn.onclick = () => {
                    firebase.auth().signOut().then(() => window.location.reload());
                };
            } else {
                authBtn.innerText = "Log Masuk";
                authBtn.onclick = () => {
                    window.location.href = 'auth.html';
                };
            }
        }
    });
}

// Fungsi Klik Novel
function checkAccess(id) {
    const user = firebase.auth()?.currentUser;
    if (user) {
        alert("Menuju ke dimensi novel...");
        // window.location.href = `read.html?id=${id}`;
    } else {
        alert("Sila Log Masuk untuk membaca!");
        window.location.href = 'auth.html';
    }
}
