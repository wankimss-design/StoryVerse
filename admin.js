// 1. INITIALIZE DATABASE & GLOBAL VARIABLES
const db = firebase.firestore();
let selectedGenres = [];

// 2. LOGIK UNTUK GENRE DROPDOWN
function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    // Klik untuk Buka/Tutup dropdown
    genreToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        genreDropdown.classList.toggle('active');
        genreChevron?.classList.toggle('rotate');
    });

    // Pilih Genre (Multi-select)
    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = item.getAttribute('data-value');

            if (selectedGenres.includes(val)) {
                selectedGenres = selectedGenres.filter(g => g !== val);
                item.classList.remove('selected');
            } else {
                selectedGenres.push(val);
                item.classList.add('selected');
            }

            // Kemaskini teks paparan butang
            if (selectedGenres.length > 0) {
                genreDisplay.innerText = selectedGenres.join(', ').toUpperCase();
                genreDisplay.classList.add('text-white');
                genreDisplay.classList.remove('text-gray-400');
            } else {
                genreDisplay.innerText = "PILIH GENRE...";
                genreDisplay.classList.add('text-gray-400');
                genreDisplay.classList.remove('text-white');
            }
        });
    });

    // Tutup dropdown jika klik di luar kawasan
    window.addEventListener('click', () => {
        genreDropdown.classList.remove('active');
        genreChevron?.classList.remove('rotate');
    });
}

// 3. FUNGSI SIMPAN NOVEL KE FIREBASE
async function saveNovel(e) {
    if (e) e.preventDefault(); // Elakkan page refresh

    const title = document.getElementById('newTitle').value;
    const synopsis = document.getElementById('newSinopsis').value;
    const btn = document.getElementById('mainSubmitBtn');

    // Validasi input
    if (!title || selectedGenres.length === 0) {
        alert("Sila isi tajuk dan pilih sekurang-kurangnya satu genre!");
        return;
    }

    try {
        // Loading state
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

        const novelData = {
            title: title,
            synopsis: synopsis,
            genres: selectedGenres,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Simpan ke Firestore
        await db.collection('novels').add(novelData);
        alert('Novel berjaya diterbitkan!');

        // --- RESET FORM ---
        document.getElementById('newNovelForm').reset();
        selectedGenres = []; 
        document.querySelectorAll('.genre-item').forEach(item => item.classList.remove('selected'));
        genreDisplay.innerText = "PILIH GENRE...";
        genreDisplay.classList.replace('text-white', 'text-gray-400');

    } catch (error) {
        console.error("Ralat: ", error);
        alert("Gagal menerbitkan novel. Sila cuba lagi.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
}

// 4. JALANKAN SEMASA PAGE DIBUKA
document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    
    // Bind fungsi saveNovel ke form submit
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }
});
