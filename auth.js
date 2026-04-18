// --- 1. FUNGSI TUNJUK/SOROK PASSWORD (MATA) ---
function togglePassword(inputId, eyeId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeId);

    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// --- 2. SWITCH LOGIN/REGISTER ---
function toggleAuth() {
    const loginSec = document.getElementById('loginSection');
    const regSec = document.getElementById('registerSection');

    loginSec.classList.remove('tiktok-flip');
    regSec.classList.remove('tiktok-flip');

    if (loginSec.style.display === 'none') {
        loginSec.style.display = 'block';
        regSec.style.display = 'none';
        void loginSec.offsetWidth; 
        loginSec.classList.add('tiktok-flip');
    } else {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
        void regSec.offsetWidth;
        regSec.classList.add('tiktok-flip');
    }
}

// --- 3. LOGIK LOGIN (Dengan Semakan Verifikasi) ---
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;

            // Semak jika email sudah disahkan
            if (user.emailVerified) {
                window.location.href = 'index.html';
            } else {
                alert("Akaun anda belum disahkan. Sila semak e-mel anda dan klik pautan pengesahan.");
                firebase.auth().signOut(); // Log keluar semula jika belum verified
            }
        })
        .catch(error => {
            alert("Ralat Log Masuk: " + error.message);
        });
});

// --- 4. LOGIK DAFTAR (Dengan Email Verification) ---
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nickname = document.getElementById('regNickname').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    if (pass !== confirmPass) {
        alert("Ralat: Kata laluan tidak sepadan!");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;

            // 1. Kemaskini Profile (Nickname)
            user.updateProfile({ displayName: nickname });

            // 2. Hantar E-mel Pengesahan (Verification)
            return user.sendEmailVerification();
        })
        .then(() => {
            alert("Pendaftaran berjaya! E-mel pengesahan telah dihantar ke " + email + ". Sila sahkan e-mel anda sebelum log masuk.");
            toggleAuth(); // Tukar ke skrin login
        })
        .catch(error => {
            alert("Gagal Daftar: " + error.message);
        });
});

// --- 5. LOGIK LUPA KATA LALUAN (FORGOT PASSWORD) ---
function handleForgotPassword() {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        alert("Sila masukkan e-mel anda di ruangan 'Emel' untuk set semula kata laluan.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Pautan set semula kata laluan telah dihantar ke e-mel anda.");
        })
        .catch((error) => {
            alert("Ralat: " + error.message);
        });
}
