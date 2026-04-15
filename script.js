// --- 1. PRELOADER LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const circle = document.querySelector('.loader-circle');
    const text = document.querySelector('.loader-text');
    const svg = document.querySelector('.loader-text text');

    if (!preloader) return;

    setTimeout(() => {
        circle?.classList.add('break');
        setTimeout(() => {
            text?.classList.add('show');
            if (svg) svg.style.animation = "writeText 2s ease-in-out forwards";

            setTimeout(() => {
                preloader.classList.add('lift-up');
                // Panggil data dari Firestore selepas loading
                if (typeof fetchNovels === 'function') fetchNovels();
                
                // Padam terus preloader dari skrin selepas 1.2s
                setTimeout(() => { preloader.style.display = 'none'; }, 1300);
            }, 3000);
        }, 400);
    }, 1000);
});

// --- 2. THEME SWITCHER ---
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    }

    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (themeIcon) themeIcon.innerText = isLight ? '☀️' : '🌙';
    });
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
    const user = firebase.auth().currentUser;
    if (user) {
        // Jika dah login, boleh bawa ke page bacaan
        alert("Menuju ke dimensi novel...");
        // window.location.href = `read.html?id=${id}`;
    } else {
        alert("Sila Log Masuk untuk membaca!");
        window.location.href = 'auth.html';
    }
}
