const db = firebase.firestore();
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }
});

// LOGIK GENRE
function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron const db = firebase.firestore();
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    // Tambah fungsi lain jika perlu (Theme, Form Submit, dll)
});

function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    // BUKA / TUTUP DROPDOWN
    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // PENTING: Supaya klik ini tidak dikesan oleh window.onclick
        genreDropdown.classList.toggle('active');
        if (genreChevron) genreChevron.classList.toggle('rotate-180');
    });

    // PILIH GENRE
    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // PENTING: Supaya menu tak tutup bila kita pilih item
            const val = item.getAttribute('data-value');
            const icon = item.querySelector('i');

            if (selectedGenres.includes(val)) {
                selectedGenres = selectedGenres.filter(g => g !== val);
                item.classList.remove('selected');
                if (icon) icon.style.opacity = "0";
            } else {
                selectedGenres.push(val);
                item.classList.add('selected');
                if (icon) icon.style.opacity = "1";
            }

            // Kemaskini teks pada butang
            genreDisplay.innerText = selectedGenres.length > 0 ? selectedGenres.join(', ').toUpperCase() : "PILIH GENRE...";
        });
    });

    // TUTUP BILA KLIK DI LUAR
    window.addEventListener('click', () => {
        genreDropdown.classList.remove('active');
        if (genreChevron) genreChevron.classList.remove('rotate-180');
    });
}

// LOGIK TEMA
function initThemeLogic() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            if (isLight) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeIcon?.classList.replace('fa-moon', 'fa-sun');
    }
}

// FUNGSI SIMPAN
async function saveNovel(e) {
    e.preventDefault();
    const btn = document.getElementById('mainSubmitBtn');
    const title = document.getElementById('newTitle').value;

    if (!title || selectedGenres.length === 0) {
        alert("Sila isi tajuk dan genre!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

        await db.collection('novels').add({
            title: title,
            synopsis: document.getElementById('newSinopsis').value,
            genres: selectedGenres,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Berjaya!');
        location.reload();
    } catch (err) {
        console.error(err);
        alert('Gagal!');
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel';
    }
}
