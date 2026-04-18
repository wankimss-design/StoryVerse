// 1. Deklarasi Global (Hanya sekali sahaja)
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }

    // Papar nama fail bila dipilih
    document.getElementById('coverFile')?.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || "PILIH GAMBAR";
        const display = document.getElementById('fileNameDisplay');
        if (display) display.innerText = fileName.toUpperCase();
    });
});

// 2. Logik Genre (Multi-select)
function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genreDropdown.classList.toggle('hidden');
        genreChevron?.classList.toggle('rotate-180');
    });

    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
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

            genreDisplay.innerText = selectedGenres.length > 0 
                ? selectedGenres.join(', ').toUpperCase() 
                : "PILIH GENRE...";
        });
    });

    window.addEventListener('click', (e) => {
        if (!genreToggle.contains(e.target) && !genreDropdown.contains(e.target)) {
            genreDropdown.classList.add('hidden');
            genreChevron?.classList.remove('rotate-180');
        }
    });
}

// 3. Logik Tema (Menyokong Desktop & Mobile)
function initThemeLogic() {
    const themeBtns = document.querySelectorAll('.themeToggle');
    
    const applyTheme = (isLight) => {
        if (isLight) {
            document.body.classList.add('light-mode');
            themeBtns.forEach(btn => {
                const icon = btn.querySelector('i');
                if(icon) icon.className = 'fa-solid fa-sun';
            });
        } else {
            document.body.classList.remove('light-mode');
            themeBtns.forEach(btn => {
                const icon = btn.querySelector('i');
                if(icon) icon.className = 'fa-solid fa-moon';
            });
        }
    };

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isLight = !document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            applyTheme(isLight);
        });
    });

    if (localStorage.getItem('theme') === 'light') {
        applyTheme(true);
    }
}

// 4. Fungsi Simpan (Firestore + Base64)
async function saveNovel(e) {
    e.preventDefault();
    const btn = document.getElementById('mainSubmitBtn');
    const title = document.getElementById('newTitle').value;
    const synopsis = document.getElementById('newSinopsis').value;
    const fileInput = document.getElementById('coverFile');
    const file = fileInput.files[0];

    if (!title || selectedGenres.length === 0) {
        alert("Sila isi tajuk dan pilih sekurang-kurangnya satu genre!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

        let base64Image = "";
        
        if (file) {
            if (file.size > 800000) { 
                alert("Fail terlalu besar! Sila guna gambar bawah 800KB.");
                throw new Error("File too large");
            }
            base64Image = await convertToBase64(file);
        }

        await db.collection('novels').add({
            title: title,
            synopsis: synopsis,
            genres: selectedGenres,
            coverImage: base64Image,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Karya berjaya diterbitkan!');
        
        // Reset Segala-galanya
        document.getElementById('newNovelForm').reset();
        document.getElementById('fileNameDisplay').innerText = "PILIH GAMBAR";
        selectedGenres = [];
        document.getElementById('selectedGenresDisplay').innerText = "PILIH GENRE...";
        document.querySelectorAll('.genre-item').forEach(item => {
            item.classList.remove('selected');
            const icon = item.querySelector('i');
            if(icon) icon.style.opacity = "0";
        });

    } catch (err) {
        console.error("Ralat:", err);
        if (err.message !== "File too large") alert('Gagal menyimpan ke Firestore.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
}

// 5. Helper: Tukar Gambar ke Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
