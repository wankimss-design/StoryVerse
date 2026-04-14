// Menunggu sehingga dokumen selesai dimuatkan
document.addEventListener('DOMContentLoaded', () => {
    
    const btnExplore = document.getElementById('btnExplore');

    // Contoh Event Listener untuk butang
    btnExplore.addEventListener('click', () => {
        alert('Selamat Datang ke Story Verse! Membuka senarai novel...');
        // Awak boleh masukkan kod untuk scroll ke bawah atau tukar page di sini
    });

    // Efek Scroll Smooth (Opsional)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            console.log(`Navigasi ke: ${e.target.innerText}`);
        });
    });

    console.log("Story Verse Script Loaded!");
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // 1. Fungsi Dark/Light Mode
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        if (body.classList.contains('light-mode')) {
            themeIcon.innerText = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.innerText = '🌙';
            localStorage.setItem('theme', 'dark');
        }
    });

    // 2. Simpan pilihan tema pengguna
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        themeIcon.innerText = '☀️';
    }

    // 3. Data Novel (Simulasi Database)
    const novels = [
        { title: "Shadow Bound", genre: "Fantasy", tag: "New" },
        { title: "Neon Nights", genre: "Cyberpunk", tag: "Hot" },
        { title: "Cinta Di Verse", genre: "Romance", tag: "Top" },
        { title: "The Glitch", genre: "Thriller", tag: "New" },
        { title: "Ancient Code", genre: "Isekai", tag: "Hot" }
    ];

    const grid = document.getElementById('novelGrid');

    // Jana kad novel ke dalam HTML
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
});
