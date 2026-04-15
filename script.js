// --- 1. PRELOADER & TRANSISI ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const circle = document.querySelector('.loader-circle');
    const text = document.querySelector('.loader-text');
    const svg = document.querySelector('.loader-text text');

    if (!preloader) return;

    setTimeout(() => {
        circle.classList.add('break');
        setTimeout(() => {
            text.classList.add('show');
            svg.style.animation = "writeText 2s ease-in-out forwards";

            setTimeout(() => {
                preloader.classList.add('lift-up');
                if (typeof fetchNovels === 'function') fetchNovels();
                setTimeout(() => { preloader.style.display = 'none'; }, 1300);
            }, 3000);
        }, 400);
    }, 1500);
});

// --- 2. TEMA ---
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    }

    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeIcon.innerText = isLight ? '☀️' : '🌙';
        };
    }
});

// --- 3. FIRESTORE DATA ---
async function fetchNovels() {
    const grid = document.getElementById('novelGrid');
    if (!grid) return;

    try {
        const snap = await db.collection('novels').orderBy('createdAt', 'desc').get();
        if (snap.empty) {
            grid.innerHTML = '<p class="col-span-full text-center opacity-50">Tiada novel.</p>';
            return;
        }

        grid.innerHTML = '';
        snap.forEach(doc => {
            const data = doc.data();
            grid.innerHTML += `
                <div class="novel-card group cursor-pointer" onclick="checkAccess('${doc.id}')">
                    <div class="card-image-wrapper shadow-2xl">
                        <img src="${data.image || ''}" class="card-img" onerror="this.src='https://via.placeholder.com/300x450?text=StoryVerse'">
                        <div class="card-badge">${data.tag || 'NEW'}</div>
                    </div>
                    <div class="mt-4">
                        <h3 class="font-bold text-lg group-hover:text-purple-500 transition">${data.title}</h3>
                        <p class="text-xs text-gray-500 italic uppercase font-bold tracking-tighter">${data.genre}</p>
                    </div>
                </div>`;
        });
    } catch (e) { console.log(e); }
}

// --- 4. AUTH & LOGIN BUG FIX ---
if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            if (user) {
                authBtn.innerText = "Log Keluar";
                authBtn.onclick = () => firebase.auth().signOut().then(() => window.location.reload());
            } else {
                authBtn.innerText = "Log Masuk";
                authBtn.onclick = () => window.location.href = 'auth.html';
            }
        }
    });
}

function checkAccess(id) {
    if (firebase.auth().currentUser) {
        alert("Portal dibuka...");
    } else {
        alert("Sila log masuk!");
        window.location.href = 'auth.html';
    }
}
