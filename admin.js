const db = firebase.firestore();
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
});

function initGenreLogic() {
    const toggleBtn = document.getElementById('genreToggle');
    const dropdown = document.getElementById('genreDropdown');
    const chevron = document.getElementById('genreChevron');
    const display = document.getElementById('selectedGenresDisplay');

    if (!toggleBtn || !dropdown) return;

    // 1. Klik butang untuk buka/tutup
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Halang klik dari sampai ke window
        dropdown.classList.toggle('show');
        chevron.classList.toggle('rotate');
    });

    // 2. Klik item dalam dropdown
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

            // Kemaskini teks paparan
            if (selectedGenres.length > 0) {
                display.innerText = selectedGenres.join(', ').toUpperCase();
                display.classList.replace('text-gray-400', 'text-purple-500');
            } else {
                display.innerText = "PILIH GENRE...";
                display.classList.replace('text-purple-500', 'text-gray-400');
            }
        });
    });

    // 3. Klik di luar untuk tutup dropdown
    window.addEventListener('click', () => {
        dropdown.classList.remove('show');
        chevron.classList.remove('rotate');
    });
}

function initThemeLogic() {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    
    if (!btn) return;

    btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        icon.className = 'fa-solid fa-sun';
    }
}
