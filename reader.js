let currentFontSize = 18;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil data dari URL
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel StoryVerse";
    const chapter = parseInt(params.get('chapter')) || 1;

    // 2. Papar Data Awal
    updateUI(title, chapter);

    // 3. Load Content (Simulasi)
    loadStoryContent(chapter);

    // 4. Firebase Sync (History & Bookmark)
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                saveReadingHistory(user.uid, title, chapter);
            }
        });
    }

    // 5. Muat turun saiz font dari storage jika ada
    const savedSize = localStorage.getItem('readerFontSize');
    if (savedSize) {
        currentFontSize = parseInt(savedSize);
        applyFontSize();
    }
});

// --- FUNGSI UTAMA ---

function updateUI(title, chapter) {
    document.getElementById('readerNovelTitle').innerText = title;
    document.getElementById('readerChapterNum').innerText = `Bab ${chapter.toString().padStart(2, '0')}`;
    document.getElementById('chapterTitleDisplay').innerText = `Bahagian Ke-${chapter}`;
    document.title = `Bab ${chapter} - ${title} | StoryVerse`;
    document.getElementById('prevBtn').disabled = (chapter <= 1);
}

function loadStoryContent(chapter) {
    // Di sini anda boleh buat fetch dari Firebase/API berdasarkan chapter
    const contentEl = document.getElementById('novelContent');
    contentEl.innerHTML = `
        <p>Langkah pertamanya terhenti di hadapan sebuah rak buku usang. Udara di sekelilingnya mula bergetar, memancarkan aura biru yang misteri. Dia tahu, ini bukan perpustakaan biasa.</p>
        <p>"Adakah anda bersedia?" satu suara halus berbisik di telinganya. Aliff memalingkan wajah, namun tiada sesiapa di sana. Hanya bayang-bayang buku yang menari mengikut rentak cahaya.</p>
        <p>Dia menyentuh sebuah buku berkulit tebal. Tiba-tiba, ruang di sekelilingnya berpusing. Realiti mula pecah menjadi kepingan dimensi yang tidak logik. Inilah pengembaraan yang dicarinya selama ini.</p>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SISTEM FIREBASE HISTORY ---

async function saveReadingHistory(uid, title, chapter) {
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    const historyRef = db.collection('users').doc(uid).collection('history').doc(novelId);

    try {
        await historyRef.set({
            title: title,
            lastChapter: chapter,
            lastRead: firebase.firestore.FieldValue.serverTimestamp(),
            novelId: novelId
        }, { merge: true });
        console.log("Sejarah disimpan!");
    } catch (e) {
        console.error("Gagal simpan sejarah:", e);
    }
}

// --- TETAPAN PEMBACAAN ---

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('translate-y-full');
}

function changeFontSize(delta) {
    currentFontSize += delta;
    if (currentFontSize < 14) currentFontSize = 14;
    if (currentFontSize > 32) currentFontSize = 32;
    
    applyFontSize();
    localStorage.setItem('readerFontSize', currentFontSize);
}

function applyFontSize() {
    const content = document.getElementById('novelContent');
    content.style.fontSize = `${currentFontSize}px`;
    document.getElementById('fontSizeDisplay').innerText = `${currentFontSize}px`;
}

function changeFontFace(family) {
    document.getElementById('novelContent').style.fontFamily = family;
    localStorage.setItem('readerFontFamily', family);
}

function changeChapter(direction) {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    let chapter = parseInt(params.get('chapter')) || 1;
    
    chapter += direction;
    if (chapter < 1) return;

    window.location.href = `reader.html?title=${encodeURIComponent(title)}&chapter=${chapter}`;
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeIcon');
    const isLight = document.body.classList.contains('light-mode');
    
    icon.classList.toggle('fa-moon', !isLight);
    icon.classList.toggle('fa-sun', isLight);
}
