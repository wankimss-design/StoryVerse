// --- AUTH & DATA ---
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "auth.html";
    } else {
        document.getElementById('navUserName').innerText = user.displayName || "Admin";
        document.getElementById('navAvatar').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=a855f7&color=fff`;
        loadKatalog();
    }
});

// --- THEME TOGGLE ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// Check saved theme on load
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
}

// --- SEARCH & FILTER LOGIC ---
const allNovels = [
    { title: "Sumpahan Penulis Terakhir", author: "Misteri_99", genre: ["Misteri", "Seram"], status: "Complete", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
    { title: "Cinta Di Balik Dimensi", author: "Aries_Writer", genre: ["Romantik", "Fantasi"], status: "Ongoing", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
    { title: "Malam Tanpa Bintang", author: "SenjaHati", genre: ["Romantik"], status: "Complete", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" }
];

function loadKatalog() {
    const grid = document.getElementById('katalogGrid');
    const term = document.getElementById('searchInput').value.toLowerCase();
    const selected = Array.from(document.querySelectorAll('.genre-chip input:checked')).map(i => i.value);

    const filtered = allNovels.filter(n => {
        const matchSearch = n.title.toLowerCase().includes(term);
        const matchFilter = selected.length === 0 || selected.some(s => n.genre.includes(s) || n.status === s);
        return matchSearch && matchFilter;
    });

    grid.innerHTML = filtered.map(n => `
        <div class="novel-card">
            <div class="cover-wrapper"><img src="${n.cover}"></div>
            <h3 class="novel-title font-bold mt-2 text-sm">${n.title}</h3>
            <p class="text-xs text-gray-500">@${n.author}</p>
        </div>
    `).join('');
}

document.getElementById('searchInput').addEventListener('input', loadKatalog);
document.querySelectorAll('.genre-chip input').forEach(c => c.addEventListener('change', loadKatalog));

function logout() {
    firebase.auth().signOut().then(() => window.location.href = "auth.html");
}
