// Global State - Mengambil tetapan simpanan pengguna
let currentFontSize = parseInt(localStorage.getItem('readerFontSize')) || 18;
let currentFontFamily = localStorage.getItem('readerFontFamily') || 'Lora';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel StoryVerse";
    const chapter = parseInt(params.get('chapter')) || 1;

    // 1. Inisialisasi Paparan & Kandungan
    updateHeaderUI(title, chapter);
    loadChapterContent(chapter);
    applyStoredSettings();
    
    // 2. Muat Custom Dropdown Bab (Set kepada 10 bab)
    populateChapterDropdown(10); 

    // 3. Semak tema asal dari localStorage
    if (localStorage.getItem('readerTheme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    // 4. Firebase Sync (Sejarah Pembacaan)
    if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                saveHistoryToFirebase(user.uid, title, chapter);
            }
        });
    }
});

// --- PENGURUSAN CUSTOM DROPDOWN ---

function toggleChapterList() {
    const dropdown = document.getElementById('chapterDropdown');
    const chevron = document.getElementById('chapterChevron');
    if (dropdown) dropdown.classList.toggle('active');
    if (chevron) chevron.classList.toggle('rotate');
}

// Tutup dropdown jika klik di luar kawasan menu
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('chapterDropdown');
    const btn = document.getElementById('chapterBtn');
    if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        document.getElementById('chapterChevron').classList.remove('rotate');
    }
});

function populateChapterDropdown(totalChapters) {
    const list = document.getElementById('chapterList');
    const currentChapterText = document.getElementById('currentChapterText');
    if (!list) return;

    const params = new URLSearchParams(window.location.search);
    const currentChapter = parseInt(params.get('chapter')) || 1;

    list.innerHTML = ''; 
    for (let i = 1; i <= totalChapters; i++) {
        const li = document.createElement('li');
        li.className = `chapter-item ${i === currentChapter ? 'active' : ''}`;
        
        li.innerHTML = `
            <span>Bab ${i.toString().padStart(2, '0')}</span>
            ${i === currentChapter ? '<i class="fa-solid fa-check text-[8px]"></i>' : ''}
        `;
        
        li.onclick = () => {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('chapter', i);
            window.location.href = `reader.html?${newParams.toString()}`;
        };
        
        list.appendChild(li);
    }
    
    // Update teks pada butang navigasi utama
    if (currentChapterText) {
        currentChapterText.innerText = `Bab ${currentChapter.toString().padStart(2, '0')}`;
    }
}

// --- PENGURUSAN UI & KANDUNGAN ---

function updateHeaderUI(title, chapter) {
    const titleEl = document.getElementById('readerNovelTitle');
    const chapDisplayEl = document.getElementById('chapterTitleDisplay');
    const prevBtn = document.getElementById('prevBtn');

    if (titleEl) titleEl.innerText = title;
    if (chapDisplayEl) chapDisplayEl.innerText = `Bahagian Ke-${chapter}`;
    
    document.title = `Bab ${chapter} - ${title}`;
    if (prevBtn) prevBtn.disabled = (chapter <= 1);
}

function loadChapterContent(chapter) {
    const content = document.getElementById('novelContent');
    if (!content) return;

    // Placeholder content - Gantikan dengan fetch data dari database nanti
    content.innerHTML = `
        <p>Dia berdiri di sana, di bawah rintik hujan yang kian lebat, memerhatikan bayang-bayang yang semakin menjauh. Aliff tahu, setiap langkah yang diambilnya malam ini adalah satu pengkhianatan kepada hatinya sendiri.</p>
        <p>"Kenapa sekarang?" bisiknya perlahan. Suaranya hilang ditelan deru angin. Di tangannya, sehelai nota lama yang kian luntur tulisannya digenggam erat. Rahsia yang disimpan selama sepuluh tahun akhirnya terbongkar di hadapan matanya.</p>
        <p>Tiba-tiba, satu cahaya lembut muncul dari hujung jalan. Bukan cahaya lampu jalan, tetapi sesuatu yang lebih murni. Cinta ini mungkin mustahil, tetapi Aliff tidak akan sesekali berpaling lagi.</p>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SISTEM TETAPAN (FONT & TEMA) ---

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('translate-y-full');
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
    
    if (content) {
        content.style.fontSize = `${currentFontSize}px`;
        content.style.fontFamily = currentFontFamily;
    }
    if (display) display.innerText = `${currentFontSize}px`;
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeIcon');
    const isLight = document.body.classList.contains('light-mode');
    
    localStorage.setItem('readerTheme', isLight ? 'light' : 'dark');
    
    if (icon) {
        if (isLight) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }
}

// --- NAVIGASI & FIREBASE ---

function changeChapter(direction) {
    const params = new URLSearchParams(window.location.search);
    let chapter = parseInt(params.get('chapter')) || 1;
    
    chapter += direction;
    if (chapter < 1) return;

    params.set('chapter', chapter);
    window.location.href = `reader.html?${params.toString()}`;
}

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
