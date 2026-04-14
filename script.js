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
