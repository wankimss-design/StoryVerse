// --- 1. BOUNCER & PROFILE SETUP ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Tendang ke login jika belum login
        window.location.href = "auth.html";
    } else {
        // Setup maklumat profil di nav
        document.getElementById('navUserName').innerText = user.displayName || "Admin";
        document.getElementById('navAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        
        // Panggil data awal
        loadKatalog();
    }
});

// --- 2. DATA NOVEL (DUMMY UNTUK TEST) ---
const allNovels = [
    { title: "Sumpahan Penulis Terakhir", author: "Misteri_99", genre: ["Misteri", "Seram"], status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", author: "Aries_Writer", genre: ["Romantik", "Fantasi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Malam Tanpa Bintang", author: "SenjaHati", genre: ["Romantik"], status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
    { title: "Rahsia StoryVerse", author: "AdminDev", genre: ["Misteri", "Aksi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" }
];

// --- 3. FUNGSI MUAT & TAPIS KATALOG ---
function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    // Ambil genre & status yang dipilih
    const selected = Array.from(document.querySelectorAll('.genre-chip input:checked'))
                          .map(checkbox => checkbox.value);

    const filtered = allNovels.filter(novel => {
        const matchSearch = novel.title.toLowerCase().includes(term);
        const matchFilter = selected.length === 0 || 
                           selected.some(s => novel.genre.includes(s) || novel.status === s);
        return matchSearch && matchFilter;
    });

    displayResults(filtered);
}

function displayResults(novels) {
    const grid = document.getElementById('katalogGrid');
    if (novels.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 italic uppercase text-[10px]">Tiada cerita ditemui...</p>`;
        return;
    }

    grid.innerHTML = novels.map(n => `
        <div class="novel-card group cursor-pointer">
            <div class="cover-wrapper aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 relative bg-[#111]">
                <img src="${n.cover}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                    <button class="w-full bg-purple-600 py-2 rounded-xl text-[10px] font-black uppercase">Baca</button>
                </div>
            </div>
            <h3 class="novel-title font-bold mt-3 text-sm line-clamp-2">${n.title}</h3>
            <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">@${n.author}</p>
        </div>
    `).join('');
}

// --- 4. EVENT LISTENERS ---
document.getElementById('searchInput').addEventListener('input', loadKatalog);
document.querySelectorAll('.genre-chip input').forEach(chip => {
    chip.addEventListener('change', loadKatalog);
});

// --- 5. THEME TOGGLE LOGIC ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('storyverse-theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('storyverse-theme', 'dark');
    }
}

// Simpan pilihan tema user walaupun page di-refresh
if (localStorage.getItem('storyverse-theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon')?.classList.replace('fa-moon', 'fa-sun');
}

// Fungsi Keluar
function logout() {
    firebase.auth().signOut().then(() => window.location.href = "auth.html");
}
