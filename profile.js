// Gunakan variable global untuk simpan data
let myNovels = [
    { title: "Cinta Di Verse 01", views: "1.2k", clicks: "4.5k", status: "Published", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" }
];

const userReading = [
    { title: "Shadow Bound: Verse 01", progress: 75, cover: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 30, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

// Pastikan skrip jalan hanya selepas DOM sedia
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFirebase();
});

function initFirebase() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('userName').innerText = user.displayName || "Admin12";
            document.getElementById('userEmail').innerText = user.email;
            if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
            
            // Muat kandungan tab pertama secara automatik
            loadUserContent();
        } else {
            window.location.href = "auth.html";
        }
    });
}

// --- LOGIK TAB (ANTI-BUG) ---
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const indicator = document.getElementById('tabIndicator');

    tabs.forEach(btn => {
        btn.addEventListener('click', function() {
            // 1. Buang class active dari semua tab
            tabs.forEach(t => t.classList.remove('active'));
            
            // 2. Tambah active pada tab yang diklik
            this.classList.add('active');
            
            // 3. Gerakkan indicator
            if (indicator) {
                indicator.style.width = `${this.offsetWidth}px`;
                indicator.style.left = `${this.offsetLeft}px`;
            }

            // 4. Tukar Kandungan
            const tabType = this.getAttribute('data-tab');
            switchTabContent(tabType);
        });
    });

    // Set posisi awal indicator
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && indicator) {
        setTimeout(() => {
            indicator.style.width = `${activeTab.offsetWidth}px`;
            indicator.style.left = `${activeTab.offsetLeft}px`;
        }, 300);
    }
}

function switchTabContent(tab) {
    const grid = document.getElementById('readingList');
    const analytics = document.getElementById('analyticsSection');

    // Sembunyikan analitik secara default
    analytics.classList.add('hidden');
    grid.innerHTML = '<div class="col-span-2 text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Memuatkan...</div>';

    setTimeout(() => {
        grid.innerHTML = '';
        if (tab === 'reading') {
            loadUserContent();
        } else if (tab === 'saved') {
            displaySaved();
        } else if (tab === 'my-novels') {
            loadMyNovels();
            analytics.classList.remove('hidden');
        }
    }, 200);
}

// --- FUNGSI PAPARAN ---
function loadUserContent() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userReading.map(n => `
        <div class="profile-novel-card group">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img src="${n.cover}" class="w-full h-full object-cover">
            </div>
            <h4 class="text-sm font-bold truncate mb-2">${n.title}</h4>
            <div class="progress-container mb-2"><div class="progress-bar" style="width: ${n.progress}%"></div></div>
            <span class="text-[8px] font-black text-gray-500 uppercase">${n.progress}% Dibaca</span>
        </div>
    `).join('');
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
            <span class="text-[9px] text-purple-500 font-black uppercase">Karya Anda</span>
        </div>
    `).join('');

    tableBody.innerHTML = myNovels.map((n, index) => `
        <tr class="hover:bg-white/[0.02] border-b border-white/5">
            <td class="px-6 py-4 font-bold text-white text-xs">${n.title}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.views}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.clicks}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="openEditNovelModal(${index})" class="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// --- MODAL CONTROLS ---
function toggleEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
}

function openEditNovelModal(index) {
    const novel = myNovels[index];
    document.getElementById('editNovelId').value = index;
    document.getElementById('editNovelTitle').value = novel.title;
    document.getElementById('editNovelCover').value = novel.cover;
    document.getElementById('editNovelModal').classList.remove('hidden');
}

function closeEditNovelModal() {
    document.getElementById('editNovelModal').classList.add('hidden');
}

// Simpan Perubahan Novel
const editForm = document.getElementById('editNovelForm');
if(editForm) {
    editForm.onsubmit = function(e) {
        e.preventDefault();
        const index = document.getElementById('editNovelId').value;
        myNovels[index].title = document.getElementById('editNovelTitle').value;
        myNovels[index].cover = document.getElementById('editNovelCover').value;
        
        alert("Karya Berjaya Dikemaskini!");
        closeEditNovelModal();
        loadMyNovels();
    };
}

function logout() {
    firebase.auth().signOut().then(() => { window.location.href = "index.html"; });
}
