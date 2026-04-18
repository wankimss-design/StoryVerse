// --- 1. FIREBASE AUTH & USER PROFILE ---
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        const navProfileImg = document.getElementById('navProfileImg');
        
        if (navProfileImg) {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.email}&background=a855f7&color=fff`;
            navProfileImg.src = user.photoURL || fallbackAvatar;

            try {
                const db = firebase.firestore();
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists && doc.data().photoURL) {
                    navProfileImg.src = doc.data().photoURL;
                }
            } catch (error) {
                console.log("Ralat profil:", error);
            }
        }
        loadKatalog(); 
    }
});

// --- 2. DROPDOWN LOGIC ---
function toggleDropdown(id) {
    const menus = ['genreMenu', 'statusMenu'];
    menus.forEach(m => {
        const el = document.getElementById(m);
        if (el) m === id ? el.classList.toggle('hidden') : el.classList.add('hidden');
    });
}

// --- 3. DATA & RENDER (FIRESTORE VERSION) ---
async function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const searchInput = document.getElementById('searchInput');
    const term = searchInput?.value.toLowerCase() || "";
    
    const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(i => i.value);
    const selectedStatus = document.querySelector('input[name="status"]:checked')?.value || "";

    try {
        const db = firebase.firestore();
        // Tarik data dari koleksi 'novels'
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
        
        let allNovels = [];
        snapshot.forEach(doc => {
            allNovels.push({ id: doc.id, ...doc.data() });
        });

        // Tapis data
        const filtered = allNovels.filter(n => {
            const matchSearch = n.title.toLowerCase().includes(term);
            const matchGenre = selectedGenres.length === 0 || selectedGenres.includes(n.genre);
            const matchStatus = selectedStatus === "" || n.status === selectedStatus;
            return matchSearch && matchGenre && matchStatus;
        });

        renderGrid(filtered);
    } catch (error) {
        console.error("Ralat Firestore:", error);
        if(grid) grid.innerHTML = `<p class="col-span-full text-center py-10 opacity-50 text-[10px]">Gagal memuatkan data dari pangkalan data.</p>`;
    }
}

function renderGrid(data) {
    const grid = document.getElementById('katalogGrid');
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-24 opacity-20 text-[10px] uppercase tracking-[0.5em]">Karya tidak ditemui</p>`;
        return;
    }

    grid.innerHTML = data.map(n => `
        <div class="novel-card group cursor-pointer" onclick="location.href='detail.html?id=${n.id}'">
            <div class="card-image-container">
                <img src="${n.cover}" alt="${n.title}">
                <div class="read-overlay">
                    <div class="read-btn-ui">Lihat Detail</div>
                </div>
            </div>
            <h3 class="font-bold mt-5 text-sm tracking-tight truncate px-1 group-hover:text-purple-500 transition-colors">${n.title}</h3>
            <div class="flex items-center gap-2 mt-1.5 px-1">
                <span class="text-[9px] font-black text-purple-500 uppercase tracking-tighter">${n.genre || 'Umum'}</span>
                <span class="text-[9px] text-gray-700">•</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">${n.status || 'Ongoing'}</span>
            </div>
        </div>
    `).join('');
}

// --- 4. THEME & UTILITY ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function logout() {
    firebase.auth().signOut().then(() => { window.location.href = "auth.html"; });
}

// Event Listeners
document.getElementById('searchInput')?.addEventListener('input', loadKatalog);
document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => {
    i.addEventListener('change', loadKatalog);
});
