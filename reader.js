/* --- 1. GLOBAL STATE & CONFIG --- */
const db = firebase.firestore();
let currentNovelData = null;
let currentChapterIndex = 0;
let chaptersList = [];
let currentFontSize = parseInt(localStorage.getItem('readerFontSize')) || 18;
let currentFontFamily = localStorage.getItem('readerFontFamily') || 'Lora';

// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const novelId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (!novelId) {
        alert("Ralat: ID Novel tidak dijumpai.");
        window.location.href = 'katalog.html';
        return;
    }
    
    initFirebase();
    applyStoredSettings();
});

function initFirebase() {
    firebase.auth().onAuthStateChanged(user => {
        loadNovelDetails();
        // Tema asal
        if (localStorage.getItem('readerTheme') === 'light') {
            document.body.classList.add('light-mode');
            const icon = document.getElementById('themeIcon');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

/* --- 2. DATA LOADING --- */

async function loadNovelDetails() {
    try {
        const doc = await db.collection('novels').doc(novelId).get();
        if (doc.exists) {
            currentNovelData = doc.data();
            document.getElementById('readerNovelTitle').innerText = currentNovelData.title;
            
            // Muatkan Senarai Bab
            const chaptersSnap = await db.collection('novels').doc(novelId)
                                     .collection('chapters').orderBy('order', 'asc').get();
            
            chaptersList = [];
            chaptersSnap.forEach(snap => {
                chaptersList.push({ id: snap.id, ...snap.data() });
            });

            if (chaptersList.length > 0) {
                // Check jika URL ada spesifik bab, jika tidak mula dari index 0
                const urlChapter = parseInt(urlParams.get('chapter')) - 1 || 0;
                renderChapter(urlChapter >= 0 && urlChapter < chaptersList.length ? urlChapter : 0);
                renderChapterDropdown();
            }
        }
    } catch (e) {
        console.error("Ralat muat novel:", e);
    }
}

/* --- 3. RENDERING & NAVIGATION --- */

function renderChapter(index) {
    currentChapterIndex = index;
    const chapter = chaptersList[index];
    
    // UI Updates
    document.getElementById('currentChapterText').innerText = `Bab ${String(index + 1).padStart(2, '0')}`;
    document.getElementById('chapterTitleDisplay').innerText = chapter.title;
    document.title = `${chapter.title} - ${currentNovelData.title}`;
    
    // Format Kandungan (Newline -> Paragraph)
    const formattedContent = chapter.content.split('\n').map(p => 
        p.trim() !== "" ? `<p class="mb-6">${p}</p>` : ""
    ).join('');
    
    document.getElementById('novelContent').innerHTML = formattedContent;

    // Navigation Buttons
    document.getElementById('prevBtn').disabled = (index === 0);
    const nextBtn = document.getElementById('nextBtn');
    if (index === chaptersList.length - 1) {
        nextBtn.innerHTML = `Tamat Cerita <i class="fa-solid fa-flag-checkered ml-2"></i>`;
    } else {
        nextBtn.innerHTML = `Seterusnya <i class="fa-solid fa-chevron-right ml-2"></i>`;
    }

    // Sync Functions
    saveHistory(chapter);
    loadComments(); // Muat komen khusus untuk bab ini
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderChapterDropdown() {
    const list = document.getElementById('chapterList');
    list.innerHTML = chaptersList.map((ch, i) => `
        <li onclick="renderChapter(${i}); toggleChapterList()" class="px-6 py-4 hover:bg-purple-500/10 cursor-pointer transition-all border-b border-white/5 flex justify-between items-center ${i === currentChapterIndex ? 'bg-purple-500/5' : ''}">
            <span class="text-[11px] font-bold ${i === currentChapterIndex ? 'text-purple-500' : 'text-gray-400'} uppercase tracking-tight">
                BAB ${i + 1}: ${ch.title}
            </span>
            ${i === currentChapterIndex ? '<i class="fa-solid fa-check text-[10px] text-purple-500"></i>' : ''}
        </li>
    `).join('');
}

window.changeChapter = function(direction) {
    const newIndex = currentChapterIndex + direction;
    if (newIndex >= 0 && newIndex < chaptersList.length) {
        renderChapter(newIndex);
    } else if (newIndex >= chaptersList.length) {
        window.location.href = 'katalog.html';
    }
};

/* --- 4. KOMEN (PER CHAPTER) --- */

async function loadComments() {
    const list = document.getElementById('commentsList');
    const chapterId = chaptersList[currentChapterIndex].id;

    // Gunakan onSnapshot untuk real-time update
    db.collection('novels').doc(novelId)
      .collection('chapters').doc(chapterId)
      .collection('comments').orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
            list.innerHTML = '<p class="text-gray-600 text-[10px] text-center uppercase tracking-[0.2em] py-10 opacity-50">Belum ada komen untuk bab ini.</p>';
            return;
        }
        list.innerHTML = snapshot.docs.map(doc => {
            const c = doc.data();
            const date = c.timestamp ? new Date(c.timestamp.toDate()).toLocaleDateString('ms-MY') : 'Baru sahaja';
            return `
                <div class="bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/5 mb-4">
                    <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                ${c.userName.charAt(0)}
                            </div>
                            <span class="text-purple-500 font-black text-[10px] uppercase tracking-widest">${c.userName}</span>
                        </div>
                        <span class="text-gray-600 text-[8px] uppercase font-bold">${date}</span>
                    </div>
                    <p class="text-sm text-gray-400 leading-relaxed">${c.text}</p>
                </div>`;
        }).join('');
    });
}

window.postComment = async function() {
    const input = document.getElementById('commentInput');
    const user = firebase.auth().currentUser;
    const chapterId = chaptersList[currentChapterIndex].id;

    if (!user) return alert("Sila log masuk.");
    if (!input.value.trim()) return;

    try {
        await db.collection('novels').doc(novelId)
                .collection('chapters').doc(chapterId)
                .collection('comments').add({
            userName: user.displayName || user.email.split('@')[0],
            text: input.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = '';
    } catch (e) { console.error(e); }
};

/* --- 5. HISTORY & SETTINGS --- */

async function saveHistory(chapter) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const progress = Math.round(((currentChapterIndex + 1) / chaptersList.length) * 100);
    try {
        await db.collection('users').doc(user.uid).collection('history').doc(novelId).set({
            title: currentNovelData.title,
            cover: currentNovelData.cover,
            lastChapter: chapter.title,
            progress: progress,
            lastRead: firebase.firestore.FieldValue.serverTimestamp(),
            novelId: novelId
        }, { merge: true });
    } catch (e) { console.error(e); }
}

// Fungsi UI (Theme, Font, Dropdown)
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('translate-y-full');

window.toggleChapterList = () => {
    const dropdown = document.getElementById('chapterDropdown');
    dropdown.classList.toggle('opacity-0');
    dropdown.classList.toggle('scale-95');
    dropdown.classList.toggle('pointer-events-none');
    document.getElementById('chapterChevron').classList.toggle('rotate-180');
};

window.changeFontSize = (delta) => {
    currentFontSize = Math.min(Math.max(currentFontSize + delta, 14), 32);
    updateTypography();
    localStorage.setItem('readerFontSize', currentFontSize);
};

window.changeFontFace = (family) => {
    currentFontFamily = family;
    updateTypography();
    localStorage.setItem('readerFontFamily', family);
};

function updateTypography() {
    const content = document.getElementById('novelContent');
    if (content) {
        content.style.fontSize = `${currentFontSize}px`;
        content.style.fontFamily = currentFontFamily;
    }
    const display = document.getElementById('fontSizeDisplay');
    if (display) display.innerText = `${currentFontSize}px`;
}

function applyStoredSettings() { updateTypography(); }

window.toggleTheme = () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('readerTheme', isLight ? 'light' : 'dark');
    const icon = document.getElementById('themeIcon');
    icon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
};
