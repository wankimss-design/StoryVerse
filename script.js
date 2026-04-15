/* ================================================================
   STORY VERSE - LOGIK UTAMA & ANIMASI
================================================================ */

// --- 1. LOGIK PRELOADER & TRANSISI GULUNG ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loaderCircle = document.querySelector('.loader-circle');
    const loaderText = document.querySelector('.loader-text');
    const svgText = document.querySelector('.loader-text text');

    if (preloader) {
        // Mula animasi pecah selepas 1.5s
        setTimeout(() => {
            if (loaderCircle) loaderCircle.classList.add('break');
            
            setTimeout(() => {
                if (loaderText) loaderText.classList.add('show');
                if (svgText) svgText.style.animation = 'writeText 2s ease-in-out forwards';
                
                // --- EFEK GULUNG KERTAS (LIFT UP) ---
                setTimeout(() => {
                    preloader.classList.add('lift-up'); // Kesan gulung ke atas
                    
                    // Tarik data novel semasa skrin sedang digulung
                    fetchNovels();
                    
                    // Buang terus dari memori selepas animasi tamat
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 1200); 
                }, 3000); // Beri masa pengguna tengok tulisan StoryVerse
            }, 400); 
        }, 1500);
    }
});

// --- 2. TEMA & DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (themeIcon) themeIcon.innerText = isLight ? '☀️' : '🌙';
        });
    }
});

// --- 3. FIRESTORE DATA ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return;

    try {
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 uppercase text-xs">Dimensi Kosong.</p>';
            return;
        }

        grid.innerHTML = ''; 
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = `
                <div class="novel-card group cursor-pointer" onclick="checkAccess('${doc.id}')">
                    <div class="card-image-wrapper shadow-xl">
                        <img src="${data.image || ''}" class="card-img" alt="${data.title}" onerror="this.src='https://via.placeholder.com/300x450?text=StoryVerse'">
                        <div class="card-badge">${data.tag || 'NEW'}</div>
                    </div>
                    <div class="mt-4">
                        <h3 class="font-bold text-lg group-hover:text-purple-500 transition">${data.title}</h3>
                        <p class="text-xs text-gray-500 italic">${data.genre}</p>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });
    } catch (e) { console.error(e); }
}

// --- 4. AUTH & ACCESS ---
const authBtn = document.getElementById('authBtn');
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        if (authBtn) {
            authBtn.innerText = user ? "Log Keluar" : "Log Masuk";
            authBtn.onclick = () => user ? firebase.auth().signOut() : window.location.href = 'auth.html';
        }
    });
}

function checkAccess(id) {
    const user = firebase.auth().currentUser;
    if (user) {
        alert("Memasuki portal pembacaan...");
    } else {
        alert("Sila log masuk dahulu!");
        window.location.href = 'auth.html';
    }
}
