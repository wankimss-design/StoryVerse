// --- 1. PRELOADER LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const circle = document.querySelector('.loader-circle');
    const text = document.querySelector('.loader-text');
    const svg = document.querySelector('.loader-text text');
    
    const savedTheme = localStorage.getItem('theme');
    
    // Set tema segera sebelum preloader mula
    if (savedTheme === 'light') {
        if (preloader) preloader.style.background = '#fdfbf7'; 
        document.body.classList.add('light-mode');
        const themeIcon = document.getElementById('themeIconLucide');
        themeIcon?.setAttribute('data-lucide', 'sun');
    }

    // Fungsi khas untuk gerenti ikon keluar
    const renderIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            // Debug: console.log("Ikon Lucide telah dikemaskini");
        }
    };

    if (!preloader) {
        renderIcons();
        return;
    }

    setTimeout(() => {
        circle?.classList.add('break');
        setTimeout(() => {
            text?.classList.add('show');
            if (svg) svg.style.animation = "writeText 2s ease-in-out forwards";

            setTimeout(() => {
                preloader.classList.add('lift-up');
                if (typeof fetchNovels === 'function') fetchNovels();
                
                setTimeout(() => { 
                    preloader.style.display = 'none'; 
                    // Panggil fungsi render ikon di sini
                    renderIcons();
                }, 1300);
            }, 3000);
        }, 400);
    }, 1000);
});
