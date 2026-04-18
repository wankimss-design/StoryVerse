// 1. PENGURUSAN DATA & DATABASE
// Nota: 'db' sudah diisytiharkan dalam firebase-config.js, jadi kita tidak perlu isytihar lagi di sini.

const urlParams = new URLSearchParams(window.location.search);
const novelId = urlParams.get('id');

// 2. AMBIL DATA UTAMA NOVEL (Sinopsis, Tajuk, Gambar)
async function fetchNovelDetail() {
    if (!novelId) {
        console.error("ID Novel tidak dijumpai");
        return;
    }

    const docRef = db.collection('novels').doc(novelId);

    docRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            // Papar Tajuk & Metadata
            document.getElementById('detailTitle').innerText = data.title || "Tanpa Tajuk";
            document.title = `${data.title} | StoryVerse`;
            
            // Papar Genre (Check jika array atau string)
            const genreLabel = document.getElementById('detailGenre');
            const genreData = data.genres || data.genre;
            genreLabel.innerText = Array.isArray(genreData) ? genreData[0].toUpperCase() : (genreData || "NOVEL").toUpperCase();

            // Papar Status & Gambar
            document.getElementById('detailStatus').innerText = data.status || "ONGOING";
            document.getElementById('detailCover').src = data.image || data.coverImage || "";
            
            // Papar Sinopsis (Guna description ikut Firestore anda)
            document.getElementById('detailSinopsis').innerText = data.description || data.synopsis || "Tiada sinopsis tersedia.";
            
            // Update Background Glow (Efek Visual)
            const glow = document.getElementById('bgGlow');
            if (glow) {
                const cover = data.image || data.coverImage;
                glow.style.background = `radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, rgba(10,10,10,1) 80%), url('${cover}')`;
                glow.style.backgroundSize = "cover";
            }

            // PANGGIL SENARAI BAB DARI SUB-COLLECTION
            fetchChaptersFromSubcollection();
        } else {
            console.error("Novel tidak wujud di database.");
        }
    });
}

// 3. AMBIL DATA BAB DARI SUB-COLLECTION (Ikut Admin.js)
async function fetchChaptersFromSubcollection() {
    const list = document.getElementById('chapterList');
    if (!list) return;

    db.collection('novels').doc(novelId).collection('chapters')
    .orderBy('chapterNumber', 'asc') // Susun ikut nombor bab
    .onSnapshot((snapshot) => {
        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = `
                <div class="col-span-full py-10 text-center opacity-40">
                    <i class="fa-solid fa-scroll text-3xl mb-3"></i>
                    <p class="text-[10px] uppercase tracking-widest font-black">Belum ada bab dimuat naik</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const chap = doc.data();
            list.innerHTML += `
                <button onclick="goToChapter(${chap.chapterNumber})" class="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group text-left">
                    <div>
                        <p class="text-[10px] text-purple-500 font-black uppercase mb-1">Bab ${chap.chapterNumber}</p>
                        <span class="font-bold text-gray-300 group-hover:text-white transition-colors">${chap.title}</span>
                    </div>
                    <i class="fa-solid fa-play text-[10px] opacity-0 group-hover:opacity-100 transition-all text-purple-500"></i>
                </button>
            `;
        });
    });
}

// 4. NAVIGASI
function goToChapter(num) {
    window.location.href = `reader.html?id=${novelId}&chapter=${num}`;
}

// 5. LOGIK LIKE / BOOKMARK
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
            await userBookmarkRef.delete();
            await novelRef.update({ likes: firebase.firestore.FieldValue.increment(-1) });
        } else {
            const title = document.getElementById('detailTitle').innerText;
            const image = document.getElementById('detailCover').src;

            await userBookmarkRef.set({
                novelId: novelId,
                title: title,
                image: image,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await novelRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
        }
    } catch (error) {
        console.error("Ralat Bookmark:", error);
    }
}

function watchLikeStatus() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user && novelId) {
            db.collection('users').doc(user.uid).collection('bookmarks').doc(novelId)
                .onSnapshot((doc) => {
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

// JALANKAN SEMUA
document.addEventListener('DOMContentLoaded', () => {
    fetchNovelDetail();
    watchLikeStatus();
});
