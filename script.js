document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen UI ---
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const btnExplore = document.getElementById('btnExplore');
    const body = document.body;
    const grid = document.getElementById('novelGrid');

    // --- 1. Logik Tukar Tema (Dark/Light) ---
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            if(themeIcon) themeIcon.innerText = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            if(themeIcon) themeIcon.innerText = '🌙';
            localStorage.setItem('theme', 'dark');
        }
    }

    // Semak pilihan lama dalam simpanan browser
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // Event listener untuk butang toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light-mode');
            setTheme(isLight ? 'dark' : 'light');
        });
    }

    // --- 2. Logik Butang Mula Membaca ---
    if (btnExplore) {
        btnExplore.addEventListener('click', () => {
            document.getElementById('katalog').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- 3. Jana Data Novel ---
    const novels = [
        { title: "Shadow Bound", genre: "Fantasy", tag: "New" },
        { title: "Neon Nights", genre: "Cyberpunk", tag: "Hot" },
        { title: "Cinta Di Verse", genre: "Romance", tag: "Top" },
        { title: "The Glitch", genre: "Thriller", tag: "New" },
        { title: "Ancient Code", genre: "Isekai", tag: "Hot" }
    ];

    if (grid) {
        // Kosongkan grid sebelum isi (untuk elak duplikasi)
        grid.innerHTML = ''; 
        novels.forEach(novel => {
            const card = `
                <div class="novel-card group">
                    <div class="card-image-wrapper">
                        <img src="https://via.placeholder.com/300x450?text=${novel.title}" alt="${novel.title}" class="card-img">
                        <div class="card-badge">${novel.tag}</div>
                    </div>
                    <h3 class="mt-4 font-bold group-hover:text-purple-500 transition">${novel.title}</h3>
                    <p class="text-sm text-gray-500 italic">${novel.genre}</p>
                </div>
            `;
            grid.innerHTML += card;
        });
    }

    console.log("Story Verse System: Ready");
});
