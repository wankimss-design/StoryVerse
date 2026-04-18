// --- 1. PRELOADER & INITIAL THEME LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Kunci scroll sebaik sahaja halaman dimuatkan
    document.body.style.overflow = 'hidden';

    // Logik Tema (Dijalankan segera)
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIconLucide');

    if (savedTheme === 'light') {
        if (preloader) preloader.style.background = '#fdfbf7'; 
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    }

    if (!preloader) {
        document.body.style.overflow = 'auto';
        if (typeof fetchNovels === 'function') fetchNovels();
        return;
    }

    // TIMING ANIMASI: Bulatan + Menulis + Extra = 5.3s
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('lift-up'); // Jalankan rollup
            
            // PENTING: Buka semula scroll sejurus animasi rollup bermula
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';

            if (typeof fetchNovels === 'function') fetchNovels();
            
            // Tunggu rollup selesai (1.5s) baru buang terus dari DOM
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 1500);
        }
    }, 5300); 
});

// --- 2. THEME TOGGLE LOGIC ---
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIconLucide');

themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    if (themeIcon) {
        themeIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// --- 3. FETCH DATA DARI FIRESTORE ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    const fImg = document.getElementById('featuredImg');
    const fTitle = document.getElementById('featuredTitle');
    const fCard = document.getElementById('featuredCard');

    if (!grid) return;

    try {
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').limit(10).get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-50 uppercase tracking-widest text-xs">Tiada Novel Dijumpai</p>';
            return;
        }

        grid.innerHTML = '';
        
        // Featured Novel
        const firstDoc = snapshot.docs[0];
        const firstData = firstDoc.data();
        if (fImg && fTitle && fCard) {
            fImg.src = firstData.coverImage || firstData.image || 'https://via.placeholder.com/600x800';
            fTitle.innerText = firstData.title;
            fCard.onclick = () => window.location.href = `detail.html?id=${firstDoc.id}`;
        }

        // Novel Grid
        snapshot.forEach(doc => {
            const data = doc.data();
            const currentCover = data.coverImage || data.image || 'https://via.placeholder.com/300x450';

            grid.innerHTML += `
                <div class="novel-card group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="card-image-wrapper shadow-xl mb-4">
                        <img src="${currentCover}" class="card-img" alt="${data.title}" onerror="this.src='https://via.placeholder.com/300x450'">
                    </div>
                    <div>
                        <h3 class="font-bold text-sm group-hover:text-purple-500 transition uppercase italic tracking-tighter">${data.title}</h3>
                        <p class="text-[10px] text-gray-500 italic uppercase tracking-widest">${data.genre || 'Novel'}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Firestore Error:", error);
    }
}

// --- 4. FIREBASE AUTH MONITORING ---
// Digabungkan supaya lebih efisien
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        const authBtn = document.getElementById('authBtn');
        const profileLink = document.querySelector('a[title="Profile"]');

        if (authBtn) {
            if (user) {
                authBtn.innerText = "Keluar";
                authBtn.onclick = () => firebase.auth().signOut().then(() => window.location.reload());
                if (profileLink) profileLink.href = "profile.html";
            } else {
                authBtn.innerText = "Log Masuk";
                authBtn.onclick = () => window.location.href = 'auth.html';
                if (profileLink) profileLink.href = "auth.html";
            }
        }
    });
}
