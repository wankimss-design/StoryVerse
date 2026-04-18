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

// Tutup dropdown jika klik di luar
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.menu-box')) {
        document.getElementById('genreMenu')?.classList.add('hidden');
        document.getElementById('statusMenu')?.classList.add('hidden');
    }
}

// --- 3. DATA & RENDER ---
async function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const searchInput = document.getElementById('searchInput');
    const term = searchInput?.value.toLowerCase() || "";
    
    const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(i => i.value);
    const selectedStatus = document.querySelector('input[name="status"]:checked')?.value || "";

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
        
        let allNovels = [];
        snapshot.forEach(doc => {
            allNovels.push({ id: doc.id, ...doc.data() });
        });

        const filtered = allNovels.filter(n => {
            const matchSearch = n.title.toLowerCase().includes(term);
            const novelGenres = Array.isArray(n.genres) ? n.genres : (n.genre ? [n.genre] : []);
            const matchGenre = selectedGenres.length === 0 || novelGenres.some(g => selectedGenres.includes(g));
            const matchStatus = selectedStatus === "" || n.status === selectedStatus;
            
            return matchSearch && matchGenre && matchStatus;
        });

        renderGrid(filtered);
    } catch (error) {
        console.error("Ralat Firestore:", error);
        if(grid) grid.innerHTML = `<p class="col-span-full text-center py-10 opacity-50 text-[10px]">Gagal memuatkan data.</p>`;
    }
}

function renderGrid(data) {
    const grid = document.getElementById('katalogGrid');
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-24 opacity-20 text-[10px] uppercase tracking-[0.5em]">Karya tidak ditemui</p>`;
        return;
    }

    grid.innerHTML = data.map(n => {
        const finalCover = n.coverImage || n.cover || n.image || 'https://via.placeholder.com/300x450';
        const displayGenre = Array.isArray(n.genres) && n.genres.length > 0 ? n.genres[0] : (n.genre || 'Umum');
        
        return `
        <div class="novel-card group cursor-pointer" onclick="location.href='detail.html?id=${n.id}'">
            <div class="card-image-container relative overflow-hidden rounded-[2rem] aspect-[3/4]">
                <img src="${finalCover}" alt="${n.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="read-overlay absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div class="read-btn-ui bg-white text-black px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Detail</div>
                </div>
            </div>
            <h3 class="font-bold mt-5 text-sm tracking-tight truncate px-1 group-hover:text-purple-500 transition-colors uppercase italic">${n.title}</h3>
            <div class="flex items-center gap-2 mt-1.5 px-1">
                <span class="text-[9px] font-black text-purple-500 uppercase tracking-tighter">${displayGenre}</span>
                <span class="text-[9px] text-gray-700">•</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">${n.status || 'Ongoing'}</span>
            </div>
        </div>`;
    }).join('');
}

// --- 4. THEME & LOGOUT ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

function logout() {
    firebase.auth().signOut().then(() => { window.location.href = "auth.html"; });
}

// --- 5. GLOBAL EVENT LISTENERS (Letakkan di sini) ---

// 1. Untuk Carian (Search)
document.getElementById('searchInput')?.addEventListener('input', loadKatalog);

// 2. Untuk Checkbox Genre & Radio Status
document.addEventListener('change', (e) => {
    if (e.target.name === 'genre' || e.target.name === 'status') {
        loadKatalog(); 
    }
});
