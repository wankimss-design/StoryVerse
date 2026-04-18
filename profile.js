/* --- 1. CONFIG & INITIALIZATION --- */
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

            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('userName').innerText = data.name || user.displayName || "Pembaca StoryVerse";
                    document.getElementById('userBio').innerText = data.bio || "Tiada bio lagi.";
                    
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar) {
                        userAvatar.src = data.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=a855f7&color=fff`;
                    }
                }
            } catch (e) {
                console.error("Ralat memuatkan data profil:", e);
            }
            
            // Muatkan Tab Pertama secara automatik
            loadHistory(); 
        } else {
            window.location.href = "index.html";
        }
    });
}

/* --- 2. LOGIK NAVIGASI & TABS --- */
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

    if(scrollWrapper) scrollWrapper.scrollTop = 0;
    analytics.classList.add('hidden');
    grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest animate-pulse">Memuatkan...</p>';

    if (tab === 'reading') loadHistory();
    else if (tab === 'saved') loadBookmarks();
    else if (tab === 'my-novels') {
        loadMyNovels();
        analytics.classList.remove('hidden');
    }
}

// Fungsi untuk pergi ke halaman detail
window.goToDetail = function(novelId) {
    if (novelId) {
        window.location.href = `detail.html?id=${novelId}`;
    }
};

/* --- 3. FUNGSI DATABASE (HISTORY & BOOKMARKS) --- */

// A. Muatkan Sejarah Pembacaan (Real dari Firestore)
async function loadHistory() {
    const grid = document.getElementById('readingList');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('history')
                           .orderBy('lastRead', 'desc').limit(6).get();

        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Tiada rekod pembacaan</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            const novelId = doc.id;
            grid.innerHTML += `
                <div class="profile-novel-card cursor-pointer group" onclick="goToDetail('${novelId}')">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-lg group-hover:scale-105 transition-all duration-300">
                        <img src="${n.cover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-sm font-bold truncate mb-2">${n.title}</h4>
                    <div class="progress-container mb-2"><div class="progress-bar" style="width: ${n.progress}%"></div></div>
                    <span class="text-[8px] font-black text-gray-500 uppercase">${n.progress}% Dibaca</span>
                </div>`;
        });
    } catch (e) {
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-[10px]">Ralat memuatkan sejarah.</p>';
    }
}

// B. Muatkan Simpanan (Bookmarks)
async function loadBookmarks() {
    const grid = document.getElementById('readingList');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('bookmarks').get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Tiada simpanan</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            const novelId = n.novelId || doc.id;
            grid.innerHTML += `
                <div class="profile-novel-card cursor-pointer group" onclick="goToDetail('${novelId}')">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-lg group-hover:scale-105 transition-all duration-300">
                        <img src="${n.image || n.cover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-sm font-bold truncate mb-1">${n.title}</h4>
                    <p class="text-[9px] text-purple-500 font-black uppercase tracking-widest">${n.genre || 'Novel'}</p>
                </div>`;
        });
    } catch (e) {
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-[10px]">Ralat memuatkan simpanan.</p>';
    }
}

// C. Muatkan Karya Saya (Novels yang dicipta oleh User)
async function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        // Ambil novel di mana authorId == user.uid
        const snapshot = await db.collection('novels').where('authorId', '==', user.uid).get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest">Anda belum menulis novel</p>';
            tableBody.innerHTML = '';
            return;
        }

        grid.innerHTML = '';
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const n = doc.data();
            const novelId = doc.id;

            // Paparan Grid
            grid.innerHTML += `
                <div class="profile-novel-card cursor-pointer group" onclick="goToDetail('${novelId}')">
                    <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-lg group-hover:scale-105 transition-all duration-300">
                        <img src="${n.cover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-sm font-bold truncate">${n.title}</h4>
                    <span class="text-[9px] text-purple-500 font-black uppercase tracking-widest">Karya Anda</span>
                </div>`;

            // Paparan Jadual Analitik
            tableBody.innerHTML += `
                <tr class="hover:bg-white/[0.02] border-b border-white/5 text-xs text-gray-400">
                    <td class="px-6 py-4 font-bold text-white">${n.title}</td>
                    <td class="px-6 py-4">${n.views || 0} Views</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="window.location.href='admin.html'" class="text-purple-500 hover:text-white transition-colors">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error(e);
    }
}

/* --- 4. SISTEM EDIT PROFIL (BASE64) --- */
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
            if (photoFile.size > 1048487) { // 1MB Limit
                alert("Gambar terlalu besar (Had 1MB untuk simpanan database)!");
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
        console.error(error);
        alert("Ralat menyimpan profil.");
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
};

/* --- 5. THEME & LOGOUT --- */
function initTheme() {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        icon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}

window.logout = () => firebase.auth().signOut().then(() => window.location.href = "index.html");
