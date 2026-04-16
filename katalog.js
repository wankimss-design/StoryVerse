// --- 1. BOUNCER (PRIVATE ROUTE GUARD) ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Jika belum login, tendang ke auth.html
        window.location.href = "auth.html";
    } else {
        // Jika dah login, setup UI
        document.getElementById('navUserName').innerText = user.displayName || "Penulis";
        document.getElementById('welcomeName').innerText = user.displayName || "Penulis";
        document.getElementById('navAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        
        loadKatalog(); // Panggil fungsi muat data
    }
});

// --- 2. LOGOUT ---
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
}

// --- 3. THEME TOGGLE (LIGHT/DARK) ---
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

// --- 4. MUAT DATA KATALOG ---
function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    
    // Contoh Data (Nanti boleh tarik guna Firestore: db.collection('novels').get())
    const dataNovels = [
        { title: "Sumpahan Penulis Terakhir", author: "Misteri_99", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
        { title: "Cinta Di Balik Dimensi", author: "Aries_Writer", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
        { title: "Malam Tanpa Bintang", author: "SenjaHati", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" },
        { title: "Rahsia StoryVerse", author: "AdminDev", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
        { title: "Kembara Digital", author: "CyberSoul", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500" }
    ];

    grid.innerHTML = dataNovels.map(novel => `
        <div class="novel-card">
            <div class="cover-wrapper">
                <img src="${novel.cover}" alt="${novel.title}">
                <div class="info-overlay">
                    <button class="w-full bg-purple-600 text-white text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-purple-500 transition shadow-lg">
                        Baca Sekarang
                    </button>
                </div>
            </div>
            <h3 class="novel-title">${novel.title}</h3>
            <p class="novel-author">Oleh @${novel.author}</p>
        </div>
    `).join('');
}
