// 1. PENGURUSAN STATUS LOGIN (NAVBAR)
firebase.auth().onAuthStateChanged((user) => {
    const navAuthText = document.getElementById('navAuthText');
    const navAuthBtn = document.getElementById('navAuthBtn');

    if (user) {
        navAuthText.innerText = user.displayName || "Profil";
        navAuthBtn.href = "profile.html";
    } else {
        navAuthText.innerText = "Masuk";
        navAuthBtn.href = "auth.html";
    }
});

// 2. KESAN SKROL NAVBAR
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('bg-[#0a0a0a]/95', 'h-16');
        nav.classList.remove('bg-[#0a0a0a]/70', 'h-20');
    } else {
        nav.classList.add('bg-[#0a0a0a]/70', 'h-20');
        nav.classList.remove('bg-[#0a0a0a]/95', 'h-16');
    }
});

// 3. LOAD DATA NOVEL (DUMMY DATA UNTUK TEST UI)
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('katalogGrid');
    
    // Contoh data novel (Nanti tarik dari Firestore)
    const sampleNovels = [
        { title: "Sumpahan Penulis Terakhir", author: "KaryaMisteri", cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=500" },
        { title: "Cinta Di Balik Dimensi", author: "Aries_99", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" },
        { title: "Kod Rahsia StoryVerse", author: "DevWriter", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" },
        { title: "Malam Tanpa Bintang", author: "Senja_Hati", cover: "https://images.unsplash.com/photo-1532012197367-6849412628ad?w=500" }
    ];

    grid.innerHTML = ''; // Kosongkan placeholder

    sampleNovels.forEach(novel => {
        grid.innerHTML += `
            <div class="novel-card">
                <div class="cover-wrapper">
                    <img src="${novel.cover}" alt="${novel.title}">
                    <div class="info-overlay">
                        <button class="bg-purple-600 text-white text-[9px] font-black uppercase py-2.5 rounded-xl hover:bg-purple-500 transition shadow-lg shadow-purple-900/40">
                            Baca Sekarang
                        </button>
                    </div>
                </div>
                <h3 class="novel-title">${novel.title}</h3>
                <p class="novel-author">Oleh @${novel.author}</p>
            </div>
        `;
    });
});
