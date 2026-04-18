const db = firebase.firestore();

// --- 1. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    loadNovelList();
});

// --- 2. MUAT SENARAI NOVEL (Untuk Dropdown di Seksyen Update) ---
async function loadNovelList() {
    const select = document.getElementById('selectNovel');
    if (!select) return;

    try {
        const snapshot = await db.collection('novels').orderBy('title').get();
        select.innerHTML = '<option value="">-- Pilih Novel Untuk Update --</option>';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id; // Ini adalah slug (ID unik dokumen)
            option.textContent = data.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Gagal memuatkan senarai novel:", error);
    }
}

// --- 3. SEKSYEN: TAMBAH NOVEL BARU ---
const newNovelForm = document.getElementById('newNovelForm');
if (newNovelForm) {
    newNovelForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('newTitle').value.trim();
        const genre = document.getElementById('newGenre').value;
        const cover = document.getElementById('newCover').value.trim();
        const sinopsis = document.getElementById('newSinopsis').value.trim();

        if (!title || !sinopsis) {
            alert("Sila isi tajuk dan sinopsis!");
            return;
        }

        // Bina slug unik (Contoh: "Cinta Terlarang" -> "cinta-terlarang")
        const novelId = title.toLowerCase()
                             .replace(/[^\w ]+/g, '') // Buang simbol
                             .replace(/ +/g, '-');    // Tukar ruang ke dash

        try {
            await db.collection('novels').doc(novelId).set({
                title: title,
                genre: genre,
                image: cover || "https://via.placeholder.com/300x450", // Default image jika kosong
                description: sinopsis,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                author: "Admin StoryVerse",
                status: "Publish"
            });

            alert("Novel berjaya didaftarkan ke sistem!");
            newNovelForm.reset();
            loadNovelList(); // Update dropdown secara automatik
        } catch (error) {
            console.error("Ralat simpan novel:", error);
            alert("Gagal mendaftarkan novel.");
        }
    });
}

// --- 4. SEKSYEN: TAMBAH / UPDATE BAB ---
const updateChapterForm = document.getElementById('updateChapterForm');
if (updateChapterForm) {
    updateChapterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novelId = document.getElementById('selectNovel').value;
        const chapNum = document.getElementById('chapterNum').value;
        const chapTitle = document.getElementById('chapterTitle').value.trim();
        const content = document.getElementById('chapterContent').value.trim();

        if (!novelId || !chapNum || !content) {
            alert("Sila pilih novel, nombor bab dan isi kandungan!");
            return;
        }

        try {
            // Simpan bab ke dalam sub-collection 'chapters'
            await db.collection('novels').doc(novelId)
                .collection('chapters').doc(`chapter-${chapNum}`).set({
                    title: chapTitle || `Bab ${chapNum}`,
                    content: content,
                    chapterNumber: parseInt(chapNum),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            alert(`Isi kandungan Bab ${chapNum} berjaya disimpan!`);
            updateChapterForm.reset();
        } catch (error) {
            console.error("Ralat simpan bab:", error);
            alert("Gagal menyimpan bab.");
        }
    });
}
