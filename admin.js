const db = firebase.firestore();
let base64Image = "";
let selectedGenres = [];

// --- 1. KESELAMATAN & LOGIN CHECK ---
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        // Pastikan ejaan role tepat seperti di Firestore anda
        if (userDoc.exists && userDoc.data().role === 'Admin / Author') {
            console.log("Akses Admin Diterima");
        } else {
            alert("Anda tiada akses Admin!");
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "login.html";
    }
});

// --- 2. INISIALISASI DATA ---
document.addEventListener('DOMContentLoaded', () => {
    loadNovelList();
    loadNovelTable();
    initTheme(); // Panggil fungsi tema sekali sahaja
    initGenreLogic(); // Panggil fungsi genre
});

// --- 3. LOGIK MULTI-SELECT GENRE ---
function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreChevron = document.getElementById('genreChevron');

    if (genreToggle) {
        genreToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            genreDropdown.classList.toggle('active');
            genreChevron?.classList.toggle('rotate');
        });
    }

    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = item.getAttribute('data-value');
            
            if (selectedGenres.includes(value)) {
                selectedGenres = selectedGenres.filter(g => g !== value);
                item.classList.remove('selected');
            } else {
                selectedGenres.push(value);
                item.classList.add('selected');
            }
            updateGenreDisplay();
        });
    });

    window.addEventListener('click', () => {
        genreDropdown?.classList.remove('active');
        genreChevron?.classList.remove('rotate');
    });
}

function updateGenreDisplay() {
    const genreDisplay = document.getElementById('selectedGenresDisplay');
    if (!genreDisplay) return;

    if (selectedGenres.length > 0) {
        genreDisplay.innerText = selectedGenres.join(', ').toUpperCase();
        genreDisplay.classList.add('text-white');
    } else {
        genreDisplay.innerText = "PILIH GENRE...";
        genreDisplay.classList.remove('text-white');
    }
}

// --- 4. UPLOAD GAMBAR KE BASE64 ---
document.getElementById('coverFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            base64Image = reader.result;
            document.getElementById('imagePreview').src = base64Image;
            document.getElementById('previewContainer').classList.remove('hidden');
            document.getElementById('fileNameDisplay').innerText = file.name.toUpperCase();
        };
        reader.readAsDataURL(file);
    }
});

// --- 5. PENYIMPANAN DATA NOVEL ---
document.getElementById('newNovelForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return alert("Sila login!");
    if (selectedGenres.length === 0) return alert("Sila pilih sekurang-kurangnya satu genre!");

    const title = document.getElementById('newTitle').value;
    const novelId = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    const novelData = {
        title: title,
        genre: selectedGenres,
        description: document.getElementById('newSinopsis').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        authorId: user.uid, 
        authorName: userData.name || "Penulis StoryVerse",
        status: "Publish"
    };

    if (base64Image) novelData.image = base64Image;

    try {
        await db.collection('novels').doc(novelId).set(novelData, { merge: true });
        alert("Novel Berjaya Disimpan!");
        location.reload();
    } catch (e) { alert("Ralat: " + e.message); }
});

// --- 6. MUAT SENARAI NOVEL ---
async function loadNovelList() {
    const select = document.getElementById('selectNovel');
    if(!select) return;
    const snapshot = await db.collection('novels').orderBy('title').get();
    select.innerHTML = '<option value="">Pilih Novel...</option>';
    snapshot.forEach(doc => {
        select.innerHTML += `<option value="${doc.id}">${doc.data().title}</option>`;
    });
}

async function loadNovelTable() {
    const tbody = document.getElementById('novelTableBody');
    if(!tbody) return;
    const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const genreLabel = Array.isArray(data.genre) ? data.genre.join(', ') : data.genre;
        
        tbody.innerHTML += `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                <td class="py-5 px-4">
                    <div class="flex items-center gap-4">
                        <img src="${data.image}" class="w-10 h-14 object-cover rounded-lg shadow-lg">
                        <span class="font-bold text-sm">${data.title}</span>
                    </div>
                </td>
                <td class="py-5 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">${genreLabel}</td>
                <td class="py-5 px-4 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="editNovel('${doc.id}')" class="text-purple-500 hover:bg-purple-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all">EDIT</button>
                        <button onclick="deleteNovel('${doc.id}', '${data.title}')" class="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all">PADAM</button>
                    </div>
                </td>
            </tr>`;
    });
}

// --- 7. PENYIMPANAN DATA BAB ---
document.getElementById('updateChapterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const novelId = document.getElementById('selectNovel').value;
    const num = document.getElementById('chapterNum').value;

    try {
        await db.collection('novels').doc(novelId).collection('chapters').doc(`chapter-${num}`).set({
            chapterNumber: parseInt(num),
            title: document.getElementById('chapterTitle').value,
            content: document.getElementById('chapterContent').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert(`Bab ${num} Berjaya Disimpan!`);
        e.target.reset();
    } catch (e) { alert("Gagal Simpan Bab"); }
});

// --- 8. FUNGSI EDIT & PADAM ---
async function editNovel(id) {
    const doc = await db.collection('novels').doc(id).get();
    const data = doc.data();
    
    document.getElementById('newTitle').value = data.title;
    document.getElementById('newSinopsis').value = data.description;

    selectedGenres = Array.isArray(data.genre) ? data.genre : [data.genre];
    document.querySelectorAll('.genre-item').forEach(item => {
        item.classList.toggle('selected', selectedGenres.includes(item.getAttribute('data-value')));
    });
    updateGenreDisplay();

    if (data.image) {
        base64Image = data.image;
        document.getElementById('imagePreview').src = data.image;
        document.getElementById('previewContainer').classList.remove('hidden');
    }
    
    const btn = document.getElementById('mainSubmitBtn');
    if(btn) {
        btn.innerHTML = `Kemaskini Novel <i class="fa-solid fa-arrows-rotate ml-2 text-[10px]"></i>`;
        btn.classList.replace('bg-purple-600', 'bg-emerald-600');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteNovel(id, title) {
    if (confirm(`Padam novel "${title.toUpperCase()}" secara kekal?`)) {
        try {
            await db.collection('novels').doc(id).delete();
            alert("Berjaya dipadam");
            location.reload();
        } catch (e) { alert("Ralat: " + e.message); }
    }
}

// --- 9. THEME TOGGLE LOGIC ---
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        themeIcon?.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        if (themeIcon) {
            if (isLight) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        }
    });
}
