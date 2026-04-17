// --- 1. FIREBASE AUTH GUARD ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        const navAvatar = document.getElementById('navAvatar');
        if (navAvatar) navAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        loadKatalog();
    }
});

// --- 2. DROPDOWN CONTROLLER ---
function toggleDropdown(id) {
    const menus = ['genreMenu', 'statusMenu'];
    menus.forEach(m => {
        const el = document.getElementById(m);
        m === id ? el.classList.toggle('hidden') : el.classList.add('hidden');
    });
}

// Tutup dropdown jika klik di luar
window.onclick = (e) => {
    if (!e.target.closest('.dropdown-group')) {
        document.querySelectorAll('.menu-box').forEach(m => m.classList.add('hidden'));
    }
};

// --- 3. DATA NOVEL (CONTOH) ---
const novels = [
    { title: "Sumpahan Penulis Terakhir", genre: "Seram", status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", genre: "Romantik", status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Rahsia StoryVerse", genre: "Fantasi", status: "Ongoing", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
    { title: "Malam Tanpa Bintang", genre: "Romantik", status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" }
];

// --- 4. FILTERING SYSTEM ---
function loadKatalog() {
    const term = document.getElementById('searchInput').value.toLowerCase();
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
    if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-24 opacity-30 text-xs uppercase tracking-[0.3em]">Tiada hasil ditemui...</p>`;
        return;
    }

    grid.innerHTML = data.map(n => `
        <div class="novel-card group cursor-pointer animate-reveal">
            <div class="overflow-hidden rounded-[32px] bg-[#111] aspect-[3/4] shadow-xl">
                <img src="${n.cover}" class="w-full h-full object-cover">
            </div>
            <h3 class="font-bold mt-5 text-sm truncate px-1">${n.title}</h3>
            <div class="flex items-center gap-2 mt-2 px-1">
                <span class="text-[9px] font-black text-purple-500 uppercase tracking-tighter">${n.genre}</span>
                <span class="text-[9px] text-gray-600">•</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">${n.status}</span>
            </div>
        </div>
    `).join('');
}

// --- 5. THEME TOGGLE ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('themeIcon').classList.replace(isLight ? 'fa-circle-half-stroke' : 'fa-sun', isLight ? 'fa-sun' : 'fa-circle-half-stroke');
    localStorage.setItem('theme-pref', isLight ? 'light' : 'dark');
}

// Auto-load saved theme
if (localStorage.getItem('theme-pref') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon')?.classList.replace('fa-circle-half-stroke', 'fa-sun');
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', loadKatalog);
document.querySelectorAll('input').forEach(i => i.addEventListener('change', loadKatalog));

function logout() { firebase.auth().signOut().then(() => window.location.href = "auth.html"); }
