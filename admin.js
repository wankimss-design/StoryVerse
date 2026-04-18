const db = firebase.firestore();
let base64Image = "";

// --- 1. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    loadNovelList();
    loadNovelTable();
});

// --- 2. UPLOAD GAMBAR KE BASE64 ---
document.getElementById('coverFile').addEventListener('change', function(e) {
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

// --- 3. MUAT SENARAI NOVEL (DROPDOWN & TABLE) ---
async function loadNovelList() {
    const select = document.getElementById('selectNovel');
    const snapshot = await db.collection('novels').orderBy('title').get();
    select.innerHTML = '<option value="">Pilih Novel...</option>';
    snapshot.forEach(doc => {
        select.innerHTML += `<option value="${doc.id}">${doc.data().title}</option>`;
    });
}

async function loadNovelTable() {
    const tbody = document.getElementById('novelTableBody');
    const snapshot = await db.collection('novels').orderBy('createdAt', 'desc').get();
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        tbody.innerHTML += `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                <td class="py-5 px-4">
                    <div class="flex items-center gap-4">
                        <img src="${data.image}" class="w-10 h-14 object-cover rounded-lg shadow-lg">
                        <span class="font-bold text-sm">${data.title}</span>
                    </div>
                </td>
                <td class="py-5 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">${data.genre}</td>
                <td class="py-5 px-4 text-center">
                    <button onclick="editNovel('${doc.id}')" class="text-purple-500 hover:bg-purple-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all">EDIT</button>
                </td>
            </tr>`;
    });
}

// --- 4. PENYIMPANAN DATA NOVEL ---
document.getElementById('newNovelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newTitle').value;
    const novelId = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    const novelData = {
        title: title,
        genre: document.getElementById('newGenre').value,
        description: document.getElementById('newSinopsis').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: "Admin StoryVerse",
        status: "Publish"
    };

    if (base64Image) novelData.image = base64Image;

    try {
        await db.collection('novels').doc(novelId).set(novelData, { merge: true });
        alert("Novel Berjaya Disimpan!");
        location.reload();
    } catch (e) { alert("Ralat: " + e.message); }
});

// --- 5. PENYIMPANAN DATA BAB ---
document.getElementById('updateChapterForm').addEventListener('submit', async (e) => {
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

// --- 6. FUNGSI EDIT NOVEL ---
async function editNovel(id) {
    const doc = await db.collection('novels').doc(id).get();
    const data = doc.data();
    
    document.getElementById('newTitle').value = data.title;
    document.getElementById('newGenre').value = data.genre;
    document.getElementById('newSinopsis').value = data.description;
    if (data.image) {
        base64Image = data.image;
        document.getElementById('imagePreview').src = data.image;
        document.getElementById('previewContainer').classList.remove('hidden');
    }
    
    const btn = document.getElementById('mainSubmitBtn');
    btn.innerHTML = `Kemaskini Novel <i class="fa-solid fa-arrows-rotate ml-2 text-[10px]"></i>`;
    btn.classList.replace('bg-purple-600', 'bg-emerald-600');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
