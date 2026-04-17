firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('userName').innerText = user.displayName || "Pembaca StoryVerse";
        document.getElementById('userEmail').innerText = user.email;
        if (user.photoURL) document.getElementById('userAvatar').src = user.photoURL;
        loadUserContent();
    } else {
        window.location.href = "auth.html";
    }
});

const userReading = [
    { title: "Shadow Bound: Verse 01", progress: 75, cover: "https://images.unsplash.com/photo-1543004218-ee141104975a?q=80&w=400" },
    { title: "Sumpahan Penulis Terakhir", progress: 30, cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=400" }
];

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

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
}
// Data simulasi untuk simpanan (Nanti boleh ambil dari Firestore)
const userSaved = [
    { title: "Cinta Di Balik Dimensi", genre: "Romantik", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" }
];

// Fungsi untuk tukar tab
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        // Tukar rupa butang
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');
        const grid = document.getElementById('readingList');

        if (tab === 'reading') {
            loadUserContent(); // Panggil fungsi asal (Sedang Dibaca)
        } else if (tab === 'saved') {
            displaySaved(); // Panggil fungsi baru (Simpanan)
        }
    };
});

function displaySaved() {
    const grid = document.getElementById('readingList');
    grid.innerHTML = userSaved.map(n => `
        <div class="profile-novel-card group cursor-pointer">
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img src="${n.cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <h4 class="text-sm font-bold truncate mb-1">${n.title}</h4>
            <p class="text-[9px] text-purple-500 font-black uppercase tracking-widest">${n.genre}</p>
        </div>
    `).join('');
}
function toggleEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.toggle('hidden');
    
    // Masukkan nama sedia ada ke dalam input
    if (!modal.classList.contains('hidden')) {
        document.getElementById('editName').value = firebase.auth().currentUser.displayName || "";
    }
}

async function saveProfile() {
    const newName = document.getElementById('editName').value;
    const user = firebase.auth().currentUser;

    if (user) {
        try {
            await user.updateProfile({ displayName: newName });
            document.getElementById('userName').innerText = newName;
            toggleEditModal();
            alert("Profil berjaya dikemaskini!");
        } catch (error) {
            alert("Ralat: " + error.message);
        }
    }
}

// Pastikan butang Edit Profil asal memanggil fungsi ini
document.querySelector('button[onclick="toggleEditModal()"]').onclick = toggleEditModal;
