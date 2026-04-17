// --- 1. FIREBASE AUTH CHECK ---
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('userName').innerText = user.displayName || "Pengguna StoryVerse";
        document.getElementById('userEmail').innerText = user.email;
        if(user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
        
        loadReadingList();
    } else {
        window.location.href = "auth.html";
    }
});

// --- 2. DATA SIMULASI ---
const myNovels = [
    { title: "Cinta Di Balik Dimensi", progress: 65, cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 10, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

// --- 3. PAPAR LIST BACAAN ---
function loadReadingList() {
    const list = document.getElementById('readingList');
    list.innerHTML = myNovels.map(n => `
        <div class="profile-card group cursor-pointer">
            <div class="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4 shadow-xl">
                <img src="${n.cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button class="w-full py-2 bg-white text-black text-[9px] font-black uppercase rounded-lg">Teruskan</button>
                </div>
            </div>
            <h3 class="text-xs font-bold truncate">${n.title}</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${n.progress}%"></div>
            </div>
            <p class="text-[9px] text-gray-500 mt-2 uppercase font-bold">${n.progress}% Selesai</p>
        </div>
    `).join('');
}

// --- 4. TAB SWITCHING ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Logik tukar kandungan boleh ditambah di sini
    };
});

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
}
