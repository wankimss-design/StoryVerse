// --- 1. AMBIL DATA DARI URL ---
const urlParams = new URLSearchParams(window.location.search);
const novelTitleParam = urlParams.get('title');

// Data Simulasi (Pastikan tajuk sepadan dengan URL)
const novels = [
    { 
        title: "Sumpahan Penulis Terakhir", 
        author: "Ahmad Story",
        genre: "Seram", 
        status: "Complete", 
        cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=800",
        sinopsis: "Kisah seorang penulis yang mendapati setiap perkataan yang ditaipnya menjadi kenyataan yang ngeri. Dia harus menamatkan novelnya sebelum nyawanya sendiri menjadi mangsa plot ciptaannya."
    },
    { 
        title: "Cinta Di Balik Dimensi", 
        author: "Sarah Jane",
        genre: "Romantik", 
        status: "Ongoing", 
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        sinopsis: "Adakah cinta mampu merentasi ruang dan waktu? Aliff mendapati dirinya jatuh cinta dengan seorang gadis dari masa hadapan melalui satu portal rahsia di perpustakaan lama."
    }
];

// --- 2. PAPAR DATA NOVEL ---
function displayDetail() {
    // Cari novel berdasarkan tajuk
    const novel = novels.find(n => n.title === novelTitleParam) || novels[0];

    // Buat ID unik berdasarkan tajuk
    const novelId = novel.title.replace(/\s+/g, '-').toLowerCase(); 

    // Update Elemen HTML (Guna ID yang betul dari HTML anda)
    const titleEl = document.getElementById('detailTitle');
    const genreEl = document.getElementById('detailGenre');
    const statusEl = document.getElementById('detailStatus');
    const coverEl = document.getElementById('detailCover');
    const sinopsisEl = document.getElementById('detailSinopsis');

    if (titleEl) titleEl.innerText = novel.title;
    if (genreEl) genreEl.innerText = novel.genre;
    if (statusEl) statusEl.innerText = novel.status;
    if (coverEl) coverEl.src = novel.cover;
    if (sinopsisEl) sinopsisEl.innerText = novel.sinopsis;
    
    // Update Background Glow
    const glow = document.getElementById('bgGlow');
    if (glow) {
        glow.style.background = `radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, rgba(10,10,10,1) 80%), url('${novel.cover}')`;
        glow.style.backgroundSize = "cover";
    }

    document.title = `${novel.title} | StoryVerse`;

    // Semak bookmark jika Firebase sudah sedia
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        checkIfBookmarked(novelId);
    }
}

// Jalankan fungsi semasa page load
document.addEventListener('DOMContentLoaded', displayDetail);

// --- 3. LOGIK FIREBASE BOOKMARK ---
async function checkIfBookmarked(novelId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);
    const doc = await docRef.get();
    
    const saveIcon = document.querySelector('.fa-heart'); // Guna class ikon hati tadi
    if (doc.exists() && saveIcon) {
        saveIcon.className = "fa-solid fa-heart text-xl text-pink-500";
    }
}

async function toggleBookmark() {
    if (typeof firebase === 'undefined') {
        alert("Firebase belum disambungkan!");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Sila log masuk untuk menyimpan novel!");
        return;
    }

    const saveIcon = document.querySelector('.fa-heart');
    const title = document.getElementById('detailTitle').innerText;
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    
    const novelData = {
        id: novelId,
        title: title,
        image: document.getElementById('detailCover').src,
        genre: document.getElementById('detailGenre').innerText,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);

    try {
        const doc = await docRef.get();
        if (doc.exists()) {
            await docRef.delete();
            saveIcon.className = "fa-solid fa-heart text-xl text-white opacity-40";
            alert("Dibuang dari simpanan.");
        } else {
            await docRef.set(novelData);
            saveIcon.className = "fa-solid fa-heart text-xl text-pink-500";
            alert("Disimpan ke profil!");
        }
    } catch (error) {
        console.error("Error bookmarking:", error);
    }
}
