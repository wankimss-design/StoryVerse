// Tunggu sehingga DOM sedia
document.addEventListener('DOMContentLoaded', () => {
    loadKatalog();
});

async function loadKatalog() {
    const gridContainer = document.querySelector('.katalog-grid');
    if (!gridContainer) return;

    // Sini nanti kita sambung dengan Firebase Firestore
    // Contoh cara tarik data:
    /*
    const snapshot = await firebase.firestore().collection('novels').get();
    gridContainer.innerHTML = ''; // Kosongkan placeholder
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        gridContainer.innerHTML += createNovelCard(data);
    });
    */
    
    console.log("Katalog JS sedia untuk ditarik dari Firebase!");
}

// Fungsi Helper untuk bina HTML kad
function createNovelCard(data) {
    return `
        <div class="novel-card">
            <div class="cover-wrapper">
                <img src="${data.coverUrl || 'placeholder.jpg'}" alt="${data.title}">
                <div class="novel-info-overlay">
                    <button class="bg-purple-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-purple-500 transition">
                        BACA SEKARANG
                    </button>
                </div>
            </div>
            <h3 class="novel-title">${data.title}</h3>
            <p class="novel-author">Oleh @${data.authorName}</p>
        </div>
    `;
}
