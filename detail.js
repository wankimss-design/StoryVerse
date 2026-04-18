// --- 1. AMBIL DATA DARI URL ---
const urlParams = new URLSearchParams(window.location.search);
const novelTitleParam = urlParams.get('title');

// Data Simulasi
const novels = [
    { 
        title: "Sumpahan Penulis Terakhir", 
        author: "Ahmad Story",
        genre: "Seram", 
        status: "Complete", 
        cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=800",
        sinopsis: "Kisah seorang penulis yang mendapati setiap perkataan yang ditaipnya menjadi kenyataan yang ngeri."
    },
    { 
        title: "Cinta Di Balik Dimensi", 
        author: "Sarah Jane",
        genre: "Romantik", 
        status: "Ongoing", 
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        sinopsis: "Adakah cinta mampu merentasi ruang dan waktu? Aliff mendapati dirinya jatuh cinta dengan seorang gadis dari masa hadapan."
    }
];

// --- 2. PAPAR DATA NOVEL ---
function displayDetail() {
    const novel = novels.find(n => n.title === novelTitleParam) || novels[0];
    const novelId = novel.title.replace(/\s+/g, '-').toLowerCase(); 

    document.getElementById('detailTitle').innerText = novel.title;
    document.getElementById('detailGenre').innerText = novel.genre;
    document.getElementById('detailStatus').innerText = novel.status;
    document.getElementById('detailCover').src = novel.cover;
    document.getElementById('detailSinopsis').innerText = novel.sinopsis;
    
    const glow = document.getElementById('bgGlow');
    if (glow) {
        glow.style.background = `radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, rgba(10,10,10,1) 80%), url('${novel.cover}')`;
        glow.style.backgroundSize = "cover";
    }

    document.title = `${novel.title} | StoryVerse`;

    // --- 3. PENGHUBUNG FIREBASE (KEKALKAN WARNA) ---
    // Tunggu sehingga Firebase Auth sedia
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                checkIfBookmarked(novelId);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', displayDetail);

// --- 4. SEMAK STATUS BOOKMARK DARI FIRESTORE ---
async function checkIfBookmarked(novelId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);
    
    // Listen secara real-time supaya butang sentiasa update
    docRef.onSnapshot((doc) => {
        const saveIcon = document.getElementById('likeIcon');
        if (doc.exists) {
            saveIcon.classList.remove('fa-regular', 'text-white');
            saveIcon.classList.add('fa-solid', 'text-pink-500');
            saveIcon.style.opacity = "1";
        } else {
            saveIcon.classList.remove('fa-solid', 'text-pink-500');
            saveIcon.classList.add('fa-regular', 'text-white');
            saveIcon.style.opacity = "0.4";
        }
    });
}

// --- 5. FUNGSI TEKAN BUTANG LIKE ---
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

    const title = document.getElementById('detailTitle').innerText;
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            await docRef.delete();
            // Notifikasi tidak wajib jika UI sudah berubah sendiri
        } else {
            const novelData = {
                id: novelId,
                title: title,
                image: document.getElementById('detailCover').src,
                genre: document.getElementById('detailGenre').innerText,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await docRef.set(novelData);
        }
    } catch (error) {
        console.error("Error bookmarking:", error);
    }
}
