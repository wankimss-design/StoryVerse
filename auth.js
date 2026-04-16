// Gantikan fungsi togglePassword lama dengan yang ini
function togglePassword(inputId, eyeId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeId);

    if (!passwordInput || !eyeIcon) return; // Elakkan ralat jika ID salah

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Tukar ikon kepada mata bergaris
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        // Tukar balik kepada ikon mata biasa
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// --- 2. TOGGLE ANTARA LOGIN & REGISTER ---
function toggleAuth() {
    const loginSec = document.getElementById('loginSection');
    const regSec = document.getElementById('registerSection');

    if (loginSec.style.display === 'none') {
        loginSec.style.display = 'block';
        regSec.style.display = 'none';
    } else {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    }
}

// --- 3. LOGIK LOGIN ---
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error(error);
            alert("Ops! Emel atau kata laluan salah.");
        });
});

// --- 4. LOGIK DAFTAR (Nickname & Confirm Password) ---
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nickname = document.getElementById('regNickname').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    // Semak jika password sepadan
    if (pass !== confirmPass) {
        alert("Ralat: Kata laluan tidak sepadan!");
        return;
    }

    // Semak panjang password (Firebase syaratkan min 6)
    if (pass.length < 6) {
        alert("Ralat: Kata laluan mestilah sekurang-kurangnya 6 aksara.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Simpan Nickname ke dalam Profile Firebase
            return userCredential.user.updateProfile({
                displayName: nickname
            });
        })
        .then(() => {
            alert("Selamat Datang ke StoryVerse, " + nickname + "!");
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error(error);
            alert("Gagal daftar: " + error.message);
        });
});
