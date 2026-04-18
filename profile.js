/* --- STORYVERSE PROFILE ENGINE ---
   Fungsi: Mengurus data user, tab sejarah, simpanan, dan karya penulis.
*/

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    initTabs();
});

// 1. INITIALIZATION & AUTH CHECK
function initFirebase() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // Paparan asas dari Auth
            document.getElementById('userEmail').innerHTML = `<i class="fa-regular fa-envelope opacity-50"></i> ${user.email}`;
            
            const db = firebase.firestore();
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('userName').innerText = data.name || user.displayName || "Pembaca StoryVerse";
                    document.getElementById('userBio').innerText = data.bio || "Tiada bio lagi.";
                    
                    if (data.photoURL) {
                        document.getElementById('userAvatar').src = data.photoURL;
                    }
                }
            } catch (e) {
                console.error("Ralat memuatkan profil:", e);
            }
            
            // Muatkan tab pertama secara automatik
            loadHistory(); 
        } else {
            // Jika tidak login, tendang ke login page
            window.location.href = "auth.html";
        }
    });
}

// 2. TABS NAVIGATION LOGIC
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const indicator = document.getElementById('tabIndicator');

    // Set lebar awal indicator
    if(indicator && tabs[0]) {
        indicator.style.width = tabs[0].offsetWidth + "px";
        indicator.style.left = tabs[0].offsetLeft + "px";
    }

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
    
    // Reset paparan
    analytics.classList.add('hidden');
    grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50 text-[10px] uppercase tracking-widest animate-pulse italic">Memuatkan data...</p>';

    if (tab === 'reading') loadHistory();
    else if (tab === 'saved') loadBookmarks();
    else if (tab === 'my-novels') {
        loadMyNovels();
        analytics.classList.remove('hidden'); // Tunjukkan jadual views untuk penulis
    }
}

// 3. DATABASE LOADERS
async function loadHistory() {
    const grid = document.getElementById('readingList');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('history')
                               .orderBy('lastRead', 'desc').limit(6).get();

        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.3em]">Tiada sejarah pembacaan</p>';
            return;
        }

        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            grid.innerHTML += `
                <div class="group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:scale-105 transition-all duration-500">
                        <img src="${n.cover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xs font-bold truncate group-hover:text-purple-400 transition-colors">${n.title}</h4>
                    <div class="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500" style="width: ${n.progress || 0}%"></div>
                    </div>
                </div>`;
        });
    } catch (e) { grid.innerHTML = 'Ralat data.'; }
}

async function loadMyNovels() {
    const grid = document.getElementById('readingList');
    const tableBody = document.getElementById('trafficTableBody');
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    try {
        const snapshot = await db.collection('novels').where('authorId', '==', user.uid).get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 opacity-30 text-[10px] uppercase tracking-[0.3em]">Anda belum menerbitkan karya</p>';
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 opacity-50 text-[10px]">Tiada data trafik</td></tr>';
            return;
        }

        grid.innerHTML = '';
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const n = doc.data();
            const currentCover = n.coverImage || n.cover || 'https://via.placeholder.com/150';
            
            // Render Grid Imej
            grid.innerHTML += `
                <div class="group cursor-pointer" onclick="window.location.href='detail.html?id=${doc.id}'">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:border-purple-500/50 transition-all">
                        <img src="${currentCover}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-xs font-bold truncate italic uppercase tracking-tighter">${n.title}</h4>
                </div>`;

            // Render Jadual Analitik
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
        }); // <-- Pastikan kurungan penutup forEach di sini
    } catch (e) { 
        console.error("Ralat loadMyNovels:", e); 
    }
}

// 4. PROFILE EDITING SYSTEM
window.toggleEditModal = function() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        document.getElementById('editName').value = document.getElementById('userName').innerText;
        document.getElementById('editBio').value = document.getElementById('userBio').innerText;
    }
};

window.previewImage = function(input) {
    const fileName = input.files[0]?.name || "Pilih fail gambar...";
    document.getElementById('fileNameDisplay').innerText = fileName;
};

window.saveProfile = async function() {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const newName = document.getElementById('editName').value.trim();
    const newBio = document.getElementById('editBio').value.trim();
    const photoFile = document.getElementById('editPhotoFile').files[0];

    if (!newName) return alert("Nama tidak boleh kosong!");

    try {
        let photoURL = document.getElementById('userAvatar').src;

        // Jika ada file gambar baru, tukar ke Base64 (untuk simpanan Firestore mudah)
        if (photoFile) {
            if (photoFile.size > 1048487) return alert("Gambar terlalu besar! Had 1MB.");
            photoURL = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(photoFile);
            });
        }

        await db.collection('users').doc(user.uid).set({
            name: newName,
            bio: newBio,
            photoURL: photoURL
        }, { merge: true });

        // Update UI terus tanpa refresh
        document.getElementById('userName').innerText = newName;
        document.getElementById('userBio').innerText = newBio;
        document.getElementById('userAvatar').src = photoURL;
        
        toggleEditModal();
        alert("Profil berjaya dikemaskini!");
    } catch (e) {
        alert("Ralat menyimpan data.");
    }
};

// 5. UTILITY
window.logout = () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    });
};
