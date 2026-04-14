document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('novelGrid');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // --- LOGIK TUKAR TEMA ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }

    if (localStorage.getItem('theme') === 'light') body.classList.add('light-mode');

    // --- AMBIL DATA DARI FIRESTORE ---
    async function fetchNovels() {
        if (!grid) return;
        
        grid.innerHTML = '<p class="col-span-full text-center py-10 opacity-50">Menghubungkan ke Story Verse...</p>';

        try {
            // 'db' sudah sedia ada dari fail firebase-config.js
            const snapshot = await db.collection('novels').get();
            
            if (snapshot.empty) {
                grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Tiada novel ditemui.</p>';
                return;
            }

            grid.innerHTML = ''; 

            snapshot.forEach(doc => {
                const data = doc.data();
                const card = `
                    <div class="novel-card group">
                        <div class="card-image-wrapper">
                            <img src="${data.image || 'https://via.placeholder.com/300x450'}" class="card-img" onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
                            <div class="card-badge">${data.tag || 'New'}</div>
                        </div>
                        <h3 class="mt-4 font-bold group-hover:text-purple-500 transition">${data.title || 'Untitled'}</h3>
                        <p class="text-sm text-gray-500 italic">${data.genre || 'General'}</p>
                    </div>
                `;
                grid.innerHTML += card;
            });
        } catch (error) {
            console.error("Error:", error);
            grid.innerHTML = `<p class="col-span-full text-red-500 text-center font-bold">Gagal memuatkan database.</p>`;
        }
    }

    fetchNovels();
});
