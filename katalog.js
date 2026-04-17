/**
 * STORYVERSE - KATALOG CORE ENGINE
 * Mengendalikan Auth, Penapisan (Filtering), dan Antaramuka Dinamik.
 */

// --- 1. KESELAMATAN & PROFIL (FIREBASE AUTH) ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Jika pengguna tidak log masuk, hantar ke halaman auth
        window.location.href = "auth.html";
    } else {
        console.log("Pengguna dikesan:", user.displayName);
        setupUserProfile(user);
        loadKatalog(); // Muat data novel selepas pengesahan
    }
});

function setupUserProfile(user) {
    const navAvatar = document.getElementById('navAvatar');
    const navName = document.getElementById('navUserName');

    // Gunakan gambar profil Firebase atau UI-Avatars jika tiada
    if (navAvatar) {
        navAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=a855f7&color=fff`;
    }
    if (navName) {
        navName.innerText = user.displayName || "Pembaca";
    }
}

// --- 2. DATA NOVEL (SUMBER DATA) ---
// Dalam fasa akan datang, anda boleh tarik data ini dari Firebase Firestore
const databaseNovels = [
    { id: 1, title: "Sumpahan Penulis Terakhir", genre: "Seram", status: "Complete", author: "Misteri_99", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { id: 2, title: "Cinta Di Balik Dimensi", genre: "Romantik", status: "Ongoing", author: "Aries_Writer", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { id: 3, title: "Rahsia StoryVerse", genre: "Fantasi", status: "Ongoing", author: "AdminDev", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
    { id: 4, title: "Malam Tanpa Bintang", genre: "Romantik", status: "Complete", author: "SenjaHati", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
    { id: 5, title: "Kembara Digital", genre: "Aksi", status: "Ongoing", author: "TechNomad", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500" },
    { id: 6, title: "Detektif Cyber", genre: "Misteri", status: "Complete", author: "CodeBreaker", cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500" }
];

// --- 3. LOGIK PENAPISAN (FILTERING SYSTEM) ---
function loadKatalog() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Ambil nilai daripada Checkbox Genre (Boleh pilih banyak)
    const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
                                .map(checkbox => checkbox.value);
    
    // Ambil nilai daripada Radio Status (Hanya satu pilihan)
    const selectedStatus = document.querySelector('input[name="status"]:checked')?.value || "";

    // Proses Tapis
    const filteredResults = databaseNovels.filter(novel => {
        const matchSearch = novel.title.toLowerCase().includes(searchTerm) || 
                           novel.author.toLowerCase().includes(searchTerm);
        
        const matchGenre = selectedGenres.length === 0 || selectedGenres.includes(novel.genre);
        
        const matchStatus = selectedStatus === "" || novel.status === selectedStatus;

        return matchSearch && matchGenre && matchStatus;
    });

    renderNovelGrid(filteredResults);
}

// --- 4. PAPARAN GRID (DYNAMIC UI) ---
function renderNovelGrid(data) {
    const grid = document.getElementById('katalogGrid');
    
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-32">
                <i class="fa-solid fa-ghost text-4xl text-gray-800 mb-4 block"></i>
                <p class="opacity-30 text-[10px] uppercase tracking-[0.4em]">Tiada karya ditemui dalam arkib...</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map(novel => `
        <div class="novel-card group cursor-pointer" onclick="viewNovel(${novel.id})">
            <div class="relative overflow-hidden rounded-[32px] bg-[#111] aspect-[3/4] shadow-2xl">
                <img src="${novel.cover}" alt="${novel.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button class="w-full bg-white text-black text-[9px] font-black py-3 rounded-xl uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        Baca Sekarang
                    </button>
                </div>
            </div>
            <div class="mt-5 px-1">
                <h3 class="font-bold text-sm truncate group-hover:text-purple-500 transition-colors">${novel.title}</h3>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-[9px] font-black text-purple-500 uppercase">${novel.genre}</span>
                    <span class="text-[9px] text-gray-600">•</span>
                    <span class="text-[9px] font-bold text-gray-500 uppercase">${novel.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 5. KAWALAN DROPDOWN ---
function toggleDropdown(id) {
    const menu = document.getElementById(id);
    const allMenus = ['genreMenu', 'statusMenu'];

    // Tutup menu lain sebelum buka yang baru
    allMenus.forEach(mId => {
        if (mId !== id) {
            document.getElementById(mId)?.classList.add('hidden');
        }
    });

    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Tutup dropdown jika pengguna klik di mana-mana kawasan luar
window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown-group')) {
        document.getElementById('genreMenu')?.classList.add('hidden');
        document.getElementById('statusMenu')?.classList.add('hidden');
    }
});

// --- 6. SISTEM TEMA (THEME TOGGLE) ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');

    // Tukar Ikon (Half-stroke <-> Sun)
    if (icon) {
        icon.classList.replace(isLight ? 'fa-circle-half-stroke' : 'fa-sun', isLight ? 'fa-sun' : 'fa-circle-half-stroke');
    }

    // Simpan pilihan ke local storage
    localStorage.setItem('storyverse-theme', isLight ? 'light' : 'dark');
}

// Muat tema simpanan apabila halaman dibuka
(function initTheme() {
    const savedTheme = localStorage.getItem('storyverse-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        setTimeout(() => {
            const icon = document.getElementById('themeIcon');
            if (icon) icon.classList.replace('fa-circle-half-stroke', 'fa-sun');
        }, 100);
    }
})();

// --- 7. UTALITI (LOGOUT & NAVIGATION) ---
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    }).catch((error) => {
        console.error("Gagal Logout:", error);
    });
}

function viewNovel(id) {
    console.log("Membuka novel ID:", id);
    // window.location.href = `baca.html?id=${id}`; // Contoh navigasi ke page bacaan
}

// --- 8. EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', loadKatalog);
    }

    // Pasang listener pada semua input di dalam dropdown
    const filterInputs = document.querySelectorAll('.dropdown-item input');
    filterInputs.forEach(input => {
        input.addEventListener('change', loadKatalog);
    });
});
