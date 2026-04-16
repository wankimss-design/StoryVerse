// --- 1. AUTH GUARD & PROFILE ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Jika tidak login, hantar balik ke auth.html
        window.location.href = "auth.html";
    } else {
        // Kemaskini maklumat profil
        const navName = document.getElementById('navUserName');
        const navAvatar = document.getElementById('navAvatar');
        
        if (navName) navName.innerText = user.displayName || "Penulis";
        if (navAvatar) navAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        
        // Mulakan load data
        loadKatalog();
    }
});

// --- 2. DATA CONTOH (Sesuai untuk test) ---
const databaseNovels = [
    { title: "Sumpahan Penulis Terakhir", genre: "Seram", status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", genre: "Romantik", status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Malam Tanpa Bintang", genre: "Romantik", status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
    { title: "Rahsia StoryVerse", genre: "Fantasi", status: "Ongoing", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
    { title: "Kembara Digital", genre: "Aksi", status: "Ongoing", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500" }
];

// --- 3. FUNGSI UTAMA: LOAD & TAPIS ---
function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Ambil semua genre/status yang di-check
    const selectedFilters = Array.from(document.querySelectorAll('.modern-chip input:checked'))
                                 .map(input => input.value);

    // Proses Tapis
    const filtered = databaseNovels.filter(novel => {
        const matchSearch = novel.title.toLowerCase().includes(searchTerm);
        const matchFilter = selectedFilters.length === 0 || 
                           selectedFilters.includes(novel.genre) || 
                           selectedFilters.includes(novel.status);
        
        return matchSearch && matchFilter;
    });

    // Paparkan
    displayNovels(filtered);
}

function displayNovels(novels) {
    const grid = document.getElementById('katalogGrid');
    
    if (novels.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 opacity-50 uppercase tracking-widest text-[10px]">Tiada karya ditemui...</div>`;
        return;
    }

    grid.innerHTML = novels.map(n => `
        <div class="novel-card group cursor-pointer">
            <div class="relative overflow-hidden rounded-[24px] bg-[#111] aspect-[3/4]">
                <img src="${n.cover}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span class="bg-white text-black text-[9px] font-black px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">LIHAT CERITA</span>
                </div>
            </div>
            <h3 class="novel-title font-bold mt-4 text-sm line-clamp-1">${n.title}</h3>
            <div class="flex items-center gap-2 mt-1">
                <span class="text-[9px] font-bold text-purple-500 uppercase tracking-tighter">${n.genre}</span>
                <span class="text-[9px] text-gray-500">•</span>
                <span class="text-[9px] text-gray-500 uppercase tracking-tighter">${n.status}</span>
            </div>
        </div>
    `).join('');
}

// --- 4. EVENT LISTENERS ---
document.getElementById('searchInput').addEventListener('input', loadKatalog);

document.querySelectorAll('.modern-chip input').forEach(checkbox => {
    checkbox.addEventListener('change', loadKatalog);
});

// --- 5. THEME TOGGLE (LOGIK STABIL) ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    
    // Tukar Ikon
    if (isLight) {
        icon.classList.replace('fa-circle-half-stroke', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-circle-half-stroke');
        localStorage.setItem('theme', 'dark');
    }
}

// Semak tema asal semasa load
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon')?.classList.replace('fa-circle-half-stroke', 'fa-sun');
}

// Fungsi Keluar
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
}
