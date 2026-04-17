// 1. MONITOR STATUS LOGIN
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('userName').innerText = user.displayName || "Pembaca StoryVerse";
        document.getElementById('userEmail').innerText = user.email;
        if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
        
        // Muat kandungan awal
        loadUserContent(); 
        
        // Set posisi garisan indicator awal
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) setTimeout(() => moveIndicator(activeTab), 100);
    } else {
        window.location.href = "auth.html";
    }
});

// 2. DATA SIMULASI
const userReading = [
    { title: "Shadow Bound: Verse 01", progress: 75, cover: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 30, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

const myNovels = [
    { title: "Cinta Di Verse 01", views: "1.2k", clicks: "4.5k", status: "Published", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" }
];

// 3. FUNGSI NAVIGASI & INDICATOR
function moveIndicator(element) {
    const indicator = document.getElementById('tabIndicator');
    if (indicator) {
        indicator.style.width = element.offsetWidth + "px";
        indicator.style.left = element.offsetLeft + "px";
    }
}

// Logik Penukaran Tab (Disatukan)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        // Tukar class aktif
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        moveIndicator(btn);

        const tab = btn.getAttribute('data-tab');
        const grid = document.getElementById('readingList');
        const analytics = document.getElementById('analyticsSection');

        // Reset paparan
        analytics.classList.add('hidden');
        grid.innerHTML = '';

        if (tab === 'reading') {
            loadUserContent();
        } 
        else if (tab === 'saved') {
            displaySaved();
        } 
        else if (tab === 'my-novels') {
            loadMyNovels();
            analytics.classList.remove('hidden'); // Tunjuk jadual trafik
        }
    };
});

// 4. FUNGSI MEMUAT KANDUNGAN
function loadUserContent() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userReading.map(n => `
        <div class="profile-novel-card group cursor-pointer">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img src="${n.cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <h4 class="text-sm font-bold truncate mb-2">${n.title}</h4>
            <div class="progress-container mb-2">
                <div class="progress-bar" style="width: ${n.progress}%"></div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-[8px] font-black text-gray-500 uppercase">${n.progress}% Dibaca</span>
                <span class="text-[8px] font-black text-purple-500 uppercase hover:underline">Sambung</span>
            </div>
        </div>
    `).join('');
}

async function displaySaved() {
    const user = firebase.auth().currentUser;
    const grid = document.getElementById('readingList');
    grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Memuatkan simpanan...</p>';

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('bookmarks').orderBy('savedAt', 'desc').get();
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Tiada novel disimpan</p>';
            return;
        }
        grid.innerHTML = ''; 
        snapshot.forEach(doc => {
            const n = doc.data();
            grid.innerHTML += `
                <div class="profile-novel-card group cursor-pointer" onclick="window.location.href='detail.html?title=${encodeURIComponent(n.title)}'">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                        <img src="${n.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    </div>
                    <h4 class="text-sm font-bold truncate mb-1">${n.title}</h4>
                    <p class="text-[9px] text-purple-500 font-black uppercase tracking-widest">${n.genre}</p>
                </div>
            `;
        });
    } catch (error) {
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-[10px]">Ralat memuatkan data.</p>';
    }
}

function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');

    grid.innerHTML = myNovels.map(n => `
        <div class="profile-novel-card group">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img src="${n.cover}" class="w-full h-full object-cover">
            </div>
            <h4 class="text-sm font-bold truncate">${n.title}</h4>
            <span class="text-[9px] text-purple-500 font-black uppercase tracking-widest">Penulis: Admin12</span>
        </div>
    `).join('');

    tableBody.innerHTML = myNovels.map(n => `
        <tr class="hover:bg-white/[0.02] transition-colors border-b border-white/5">
            <td class="px-6 py-4 font-bold text-white text-xs">${n.title}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.views}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.clicks}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase border border-green-500/20">
                    ${n.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// 5. PROFIL & LOGOUT
function toggleEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        const user = firebase.auth().currentUser;
        if (user) document.getElementById('editName').value = user.displayName || "";
    }
}

async function saveProfile() {
    const newName = document.getElementById('editName').value;
    const user = firebase.auth().currentUser;
    if (user && newName) {
        try {
            await user.updateProfile({ displayName: newName });
            document.getElementById('userName').innerText = newName;
            toggleEditModal();
            alert("Nama berjaya ditukar!");
        } catch (error) {
            alert("Ralat: " + error.message);
        }
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
}
