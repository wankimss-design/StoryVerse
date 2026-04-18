/* --- STORYVERSE PROFILE ENGINE --- */

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    initTabs();
    initTheme(); // <--- Tambah ini untuk fungsi Light/Dark mode
});

// 1. TEMA (LIGHT/DARK MODE)
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if(themeIcon) themeIcon.className = 'fa-solid fa-sun text-xs';
        } else {
            document.body.classList.remove('light-mode');
            if(themeIcon) themeIcon.className = 'fa-solid fa-moon text-xs';
        }
    };

    // Muat tema dari storage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

// 2. INITIALIZATION & AUTH CHECK
function initFirebase() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            document.getElementById('userEmail').innerHTML = `<i class="fa-regular fa-envelope opacity-50"></i> ${user.email}`;
            const db = firebase.firestore();
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('userName').innerText = data.name || user.displayName || "Pembaca StoryVerse";
                    document.getElementById('userBio').innerText = data.bio || "Tiada bio lagi.";
                    if (data.photoURL) document.getElementById('userAvatar').src = data.photoURL;
                }
            } catch (e) { console.error(e); }
            loadHistory(); 
        } else {
            window.location.href = "auth.html";
        }
    });
}

// 3. TABS NAVIGATION
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const indicator = document.getElementById('tabIndicator');

    const updateIndicator = (btn) => {
        if(indicator && btn) {
            indicator.style.width = btn.offsetWidth + "px";
            indicator.style.left = btn.offsetLeft + "px";
        }
    };

    // Set indicator awal
    setTimeout(() => updateIndicator(tabs[0]), 500);

    tabs.forEach(btn => {
        btn.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            updateIndicator(btn);
            switchTabContent(btn.getAttribute('data-tab'));
        };
    });
}

function switchTabContent(tab) {
    const grid = document.getElementById('readingList');
    const analytics = document.getElementById('analyticsSection');
    analytics.classList.add('hidden');
    grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase animate-pulse">Memuatkan...</p>';

    if (tab === 'reading') loadHistory();
    else if (tab === 'saved') loadBookmarks();
    else if (tab === 'my-novels') {
        loadMyNovels();
        analytics.classList.remove('hidden');
    }
}

// 4. DATABASE LOADERS (LOGIK GAMBAR DIPERBAIKI)
async function loadHistory() {
    const grid = document.getElementById('readingList');
    const totalReadEl = document.getElementById('totalRead');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const historyRef = db.collection('users').doc(user.uid).collection('history');
        const totalSnapshot = await historyRef.get();
        if(totalReadEl) totalReadEl.innerText = totalSnapshot.size;

        const snapshot = await historyRef.orderBy('lastRead', 'desc').limit(6).get();
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.3em]">Tiada sejarah</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            // Cuba ambil coverImage, jika tiada ambil cover, jika tiada guna placeholder
            const currentCover = n.coverImage || n.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            grid.innerHTML += `
                <div class="group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:scale-105 transition-all duration-500">
                        <img src="${currentCover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xs font-bold truncate group-hover:text-purple-400 transition-colors uppercase italic">${n.title}</h4>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function loadBookmarks() {
    const grid = document.getElementById('readingList');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('bookmarks').get();
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.3em]">Tiada simpanan</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            const currentCover = n.coverImage || n.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            grid.innerHTML += `
                <div class="group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:scale-105 transition-all">
                        <img src="${currentCover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xs font-bold truncate italic uppercase tracking-tighter">${n.title}</h4>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('novels').where('authorId', '==', user.uid).get();
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.3em]">Tiada karya</p>';
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 opacity-50 text-[10px]">Tiada data</td></tr>';
            return;
        }

        grid.innerHTML = '';
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            const currentCover = n.coverImage || n.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            grid.innerHTML += `
                <div class="group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:border-purple-500/50 transition-all">
                        <img src="${currentCover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xs font-bold truncate italic uppercase tracking-tighter">${n.title}</h4>
                </div>`;

            tableBody.innerHTML += `
                <tr class="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                    <td class="px-6 py-4 font-bold text-gray-200 uppercase text-[11px]">${n.title}</td>
                    <td class="px-6 py-4 text-purple-400 font-mono text-xs">${n.views || 0} VIEWS</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="window.location.href='admin.html'" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-600 transition-all">
                            <i class="fa-solid fa-pen-nib text-[10px]"></i>
                        </button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

// 5. PROFILE EDITING & UTILITY
window.toggleEditModal = function() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
};

window.saveProfile = async function() {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const newName = document.getElementById('editName').value;
    const newBio = document.getElementById('editBio').value;
    const photoFile = document.getElementById('editPhotoFile').files[0];

    try {
        let photoURL = document.getElementById('userAvatar').src;
        if (photoFile) {
            const reader = new FileReader();
            photoURL = await new Promise(r => {
                reader.onload = () => r(reader.result);
                reader.readAsDataURL(photoFile);
            });
        }

        await db.collection('users').doc(user.uid).set({
            name: newName, bio: newBio, photoURL: photoURL
        }, { merge: true });

        location.reload();
    } catch (e) { alert("Gagal mengemaskini profil."); }
};

window.logout = () => firebase.auth().signOut().then(() => window.location.href = "auth.html");
