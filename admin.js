const db = firebase.firestore();

// Logik Simpan Novel
document.getElementById('novelForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('novelTitle').value;
    const genre = document.getElementById('novelGenre').value;
    const cover = document.getElementById('novelCover').value;
    const synopsis = document.getElementById('novelSynopsis').value;

    try {
        // Simpan ke koleksi 'novels' di Firestore
        await db.collection('novels').add({
            title: title,
            genre: genre,
            image: cover,
            description: synopsis,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: "Admin12"
        });

        alert("Novel Berjaya Diterbitkan!");
        document.getElementById('novelForm').reset();
    } catch (error) {
        console.error("Ralat:", error);
        alert("Gagal memuat naik novel.");
    }
});
