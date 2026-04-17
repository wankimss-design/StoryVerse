// --- 1. AMBIL DATA DARI URL ---
// Contoh: detail.html?title=Cinta%20Di%20Balik%20Dimensi
const urlParams = new URLSearchParams(window.location.search);
const novelTitleParam = urlParams.get('title');

// Data Simulasi (Sama seperti di katalog)
const novels = [
    { 
        title: "Sumpahan Penulis Terakhir", 
        author: "Ahmad Story",
        genre: "Seram", 
        status: "Complete", 
        cover: "https://images.unsplash.com/photo-1543004629-142a76f50c8e?w=800",
        sinopsis: "Kisah seorang penulis yang mendapati setiap perkataan yang ditaipnya menjadi kenyataan yang ngeri. Dia harus menamatkan novelnya sebelum nyawanya sendiri menjadi mangsa plot ciptaannya."
    },
    { 
        title: "Cinta Di Balik Dimensi", 
        author: "Sarah Jane",
        genre: "Romantik", 
        status: "Ongoing", 
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        sinopsis: "Adakah cinta mampu merentasi ruang dan waktu? Aliff mendapati dirinya jatuh cinta dengan seorang gadis dari masa hadapan melalui satu portal rahsia di perpustakaan lama."
    }
];

// --- 2. PAPAR DATA NOVEL ---
function displayDetail() {
    const novel = novels.find(n => n.title === novelTitleParam) || novels[0];

    document.getElementById('novelTitle').innerText = novel.title;
    document.getElementById('novelAuthor').innerText = novel.author;
    document.getElementById('novelGenre').innerText = novel.genre;
    document.getElementById('novelStatus').innerText = novel.status;
    document.getElementById('novelCover').src = novel.cover;
    document.getElementById('novelSinopsis').innerText = novel.sinopsis;
    document.getElementById('authorInitial').innerText = novel.author.charAt(0);
    
    document.title = `${novel.title} | StoryVerse`;
}

// --- 3. THEME TOGGLE ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

// Jalankan fungsi
window.onload = displayDetail;

// Action Mula Membaca
document.getElementById('btnRead').onclick = () => {
    alert("Menghantar anda ke Bab 1...");
    // window.location.href = `read.html?title=${encodeURIComponent(novelTitleParam)}&chapter=1`;
};
