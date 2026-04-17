// --- 1. PENGURUSAN AUTH ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        const navAvatar = document.getElementById('navAvatar');
        const navName = document.getElementById('navUserName');
        
        if (navAvatar) navAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        if (navName) navName.innerText = user.displayName || "Admin";
        
        loadKatalog(); // Muat data setelah auth sah
    }
});

// --- 2. LOGIK DROPDOWN ---
function toggleDropdown(id) {
    const menus = ['genreMenu', 'statusMenu'];
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menuId === id) {
            menu.classList.toggle('hidden');
        } else {
            menu.classList.add('hidden');
        }
    });
}

// Tutup menu jika klik di luar kawasan dropdown
window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-group')) {
        document.getElementById('genreMenu')?.classList.add('hidden');
        document.getElementById('statusMenu')?.classList.add('hidden');
    }
});

// --- 3. DATA & FILTERING ---
const novels = [
    { title: "Sumpahan Penulis Terakhir", genre: "Seram", status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", genre: "Romantik", status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Malam Tanpa Bintang", genre: "Romantik", status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
    { title: "Kembara Digital", genre: "Aksi", status: "Ongoing", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500" }
];

function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    // Ambil pilihan daripada checkbox
    const selectedFilters = Array.from(document.querySelectorAll('.dropdown-item input:checked'))
                                 .map(input => input.value);

    const filtered = novels.filter(n => {
        const matchSearch = n.title.toLowerCase().includes(term);
        const matchFilter = selectedFilters.length === 0 || 
                           selectedFilters.includes(n.genre) || 
                           selectedFilters.includes(n.status);
        return matchSearch && matchFilter;
    });

    renderGrid(filtered);
}

function renderGrid(data) {
    const grid = document.getElementById('katalogGrid');
    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 opacity-40 text-[10px] uppercase tracking-[0.2em]">Tiada hasil ditemui...</p>`;
        return;
    }

    grid.innerHTML = data.map(n => `
        <div class="novel-card group cursor-pointer">
            <div class="overflow-hidden rounded-[24px] bg-[#111] aspect-[3/4]">
                <img src="${n.cover}" class="w-full h-full object-cover group-hover:opacity-80 transition-all">
            </div>
            <h3 class="font-bold mt-4 text-sm truncate">${n.title}</h3>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">${n.genre} • ${n.status}</p>
        </div>
    `).join('');
}

// --- 4. THEME & LOGOUT ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    icon.classList.replace(isLight ? 'fa-circle-half-stroke' : 'fa-sun', isLight ? 'fa-sun' : 'fa-circle-half-stroke');
    localStorage.setItem('katalog-theme', isLight ? 'light' : 'dark');
}

// Kekalkan tema pilihan
if (localStorage.getItem('katalog-theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon')?.classList.replace('fa-circle-half-stroke', 'fa-sun');
}

function logout() {
    firebase.auth().signOut().then(() => window.location.href = "auth.html");
}

// Event Listeners
document.getElementById('searchInput')?.addEventListener('input', loadKatalog);
document.querySelectorAll('.dropdown-item input').forEach(el => el.addEventListener('change', loadKatalog));
