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
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genreDropdown.classList.toggle('active');
        genreChevron?.classList.toggle('rotate');
    });

    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = item.getAttribute('data-value');
            const icon = item.querySelector('i');

            if (selectedGenres.includes(val)) {
                selectedGenres = selectedGenres.filter(g => g !== val);
                item.classList.remove('selected');
                icon.style.opacity = "0";
            } else {
                selectedGenres.push(val);
                item.classList.add('selected');
                icon.style.opacity = "1";
            }

            genreDisplay.innerText = selectedGenres.length > 0 ? selectedGenres.join(', ').toUpperCase() : "PILIH GENRE...";
            genreDisplay.style.color = selectedGenres.length > 0 ? (document.body.classList.contains('light-mode') ? "#1b1b1b" : "white") : "#9ca3af";
        });
    });

    window.addEventListener('click', () => {
        genreDropdown.classList.remove('active');
        genreChevron?.classList.remove('rotate');
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
