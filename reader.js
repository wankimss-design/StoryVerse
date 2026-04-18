// --- 1. GLOBAL STATE & CONFIG ---
const db = firebase.firestore();
let currentFontSize = parseInt(localStorage.getItem('readerFontSize')) || 18;
let currentFontFamily = localStorage.getItem('readerFontFamily') || 'Lora';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel StoryVerse";
    const chapter = parseInt(params.get('chapter')) || 1;

    // Inisialisasi Paparan & Kandungan
    updateHeaderUI(title, chapter);
    loadChapterContent(chapter);
    applyStoredSettings();
    populateChapterDropdown(10); // Muat 10 bab
    loadComments(); // Muat komen Firestore

    // Semak tema asal
    if (localStorage.getItem('readerTheme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    // Firebase Sync (Sejarah Pembacaan)
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            saveHistoryToFirebase(user.uid, title, chapter);
        }
    });

    // Detect navigasi browser (back/forward)
    window.addEventListener('popstate', () => {
        loadComments();
    });
});

// --- 2. SISTEM KOMEN FIRESTORE ---

async function postComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value;
    if (!commentText.trim()) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Sila login terlebih dahulu untuk memberi komen.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel-Tanpa-Tajuk";
    const chapter = params.get('chapter') || "1";
    const novelId = title.replace(/\s+/g, '-').toLowerCase();

    try {
        await db.collection('novels').doc(novelId)
            .collection('chapters').doc(`chapter-${chapter}`)
            .collection('comments').add({
                uid: user.uid,
                userName: user.displayName || "Pembaca StoryVerse",
                userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`,
                text: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        commentInput.value = ''; 
    } catch (e) {
        console.error("Ralat komen:", e);
    }
}

function loadComments() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel-Tanpa-Tajuk";
    const chapter = params.get('chapter') || "1";
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    const list = document.getElementById('commentsList');

    db.collection('novels').doc(novelId)
        .collection('chapters').doc(`chapter-${chapter}`)
        .collection('comments')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            list.innerHTML = '';
            if (snapshot.empty) {
                list.innerHTML = '<p class="text-gray-600 text-xs text-center uppercase tracking-widest py-10 opacity-50">Belum ada komen.</p>';
                return;
            }
            snapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString('ms-MY') : 'Baru sahaja';
                list.innerHTML += `
                    <div class="comment-card flex gap-4 transition-all duration-300 mb-4">
                        <img src="${data.userPhoto}" class="w-10 h-10 rounded-full border-2 border-purple-500/20 object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-1">
                                <h4 class="text-sm font-bold text-purple-500">${data.userName}</h4>
                                <span class="text-[10px] text-gray-500">${date}</span>
                            </div>
                            <p class="text-sm text-gray-400">${data.text}</p>
                        </div>
                    </div>`;
            });
        });
}

// --- 3. UI & NAVIGATION ---

function populateChapterDropdown(totalChapters) {
    const list = document.getElementById('chapterList');
    if (!list) return;
    const params = new URLSearchParams(window.location.search);
    const currentChapter = parseInt(params.get('chapter')) || 1;

    list.innerHTML = ''; 
    for (let i = 1; i <= totalChapters; i++) {
        const li = document.createElement('li');
        li.className = `chapter-item ${i === currentChapter ? 'active' : ''}`;
        li.innerHTML = `<span>Bab ${i.toString().padStart(2, '0')}</span> ${i === currentChapter ? '<i class="fa-solid fa-check text-[8px]"></i>' : ''}`;
        li.onclick = () => {
            params.set('chapter', i);
            window.location.href = `reader.html?${params.toString()}`;
        };
        list.appendChild(li);
    }
}

function updateHeaderUI(title, chapter) {
    document.getElementById('readerNovelTitle').innerText = title;
    document.getElementById('chapterTitleDisplay').innerText = `Bahagian Ke-${chapter}`;
    document.getElementById('prevBtn').disabled = (chapter <= 1);
    document.title = `Bab ${chapter} - ${title}`;
}

function loadChapterContent(chapter) {
    const content = document.getElementById('novelContent');
    // Placeholder - Sila gantikan dengan fetch Firestore jika perlu
    content.innerHTML = `<p>Bahagian kandungan bab ${chapter} akan muncul di sini secara dinamik...</p>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 4. SETTINGS & THEME ---

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('translate-y-full');
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('readerTheme', isLight ? 'light' : 'dark');
    const icon = document.getElementById('themeIcon');
    icon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
}

function changeFontSize(delta) {
    currentFontSize = Math.min(Math.max(currentFontSize + delta, 14), 32);
    updateTypography();
    localStorage.setItem('readerFontSize', currentFontSize);
}

function changeFontFace(family) {
    currentFontFamily = family;
    updateTypography();
    localStorage.setItem('readerFontFamily', family);
}

function updateTypography() {
    const content = document.getElementById('novelContent');
    if (content) {
        content.style.fontSize = `${currentFontSize}px`;
        content.style.fontFamily = currentFontFamily;
    }
    document.getElementById('fontSizeDisplay').innerText = `${currentFontSize}px`;
}

function applyStoredSettings() { updateTypography(); }

function changeChapter(direction) {
    const params = new URLSearchParams(window.location.search);
    let chapter = parseInt(params.get('chapter')) || 1;
    params.set('chapter', chapter + direction);
    window.location.href = `reader.html?${params.toString()}`;
}

async function saveHistoryToFirebase(uid, title, chapter) {
    const novelId = title.replace(/\s+/g, '-').toLowerCase();
    try {
        await db.collection('users').doc(uid).collection('history').doc(novelId).set({
            title, lastChapter: chapter, lastRead: firebase.firestore.FieldValue.serverTimestamp(), novelId
        }, { merge: true });
    } catch (e) { console.error("History error:", e); }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('chapterDropdown');
    const btn = document.getElementById('chapterBtn');
    if (dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        document.getElementById('chapterChevron').classList.remove('rotate');
    }
});

function toggleChapterList() {
    document.getElementById('chapterDropdown').classList.toggle('active');
    document.getElementById('chapterChevron').classList.toggle('rotate');
}
