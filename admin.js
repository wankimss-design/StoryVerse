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

    genreToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        genreDropdown.classList.toggle('active');
        genreChevron?.classList.toggle('rotate');
    });

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

    window.addEventListener('click', () => {
        genreDropdown.classList.remove('active');
        genreChevron?.classList.remove('rotate');
    });
}

// 3. LOGIK TUKAR TEMA (LIGHT/DARK)
function initThemeLogic() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            // Simpan pilihan user dalam local storage (Optional tapi bagus)
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            if (isLight) {
                themeIcon?.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon?.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // Semak tema asal semasa load
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeIcon?.classList.replace('fa-moon', 'fa-sun');
    }
}

// 4. FUNGSI SIMPAN NOVEL KE FIREBASE
async function saveNovel(e) {
    if (e) e.preventDefault();

    const titleInput = document.getElementById('newTitle');
    const synopsisInput = document.getElementById('newSinopsis');
    const btn = document.getElementById('mainSubmitBtn');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!titleInput.value || selectedGenres.length === 0) {
        alert("Sila isi tajuk dan pilih sekurang-kurangnya satu genre!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

        const novelData = {
            title: titleInput.value,
            synopsis: synopsisInput.value,
            genres: selectedGenres,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('novels').add(novelData);
        alert('Novel berjaya diterbitkan!');

        // --- RESET FORM ---
        document.getElementById('newNovelForm').reset();
        selectedGenres = []; 
        document.querySelectorAll('.genre-item').forEach(item => item.classList.remove('selected'));
        genreDisplay.innerText = "PILIH GENRE...";
        genreDisplay.classList.add('text-gray-400');
        genreDisplay.classList.remove('text-white');

    } catch (error) {
        console.error("Ralat: ", error);
        alert("Gagal menerbitkan novel.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
}

// 5. JALANKAN SEMUA
document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }
});
