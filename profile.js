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
    initTheme();
});

function initFirebase() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const db = firebase.firestore();
            document.getElementById('userEmail').innerText = user.email;

            // Pastikan kita ada elemen imej profil di halaman ini
            const userAvatar = document.getElementById('userAvatar');

            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('userName').innerText = data.name || user.displayName || "Admin12";
                    document.getElementById('userBio').innerText = data.bio || "Tiada bio lagi.";
                    
                    // AMBIL GAMBAR TERBARU:
                    // Jika ada di Firestore, guna Firestore. Jika tidak, guna Firebase Auth.
                    if (userAvatar) {
                        userAvatar.src = data.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=a855f7&color=fff`;
                    }
                } else {
                    document.getElementById('userName').innerText = user.displayName || "Admin12";
                }
            } catch (e) {
                console.log("Ralat mengambil data Firestore");
            }
            
            loadUserContent(); 
        } else {
            window.location.href = "index.html";
        }
    });
}
// 3. LOGIK TABS & SCROLL
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const indicator = document.getElementById('tabIndicator');

    tabs.forEach(btn => {
        btn.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            if (indicator) {
                indicator.style.width = btn.offsetWidth + "px";
                indicator.style.left = btn.offsetLeft + "px";
            }
            switchTabContent(btn.getAttribute('data-tab'));
        };
    });
}

function switchTabContent(tab) {
    const grid = document.getElementById('readingList');
    const analytics = document.getElementById('analyticsSection');
    const scrollWrapper = document.getElementById('scrollWrapper');

    // Reset scroll position ke atas
    if(scrollWrapper) scrollWrapper.scrollTop = 0;

    analytics.classList.add('hidden');
    grid.innerHTML = '';

    if (tab === 'reading') loadUserContent();
    else if (tab === 'saved') window.displaySaved();
    else if (tab === 'my-novels') {
        loadMyNovels();
        analytics.classList.remove('hidden');
    }
}

// 4. PAPARAN KANDUNGAN
function loadUserContent() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userReading.map(n => `
        <div class="profile-novel-card">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4"><img src="${n.cover}" class="w-full h-full object-cover"></div>
            <h4 class="text-sm font-bold truncate mb-2">${n.title}</h4>
            <div class="progress-container mb-2"><div class="progress-bar" style="width: ${n.progress}%"></div></div>
            <span class="text-[8px] font-black text-gray-500 uppercase">${n.progress}% Dibaca</span>
        </div>
    `).join('');
}

window.displaySaved = async function() {
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
                <div class="profile-novel-card">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                        <img src="${n.image}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-sm font-bold truncate mb-1">${n.title}</h4>
                    <p class="text-[9px] text-purple-500 font-black uppercase tracking-widest">${n.genre || 'Novel'}</p>
                </div>`;
        });
    } catch (e) {
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-[10px]">Gagal memuatkan data Firestore.</p>';
    }
}

function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');
    
    grid.innerHTML = myNovels.map(n => `
        <div class="profile-novel-card">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4"><img src="${n.cover}" class="w-full h-full object-cover"></div>
            <h4 class="text-sm font-bold truncate">${n.title}</h4>
            <span class="text-[9px] text-purple-500 font-black uppercase">Karya Anda</span>
        </div>`).join('');

    tableBody.innerHTML = myNovels.map((n, index) => `
        <tr class="hover:bg-white/[0.02] border-b border-white/5 text-xs text-gray-400">
            <td class="px-6 py-4 font-bold text-white">${n.title}</td>
            <td class="px-6 py-4">${n.views}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="openEditNovelModal(${index})" class="text-purple-500 hover:text-white"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        </tr>`).join('');
}

// 5. EDIT PROFIL & MEDIA
window.previewImage = function(input) {
    const fileName = input.files[0]?.name || "Pilih fail gambar...";
    document.getElementById('fileNameDisplay').innerText = fileName;
};

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

window.saveProfile = async function() {
    const btn = event.target;
    const newName = document.getElementById('editName').value.trim();
    const newBio = document.getElementById('editBio').value.trim();
    const photoFile = document.getElementById('editPhotoFile').files[0];
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    if (!user) return;

    try {
        btn.innerText = "Menyimpan...";
        btn.disabled = true;

        let finalPhoto = document.getElementById('userAvatar').src;

        if (photoFile) {
            if (photoFile.size > 1048487) { 
                alert("Gambar terlalu besar (Had 1MB)!");
                btn.innerText = "Simpan";
                btn.disabled = false;
                return;
            }
            finalPhoto = await toBase64(photoFile);
        }

        await db.collection('users').doc(user.uid).set({
            name: newName,
            bio: newBio,
            photoURL: finalPhoto
        }, { merge: true });

        document.getElementById('userName').innerText = newName;
        document.getElementById('userBio').innerText = newBio;
        document.getElementById('userAvatar').src = finalPhoto;

        window.toggleEditModal();
        alert("Profil dikemaskini!");
    } catch (error) {
        alert("Ralat!");
    } finally {
        btn.innerText = "Simpan";
        btn.disabled = false;
    }
};

window.toggleEditModal = function() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('editName').value = document.getElementById('userName').innerText;
        document.getElementById('editBio').value = document.getElementById('userBio').innerText;
    }
}

function initTheme() {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;

    const icon = themeBtn.querySelector('i');

    // 1. SEMAK SEMASA LOAD: Ambil tema yang disimpan sebelum ini
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    // 2. LOGIK KLIK: Tukar tema bila butang ditekan
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    };
}

window.logout = () => firebase.auth().signOut().then(() => window.location.href = "index.html");
