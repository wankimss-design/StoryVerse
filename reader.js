// Global State
let currentFontSize = parseInt(localStorage.getItem('readerFontSize')) || 18;
let currentFontFamily = localStorage.getItem('readerFontFamily') || 'Lora';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel StoryVerse";
    const chapter = parseInt(params.get('chapter')) || 1;

    // 1. Inisialisasi UI
    updateHeaderUI(title, chapter);
    loadChapterContent(chapter);
    applyStoredSettings();

    // 2. Firebase Sync (Sejarah Pembacaan)
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            saveHistoryToFirebase(user.uid, title, chapter);
        }
    });
});

// --- PENGURUSAN KANDUNGAN ---

function updateHeaderUI(title, chapter) {
    document.getElementById('readerNovelTitle').innerText = title;
    document.getElementById('readerChapterNum').innerText = `Bab ${chapter.toString().padStart(2, '0')}`;
    document.getElementById('chapterTitleDisplay').innerText = `Bahagian Ke-${chapter}`;
    document.title = `Bab ${chapter} - ${title}`;
    document.getElementById('prevBtn').disabled = (chapter <= 1);
}

function loadChapterContent(chapter) {
    const content = document.getElementById('novelContent');
    // Simulasi data bab (Sesuai dengan niche romance fiction anda)
    content.innerHTML = `
        <p>Dia berdiri di sana, di bawah rintik hujan yang kian lebat, memerhatikan bayang-bayang yang semakin menjauh. Aliff tahu, setiap langkah yang diambilnya malam ini adalah satu pengkhianatan kepada hatinya sendiri.</p>
        <p>"Kenapa sekarang?" bisiknya perlahan. Suaranya hilang ditelan deru angin. Di tangannya, sehelai nota lama yang kian luntur tulisannya digenggam erat. Rahsia yang disimpan selama sepuluh tahun akhirnya terbongkar di hadapan matanya.</p>
        <p>Tiba-tiba, satu cahaya lembut muncul dari hujung jalan. Bukan cahaya lampu jalan, tetapi sesuatu yang lebih murni. Sesuatu yang mengingatkannya kepada janji yang pernah dibuatnya di dimensi yang lain. Cinta ini mungkin mustahil, tetapi Aliff tidak akan sesekali berpaling lagi.</p>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SISTEM TETAPAN (FONT & TEMA) ---

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('translate-y-full');
}

function changeFontSize(delta) {
    currentFontSize += delta;
    if (currentFontSize < 14) currentFontSize = 14;
    if (currentFontSize > 32) currentFontSize = 32;
    
    updateTypography();
    localStorage.setItem('readerFontSize', currentFontSize);
}

function changeFontFace(family) {
    currentFontFamily = family;
    updateTypography();
    localStorage.setItem('readerFontFamily', family);
}

function applyStoredSettings() {
    updateTypography();
}

function updateTypography() {
    const content = document.getElementById('novelContent');
    const display = document.getElementById('fontSizeDisplay');
    
    content.style.fontSize = `${currentFontSize}px`;
    content.style.fontFamily = currentFontFamily;
    if (display) display.innerText = `${currentFontSize}px`;
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeIcon');
    const isLight = document.body.classList.contains('light-mode');
    
    icon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
}

// --- NAVIGASI BAB ---

function changeChapter(direction) {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    let chapter = parseInt(params.get('chapter')) || 1;
    
    chapter += direction;
    if (chapter < 1) return;

    // Kekalkan params sedia ada (termasuk cover jika ada)
    params.set('chapter', chapter);
    window.location.href = `reader.html?${params.toString()}`;
}

// --- FIREBASE HISTORY ---

async function saveHistoryToFirebase(uid, title, chapter) {
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    try {
        await db.collection('users').doc(uid).collection('history').doc(novelId).set({
            title: title,
            lastChapter: chapter,
            lastRead: firebase.firestore.FieldValue.serverTimestamp(),
            novelId: novelId
        }, { merge: true });
    } catch (e) {
        console.error("Sejarah tidak dapat disimpan:", e);
    }
}
