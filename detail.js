// --- 1. PENGURUSAN DATA DARI URL & DATABASE ---
const urlParams = new URLSearchParams(window.location.search);
const novelId = urlParams.get('id'); // Pastikan index.html hantar ?id=, bukan ?title=

async function fetchNovelDetail() {
    if (!novelId) {
        console.error("ID Novel tidak dijumpai dalam URL");
        return;
    }

    const docRef = db.collection('novels').doc(novelId);

    try {
        // Ambil data novel secara real-time
        docRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                
                // Papar Data ke HTML
                document.getElementById('detailTitle').innerText = data.title;
                document.getElementById('detailGenre').innerText = data.genre || "Novel";
                document.getElementById('detailStatus').innerText = data.status || "Ongoing";
                document.getElementById('detailCover').src = data.coverImage || data.image || "";
                document.getElementById('detailSinopsis').innerText = data.sinopsis || "Tiada sinopsis tersedia.";
                
                // Update Metadata
                document.title = `${data.title} | StoryVerse`;
                
                // Update Latar Belakang (Glow)
                const glow = document.getElementById('bgGlow');
                if (glow) {
                    const cover = data.coverImage || data.image;
                    glow.style.background = `radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, rgba(10,10,10,1) 80%), url('${cover}')`;
                    glow.style.backgroundSize = "cover";
                }

                // Paparkan Senarai Bab (Jika ada array 'chapters' dalam Firestore)
                renderChapters(data.chapters || []);
            } else {
                console.error("Novel tidak wujud di database.");
            }
        });
    } catch (error) {
        console.error("Ralat mengambil detail:", error);
    }
}

// --- 2. LOGIK LIKE & BOOKMARK (TERHUBUNG KE USER & NOVEL) ---
async function toggleBookmark() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Sila log masuk untuk menyukai karya ini!");
        return;
    }

    const userBookmarkRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);
    const novelRef = db.collection('novels').doc(novelId);

    try {
        const doc = await userBookmarkRef.get();
        
        if (doc.exists) {
            // JIKA SUDAH LIKE: Buang dari bookmark & kurangkan jumlah like novel
            await userBookmarkRef.delete();
            await novelRef.update({
                likes: firebase.firestore.FieldValue.increment(-1)
            });
        } else {
            // JIKA BELUM LIKE: Simpan ke bookmark & tambah jumlah like novel
            const title = document.getElementById('detailTitle').innerText;
            const image = document.getElementById('detailCover').src;

            await userBookmarkRef.set({
                novelId: novelId,
                title: title,
                image: image,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await novelRef.update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
        }
    } catch (error) {
        console.error("Ralat Toggle Like:", error);
    }
}

// --- 3. SEMAK STATUS LIKE (WARNA BUTANG) ---
function watchLikeStatus() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user && novelId) {
            const userBookmarkRef = db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId);
            
            userBookmarkRef.onSnapshot((doc) => {
                const likeIcon = document.getElementById('likeIcon');
                if (doc.exists) {
                    likeIcon.classList.replace('fa-regular', 'fa-solid');
                    likeIcon.classList.add('text-pink-500');
                    likeIcon.style.opacity = "1";
                } else {
                    likeIcon.classList.replace('fa-solid', 'fa-regular');
                    likeIcon.classList.remove('text-pink-500');
                    likeIcon.style.opacity = "0.4";
                }
            });
        }
    });
}

// --- 4. RENDER SENARAI BAB ---
function renderChapters(chapters) {
    const list = document.getElementById('chapterList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (chapters.length === 0) {
        // Jika tiada bab dalam database, kita buat bab simulasi 1-10
        for (let i = 1; i <= 10; i++) {
            list.innerHTML += `
                <button onclick="goToChapter(${i})" class="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group">
                    <span class="font-bold text-gray-400 group-hover:text-purple-400">BAB ${i}</span>
                    <i class="fa-solid fa-play text-[10px] opacity-0 group-hover:opacity-100 transition-all"></i>
                </button>
            `;
        }
    } else {
        // Jika ada bab sebenar dalam database
        chapters.forEach((chap, index) => {
            list.innerHTML += `
                <button onclick="goToChapter(${index + 1})" class="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group">
                    <span class="font-bold text-gray-400 group-hover:text-purple-400">${chap.title || `BAB ${index + 1}`}</span>
                    <i class="fa-solid fa-play text-[10px] opacity-0 group-hover:opacity-100 transition-all"></i>
                </button>
            `;
        });
    }
}

function goToChapter(num) {
    const title = document.getElementById('detailTitle').innerText;
    window.location.href = `reader.html?id=${novelId}&chapter=${num}`;
}

// JALANKAN SEMUA FUNGSI
document.addEventListener('DOMContentLoaded', () => {
    fetchNovelDetail();
    watchLikeStatus();
});
