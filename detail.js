// --- 1. AMBIL DATA DARI URL ---
// Contoh: detail.html?title=Cinta%20Di%20Balik%20Dimensi
const urlParams = new URLSearchParams(window.location.search);
const novelTitleParam = urlParams.get('title');

// Data Simulasi (Sama seperti di katalog)
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
    // Cari novel berdasarkan tajuk atau ID
    const novel = novels.find(n => n.title === novelTitleParam) || novels[0];

    // Setkan ID unik sementara (Sangat penting untuk Firestore)
    // Jika data anda dari Firestore nanti, guna n.id
    novel.id = novel.title.replace(/\s+/g, '-').toLowerCase(); 

    document.getElementById('novelTitle').innerText = novel.title;
    document.getElementById('novelAuthor').innerText = novel.author;
    document.getElementById('novelGenre').innerText = novel.genre;
    document.getElementById('novelStatus').innerText = novel.status;
    document.getElementById('novelCover').src = novel.cover;
    document.getElementById('novelSinopsis').innerText = novel.sinopsis;
    document.getElementById('authorInitial').innerText = novel.author.charAt(0);
    
    document.title = `${novel.title} | StoryVerse`;

    // Tambahan: Semak sama ada novel ini sudah disimpan atau belum bila page di-load
    checkIfBookmarked(novel.id);
}

// Fungsi untuk tukar ikon secara automatik bila page dibuka
async function checkIfBookmarked(novelId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);
    const doc = await docRef.get();
    
    const saveIcon = document.getElementById('saveIcon');
    if (doc.exists()) {
        saveIcon.className = "fa-solid fa-bookmark text-xl text-purple-500";
    }
}

// Kemas kini fungsi toggleBookmark anda sedikit
async function toggleBookmark() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Sila log masuk untuk menyimpan novel!");
        return;
    }

    const saveIcon = document.getElementById('saveIcon');
    // Kita guna tajuk sebagai ID jika param ID di URL tiada
    const novelId = urlParams.get('id') || document.getElementById('novelTitle').innerText.replace(/\s+/g, '-').toLowerCase();
    
    const novelData = {
        id: novelId,
        title: document.getElementById('novelTitle').innerText,
        image: document.getElementById('novelCover').src,
        genre: document.getElementById('novelGenre').innerText,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);

    try {
        const doc = await docRef.get();
        if (doc.exists()) {
            await docRef.delete();
            saveIcon.className = "fa-regular fa-bookmark text-xl text-white";
            alert("Dibuang dari simpanan.");
        } else {
            await docRef.set(novelData);
            saveIcon.className = "fa-solid fa-bookmark text-xl text-purple-500";
            alert("Disimpan ke profil!");
        }
    } catch (error) {
        console.error("Error bookmarking:", error);
    }
}
