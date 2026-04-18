// 1. DEKLARASI GLOBAL
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', () => {
    initGenreLogic();
    initThemeLogic();
    initNovelDropdownLogic(); 
    fetchNovels(); // Memanggil data dengan filter authorId
    
    const novelForm = document.getElementById('newNovelForm');
    if (novelForm) {
        novelForm.addEventListener('submit', saveNovel);
    }

    const chapterForm = document.getElementById('updateChapterForm');
    if (chapterForm) {
        chapterForm.addEventListener('submit', saveChapter);
    }

    document.getElementById('coverFile')?.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || "PILIH GAMBAR";
        const display = document.getElementById('fileNameDisplay');
        if (display) display.innerText = fileName.toUpperCase();
    });
});

// 2. PAPAR DATA REAL-TIME (Hanya milik penulis yang login)
async function fetchNovels() {
    const tbody = document.getElementById('novelTableBody');
    const optionsList = document.getElementById('novelOptionsList'); 
    const novelDisplay = document.getElementById('selectedNovelDisplay');
    const hiddenInput = document.getElementById('selectNovel');

    if (!tbody) return;

    // Tunggu status login sebelum tarik data
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // TAPIS: .where('authorId', '==', user.uid)
            db.collection('novels')
                .where('authorId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    tbody.innerHTML = ''; 
                    if (optionsList) optionsList.innerHTML = ''; 

                    if (snapshot.empty) {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-gray-500">Anda belum mempunyai karya.</td></tr>`;
                        return;
                    }

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        
                        // Isi Table
                        const row = `
                            <tr class="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all group">
                                <td class="px-6 py-4">
                                    <img src="${data.coverImage || 'https://via.placeholder.com/150'}" class="w-12 h-16 object-cover rounded-lg shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                                </td>
                                <td class="px-6 py-4">
                                    <p class="font-bold text-white group-hover:text-purple-400 transition-colors uppercase text-sm">${data.title}</p>
                                    <p class="text-[10px] text-gray-500 mt-1 uppercase">ID: ${doc.id.substring(0,8)}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1">
                                        ${data.genres ? data.genres.map(g => `<span class="px-2 py-0.5 bg-purple-600/10 text-purple-400 text-[9px] font-black rounded border border-purple-500/20 uppercase">${g}</span>`).join('') : '-'}
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="deleteNovel('${doc.id}')" class="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>`;
                        tbody.innerHTML += row;

                        // Isi Dropdown Tambah Bab
                        if (optionsList) {
                            const item = document.createElement('div');
                            item.className = "p-4 cursor-pointer border-b border-white/5 last:border-0 transition-all uppercase text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/5";
                            item.innerText = data.title;
                            item.onclick = () => {
                                hiddenInput.value = doc.id;
                                novelDisplay.innerText = data.title.toUpperCase();
                                novelDisplay.classList.remove('text-gray-400');
                                novelDisplay.classList.add('text-white');
                                document.getElementById('novelDropdown').classList.add('hidden');
                                document.getElementById('novelChevron').classList.remove('rotate-180');
                            };
                            optionsList.appendChild(item);
                        }
                    });
                }, (error) => {
                    console.error("Ralat Snapshot:", error);
                    if (error.code === 'failed-precondition') {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-amber-500 text-xs">Sila klik pautan di Console Log untuk cipta Index Firestore.</td></tr>`;
                    }
                });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-red-500">Sila log masuk.</td></tr>`;
        }
    });
}

// 3. LOGIK UI UNTUK DROPDOWN NOVEL
function initNovelDropdownLogic() {
    const novelToggle = document.getElementById('novelToggle');
    const novelDropdown = document.getElementById('novelDropdown');
    const novelChevron = document.getElementById('novelChevron');

    if (novelToggle) {
        novelToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            novelDropdown.classList.toggle('hidden');
            novelChevron.classList.toggle('rotate-180');
        });
    }

    window.addEventListener('click', () => {
        novelDropdown?.classList.add('hidden');
        novelChevron?.classList.remove('rotate-180');
    });
}

// 4. FUNGSI SIMPAN NOVEL BARU
async function saveNovel(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Sila log masuk untuk menerbitkan karya!");
        return;
    }

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
                alert("Fail terlalu besar (max 800KB).");
                throw new Error("File too large");
            }
            base64Image = await convertToBase64(file);
        }

        await db.collection('novels').add({
            title: title,
            synopsis: synopsis,
            genres: selectedGenres,
            coverImage: base64Image,
            authorId: user.uid, 
            authorName: user.displayName || "Penulis StoryVerse",
            views: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Karya berjaya diterbitkan!');
        e.target.reset();
        document.getElementById('fileNameDisplay').innerText = "PILIH GAMBAR";
        selectedGenres = [];
        resetGenreUI();

    } catch (err) {
        console.error("Ralat:", err);
        if (err.message !== "File too large") alert('Gagal menyimpan.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Publish Novel <i class="fa-solid fa-paper-plane text-xs"></i>';
    }
}

// 5. FUNGSI SIMPAN BAB
async function saveChapter(e) {
    e.preventDefault();
    const novelId = document.getElementById('selectNovel').value;
    const chapterNum = document.getElementById('chapterNum').value;
    const chapterTitle = document.getElementById('chapterTitle').value;
    const content = document.getElementById('chapterContent').value;
    const btn = e.target.querySelector('button');

    if (!novelId || !chapterNum || !chapterTitle || !content) {
        alert("Sila lengkapkan maklumat bab!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Menyimpan... <i class="fa-solid fa-spinner fa-spin"></i>';

        await db.collection('novels').doc(novelId).collection('chapters').doc(chapterNum).set({
            chapterNumber: parseInt(chapterNum),
            title: chapterTitle,
            content: content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert(`Bab ${chapterNum} berjaya disimpan!`);
        e.target.reset();
        document.getElementById('selectedNovelDisplay').innerText = "Pilih Novel Untuk Bab...";
        document.getElementById('selectNovel').value = ""; 

    } catch (err) {
        console.error("Ralat bab:", err);
        alert("Gagal menyimpan bab.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Bab <i class="fa-solid fa-floppy-disk text-xs"></i>';
    }
}

// --- LOGIK UI TAMBAHAN ---

function initGenreLogic() {
    const genreToggle = document.getElementById('genreToggle');
    const genreDropdown = document.getElementById('genreDropdown');
    const genreDisplay = document.getElementById('selectedGenresDisplay');

    if (!genreToggle || !genreDropdown) return;

    genreToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genreDropdown.classList.toggle('hidden');
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
            genreDisplay.innerText = selectedGenres.length > 0 ? selectedGenres.join(', ').toUpperCase() : "PILIH GENRE...";
        });
    });
}

function resetGenreUI() {
    const display = document.getElementById('selectedGenresDisplay');
    if(display) display.innerText = "PILIH GENRE...";
    document.querySelectorAll('.genre-item').forEach(item => item.classList.remove('selected'));
}

function initThemeLogic() {
    const applyTheme = (isLight) => {
        isLight ? document.body.classList.add('light-mode') : document.body.classList.remove('light-mode');
    };
    document.querySelectorAll('.themeToggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const isLight = !document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            applyTheme(isLight);
        });
    });
    if (localStorage.getItem('theme') === 'light') applyTheme(true);
}

async function deleteNovel(id) {
    if (confirm('Padam karya ini secara kekal?')) {
        await db.collection('novels').doc(id).delete();
    }
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
