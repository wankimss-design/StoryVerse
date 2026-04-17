// 1. DATA & INITIALIZATION
const db = firebase.firestore();

const userReading = [
    { title: "Shadow Bound: Verse 01", progress: 75, cover: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 30, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

let myNovels = [
    { title: "Cinta Di Verse 01", views: "1.2k", clicks: "4.5k", status: "Published", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" }
];

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('userName').innerText = user.displayName || "Admin12";
        document.getElementById('userEmail').innerText = user.email;
        if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
        loadUserContent(); 
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) setTimeout(() => moveIndicator(activeTab), 100);
    } else {
        window.location.href = "auth.html";
    }
});

// 2. TAB NAVIGATION LOGIC
function moveIndicator(element) {
    const indicator = document.getElementById('tabIndicator');
    if (indicator) {
        indicator.style.width = element.offsetWidth + "px";
        indicator.style.left = element.offsetLeft + "px";
    }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        moveIndicator(btn);

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

// 3. CONTENT LOADING FUNCTIONS
function loadUserContent() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userReading.map(n => `
        <div class="profile-novel-card group">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4"><img src="${n.cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"></div>
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
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4"><img src="${n.cover}" class="w-full h-full object-cover"></div>
            <h4 class="text-sm font-bold truncate">${n.title}</h4>
            <span class="text-[9px] text-purple-500 font-black uppercase">Admin12</span>
        </div>
    `).join('');

    tableBody.innerHTML = myNovels.map((n, index) => `
        <tr class="hover:bg-white/[0.02] border-b border-white/5">
            <td class="px-6 py-4 font-bold text-white text-xs">${n.title}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.views}</td>
            <td class="px-6 py-4 text-gray-400 text-xs">${n.clicks}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="openEditNovelModal(${index})" class="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 4. EDIT NOVEL LOGIC
function openEditNovelModal(index) {
    const novel = myNovels[index];
    document.getElementById('editNovelId').value = index;
    document.getElementById('editNovelTitle').value = novel.title;
    document.getElementById('editNovelCover').value = novel.cover;
    document.getElementById('editNovelModal').classList.remove('hidden');
}

function closeEditNovelModal() { document.getElementById('editNovelModal').classList.add('hidden'); }

document.getElementById('editNovelForm').onsubmit = (e) => {
    e.preventDefault();
    const index = document.getElementById('editNovelId').value;
    myNovels[index].title = document.getElementById('editNovelTitle').value;
    myNovels[index].cover = document.getElementById('editNovelCover').value;
    alert("Karya dikemaskini!");
    closeEditNovelModal();
    loadMyNovels();
};

// 5. PROFILE & LOGOUT
function toggleEditModal() { document.getElementById('editModal').classList.toggle('hidden'); }
async function saveProfile() {
    const newName = document.getElementById('editName').value;
    const user = firebase.auth().currentUser;
    if (user && newName) {
        await user.updateProfile({ displayName: newName });
        document.getElementById('userName').innerText = newName;
        toggleEditModal();
    }
}
function logout() { firebase.auth().signOut().then(() => window.location.href = "index.html"); }
