// --- 1. FIREBASE AUTH & USER PROFILE (KATALOG.JS) ---
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        const navProfileImg = document.getElementById('navProfileImg');
        
        if (navProfileImg) {
            // 1. Set gambar default dahulu (sementara tunggu data Firestore)
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.email}&background=a855f7&color=fff`;
            navProfileImg.src = user.photoURL || fallbackAvatar;

            // 2. AMBIL DATA DARI FIRESTORE (Tempat profile.js simpan gambar)
            try {
                const db = firebase.firestore();
                const doc = await db.collection('users').doc(user.uid).get();
                
                if (doc.exists && doc.data().photoURL) {
                    // Jika ada gambar di Firestore, guna yang itu (kerana itu yang terbaru)
                    navProfileImg.src = doc.data().photoURL;
                }
            } catch (error) {
                console.log("Ralat mengambil data profil dari Firestore:", error);
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

window.onclick = (e) => {
    if (!e.target.closest('.dropdown-group')) {
        document.querySelectorAll('.menu-box').forEach(m => m.classList.add('hidden'));
    }
};

// --- 3. DATA & RENDER (ARRAY NOVEL) ---
const novels = [
    { title: "Sumpahan Penulis Terakhir", genre: "Seram", status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", genre: "Romantik", status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Rahsia StoryVerse", genre: "Fantasi", status: "Ongoing", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
    { title: "Malam Tanpa Bintang", genre: "Romantik", status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" }
];

function loadKatalog() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const term = searchInput.value.toLowerCase();
    const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(i => i.value);
    const selectedStatus = document.querySelector('input[name="status"]:checked')?.value || "";

    const filtered = novels.filter(n => {
        const matchSearch = n.title.toLowerCase().includes(term);
        const matchGenre = selectedGenres.length === 0 || selectedGenres.includes(n.genre);
        const matchStatus = selectedStatus === "" || n.status === selectedStatus;
        return matchSearch && matchGenre && matchStatus;
    });

    renderGrid(filtered);
}

function renderGrid(data) {
    const grid = document.getElementById('katalogGrid');
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-24 opacity-20 text-[10px] uppercase tracking-[0.5em]">Karya tidak ditemui</p>`;
        return;
    }

    grid.innerHTML = data.map(n => `
        <div class="novel-card group cursor-pointer" onclick="location.href='reader.html?title=${encodeURIComponent(n.title)}'">
            <div class="card-image-container">
                <img src="${n.cover}" alt="${n.title}">
                <div class="read-overlay">
                    <div class="read-btn-ui">Mula Membaca</div>
                </div>
            </div>
            <h3 class="font-bold mt-5 text-sm tracking-tight truncate px-1 group-hover:text-purple-500 transition-colors">${n.title}</h3>
            <div class="flex items-center gap-2 mt-1.5 px-1">
                <span class="text-[9px] font-black text-purple-500 uppercase tracking-tighter">${n.genre}</span>
                <span class="text-[9px] text-gray-700">•</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">${n.status}</span>
            </div>
        </div>
    `).join('');
}

// --- 4. THEME & UTILITY ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    const isLight = document.body.classList.contains('light-mode');
    
    if (themeIcon) {
        themeIcon.classList.replace(isLight ? 'fa-circle-half-stroke' : 'fa-sun', isLight ? 'fa-sun' : 'fa-circle-half-stroke');
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
}

// Event Listeners
document.getElementById('searchInput')?.addEventListener('input', loadKatalog);
document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => {
    i.addEventListener('change', loadKatalog);
});
