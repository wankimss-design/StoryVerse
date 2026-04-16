// --- 1. BOUNCER & AUTH STATUS ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        document.getElementById('navUserName').innerText = user.displayName || "Admin";
        document.getElementById('navAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        
        // Mulakan load data
        fetchNovels();
    }
});

// --- 2. DATA NOVEL (DUMMY DATA UNTUK TEST) ---
const allNovels = [
    { id: 1, title: "Sumpahan Penulis Terakhir", author: "Misteri_99", genre: ["Misteri", "Seram"], status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { id: 2, title: "Cinta Di Balik Dimensi", author: "Aries_Writer", genre: ["Romantik", "Fantasi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { id: 3, title: "Malam Tanpa Bintang", author: "SenjaHati", genre: ["Romantik"], status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
    { id: 4, title: "Rahsia StoryVerse", author: "AdminDev", genre: ["Misteri", "Aksi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
    { id: 5, title: "Kembara Digital", author: "CyberSoul", genre: ["Fantasi", "Aksi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500" }
];

// --- 3. LOGIK PENAPISAN (FILTER & SEARCH) ---
function fetchNovels() {
    const grid = document.getElementById('katalogGrid');
    const searchInput = document.querySelector('input[type="text"]').value.toLowerCase();
    
    // Ambil semua genre yang ditanda (checked)
    const selectedGenres = Array.from(document.querySelectorAll('.genre-chip input[type="checkbox"]:checked'))
                                .map(input => input.value);

    // Tapis data
    const filteredNovels = allNovels.filter(novel => {
        // Carian tajuk
        const matchSearch = novel.title.toLowerCase().includes(searchInput);
        
        // Carian genre (Jika tiada genre dipilih, abaikan filter genre)
        const matchGenre = selectedGenres.length === 0 || 
                           selectedGenres.some(g => novel.genre.includes(g) || novel.status === g);

        return matchSearch && matchGenre;
    });

    displayNovels(filteredNovels);
}

// --- 4. PAPARKAN KE GRID ---
function displayNovels(novels) {
    const grid = document.getElementById('katalogGrid');
    
    if (novels.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-20 italic uppercase tracking-widest text-[10px]">Tiada novel ditemui dalam dimensi ini...</p>`;
        return;
    }

    grid.innerHTML = novels.map(novel => `
        <div class="novel-card">
            <div class="cover-wrapper">
                <img src="${novel.cover}" alt="${novel.title}" loading="lazy">
                <div class="info-overlay">
                    <button class="w-full bg-purple-600 text-white text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-purple-500 transition-all active:scale-95">
                        Baca Sekarang
                    </button>
                </div>
            </div>
            <h3 class="novel-title">${novel.title}</h3>
            <p class="novel-author">Oleh @${novel.author}</p>
        </div>
    `).join('');
}

// --- 5. EVENT LISTENERS ---

// Listener untuk Search Bar (Mencari semasa menaip)
document.querySelector('input[type="text"]').addEventListener('input', fetchNovels);

// Listener untuk Checkbox Genre/Status
document.querySelectorAll('.genre-chip input').forEach(checkbox => {
    checkbox.addEventListener('change', fetchNovels);
});

// Fungsi Logout
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
}

// Night/Light Mode Toggle
function toggleTheme() {
    const body = document.getElementById('mainBody');
    const icon = document.getElementById('themeIcon');
    
    if (body.classList.contains('bg-[#0a0a0a]')) {
        body.classList.replace('bg-[#0a0a0a]', 'bg-white');
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.classList.replace('bg-white', 'bg-[#0a0a0a]');
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}
