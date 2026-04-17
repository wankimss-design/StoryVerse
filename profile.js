// 1. DATA SIMULASI
let myNovels = [
    { title: "Cinta Di Verse 01", views: "1.2k", clicks: "4.5k", status: "Published", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" }
];

const userReading = [
    { title: "Shadow Bound: Verse 01", progress: 75, cover: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 30, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    initTabs();
});

function initFirebase() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('userName').innerText = user.displayName || "Admin12";
            document.getElementById('userEmail').innerText = user.email;
            if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
            loadUserContent(); // Muat kandungan pertama
        } else {
            window.location.href = "auth.html";
        }
    });
}

// 3. LOGIK TAB
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const indicator = document.getElementById('tabIndicator');

    tabs.forEach(btn => {
        btn.onclick = () => { // Guna onclick supaya lebih direct
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            if (indicator) {
                indicator.style.width = btn.offsetWidth + "px";
                indicator.style.left = btn.offsetLeft + "px";
            }

            const tab = btn.getAttribute('data-tab');
            const grid = document.getElementById('readingList');
            const analytics = document.getElementById('analyticsSection');

            analytics.classList.add('hidden');
            grid.innerHTML = '';

            if (tab === 'reading') loadUserContent();
            else if (tab === 'saved') displaySaved();
            else if (tab === 'my-novels') {
                loadMyNovels();
                analytics.classList.remove('hidden');
            }
        };
    });
}

// 4. FUNGSI PAPARAN KANDUNGAN
function loadUserContent() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userReading.map(n => `
        <div class="profile-novel-card group cursor-pointer">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img src="${n.cover}" class="w-full h-full object-cover">
            </div>
            <h4 class="text-sm font-bold truncate mb-2">${n.title}</h4>
            <div class="progress-container mb-2"><div class="progress-bar" style="width: ${n.progress}%"></div></div>
            <span class="text-[8px] font-black text-gray-500 uppercase">${n.progress}% Dibaca</span>
        </div>
    `).join('');
}

// FUNGSI YANG HILANG TADI
async function displaySaved() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Memuatkan simpanan...</p>';
    
    try {
        const user = firebase.auth().currentUser;
        const db = firebase.firestore();
        const snapshot = await db.collection('users').doc(user.uid).collection('bookmarks').get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Tiada simpanan</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            grid.innerHTML += `
                <div class="profile-novel-card group cursor-pointer">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                        <img src="${n.image}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-sm font-bold truncate mb-1">${n.title}</h4>
                    <p class="text-[9px] text-purple-500 font-black uppercase tracking-widest">${n.genre}</p>
                </div>`;
        });
    } catch (e) {
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-[10px]">Ralat data.</p>';
    }
}

function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');

    grid.innerHTML = myNovels.map(n => `
        <div class="profile-novel-card group">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4"><img src="${n.cover}" class="w-full h-full object-cover"></div>
            <h4 class="text-sm font-bold truncate">${n.title}</h4>
        </div>`).join('');

    tableBody.innerHTML = myNovels.map((n, index) => `
        <tr class="hover:bg-white/[0.02] border-b border-white/5 text-xs text-gray-400">
            <td class="px-6 py-4 font-bold text-white">${n.title}</td>
            <td class="px-6 py-4">${n.views}</td>
            <td class="px-6 py-4">${n.clicks}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="openEditNovelModal(${index})" class="text-purple-500 hover:text-white"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        </tr>`).join('');
}

// 5. MODAL & PROFILE ACTIONS
// Pastikan nama fungsi ini sama dengan yang dipanggil di HTML (saveProfile)
window.toggleEditModal = function() {
    document.getElementById('editModal').classList.toggle('hidden');
}

window.saveProfile = async function() {
    const newName = document.getElementById('editName').value;
    const user = firebase.auth().currentUser;
    if (user && newName) {
        try {
            await user.updateProfile({ displayName: newName });
            document.getElementById('userName').innerText = newName;
            toggleEditModal();
            alert("Nama dikemaskini!");
        } catch (error) { alert(error.message); }
    }
}

window.openEditNovelModal = function(index) {
    document.getElementById('editNovelId').value = index;
    document.getElementById('editNovelTitle').value = myNovels[index].title;
    document.getElementById('editNovelCover').value = myNovels[index].cover;
    document.getElementById('editNovelModal').classList.remove('hidden');
}

window.closeEditNovelModal = function() {
    document.getElementById('editNovelModal').classList.add('hidden');
}

document.getElementById('editNovelForm').onsubmit = (e) => {
    e.preventDefault();
    const index = document.getElementById('editNovelId').value;
    myNovels[index].title = document.getElementById('editNovelTitle').value;
    myNovels[index].cover = document.getElementById('editNovelCover').value;
    closeEditNovelModal();
    loadMyNovels();
};

window.logout = function() {
    firebase.auth().signOut().then(() => { window.location.href = "index.html"; });
}
