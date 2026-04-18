document.addEventListener('DOMContentLoaded', () => {
    loadChapter();
});

function loadChapter() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || "Novel StoryVerse";
    const chapter = parseInt(params.get('chapter')) || 1;

    // Update Header
    document.getElementById('readerNovelTitle').innerText = title;
    document.getElementById('readerChapterNum').innerText = `Bab ${chapter.toString().padStart(2, '0')}`;
    document.getElementById('chapterTitleDisplay').innerText = `Bahagian Ke-${chapter}`;
    document.title = `Bab ${chapter} - ${title} | StoryVerse`;

    // Simulasi Isi Cerita (Anda boleh sambung ke Firebase nanti)
    const storyContent = `
        <p>Di bawah sinaran bulan yang samar-samar, Aliff berdiri kaku di hadapan pintu perpustakaan lama itu. Suasana malam begitu sunyi, hanya kedengaran bunyi cengkerik yang bersahutan. Dia tahu, langkah yang bakal diambilnya malam ini akan mengubah seluruh hidupnya.</p>
        
        <p>Tangannya yang menggigil perlahan-lahan menolak daun pintu kayu yang berat itu. Bunyi keriutan pintu memecah kesunyian, seolah-olah memberi amaran kepada sesiapa sahaja yang berani menceroboh. Namun, semangatnya lebih kuat daripada rasa takut.</p>
        
        <p>"Adakah dia benar-benar wujud?" bisik hatinya sendiri. Aliff teringat akan pesanan neneknya tentang portal rahsia yang menghubungkan dua dunia. Sebuah cinta yang terlarang antara dua dimensi yang berbeza.</p>
        
        <p>Dia melangkah masuk, dan tiba-tiba cahaya biru mula terpancar dari celah-celah rak buku yang berhabuk. Udara di sekelilingnya mula terasa sejuk secara mendadak. Inilah dia. Permulaan kepada takdir yang tidak akan berpaling lagi.</p>
    `;

    document.getElementById('novelContent').innerHTML = storyContent;

    // Update Butang Navigasi
    document.getElementById('prevBtn').disabled = (chapter <= 1);
    
    // Scroll ke atas setiap kali tukar bab
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function changeChapter(direction) {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    let chapter = parseInt(params.get('chapter')) || 1;
    
    chapter += direction;
    
    if (chapter < 1) return;
    
    // Tukar URL dan muat semula content
    window.location.href = `reader.html?title=${encodeURIComponent(title)}&chapter=${chapter}`;
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('themeIcon');
    if(document.body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}
