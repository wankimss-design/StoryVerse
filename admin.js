let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }
});

function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genreDropdown.classList.toggle('hidden');
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

            genreDisplay.innerText = selectedGenres.length > 0 
                ? selectedGenres.join(', ').toUpperCase() 
                : "PILIH GENRE...";
        });
    });

    window.addEventListener('click', (e) => {
        if (!genreToggle.contains(e.target) && !genreDropdown.contains(e.target)) {
            genreDropdown.classList.add('hidden');
            genreChevron?.classList.remove('rotate');
        }
    });
}

let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }
});

function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genreDropdown.classList.toggle('hidden');
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

            genreDisplay.innerText = selectedGenres.length > 0 
                ? selectedGenres.join(', ').toUpperCase() 
                : "PILIH GENRE...";
        });
    });

    window.addEventListener('click', (e) => {
        if (!genreToggle.contains(e.target) && !genreDropdown.contains(e.target)) {
            genreDropdown.classList.add('hidden');
            genreChevron?.classList.remove('rotate');
        }
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

async function saveNovel(e) {
    e.preventDefault();
    const btn = document.getElementById('mainSubmitBtn');
    const title = document.getElementById('newTitle').value;
    const synopsis = document.getElementById('newSinopsis').value;
    const fileInput = document.getElementById('coverFile');
    const file = fileInput.files[0];

    // Validasi
    if (!title || selectedGenres.length === 0) {
        alert("Sila isi tajuk dan pilih sekurang-kurangnya satu genre!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

        let base64Image = "";
        
        // Jika ada gambar dipilih, tukar ke Base64
        if (file) {
            // Optional: Hadkan saiz fail (Firestore ada had 1MB se-dokumen)
            if (file.size > 800000) { // 800KB
                alert("Fail terlalu besar! Sila guna gambar bawah 800KB.");
                btn.disabled = false;
                btn.innerHTML = 'Publish Novel';
                return;
            }
            base64Image = await convertToBase64(file);
        }

        // Simpan ke Firestore
        await db.collection('novels').add({
            title: title,
            synopsis: synopsis,
            genres: selectedGenres,
            coverImage: base64Image, // Data Base64 disimpan di sini
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Karya berjaya diterbitkan!');
        
        // Reset Form
        document.getElementById('newNovelForm').reset();
        document.getElementById('fileNameDisplay').innerText = "PILIH GAMBAR";
        selectedGenres = [];
        document.getElementById('selectedGenresDisplay').innerText = "PILIH GENRE...";
        document.querySelectorAll('.genre-item').forEach(item => item.classList.remove('selected'));

    } catch (err) {
        console.error("Ralat:", err);
        alert('Gagal menyimpan. Pastikan saiz gambar tidak terlalu besar.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
}
// Fungsi menukar fail gambar ke Base64 string
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Tambahan: Papar nama fail bila dipilih
document.getElementById('coverFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || "PILIH GAMBAR";
    document.getElementById('fileNameDisplay').innerText = fileName.toUpperCase();
});
