// --- 1. FUNGSI TUNJUK/SOROK PASSWORD (MATA) ---
function togglePassword(inputId, eyeId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeId);

    if (!passwordInput || !eyeIcon) return;// --- 1. TUNJUK/SOROK PASSWORD ---
function togglePassword(inputId, eyeId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(eyeId);
    if (input.type === "password") {
        input.type = "text";
        eye.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        eye.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// --- 2. TUKAR LOGIN/REGISTER (WITH ANIMATION) ---
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

// --- 3. LOGIK LOGIN + EMAIL CHECK ---
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        if (user.emailVerified) {
            window.location.href = 'index.html';
        } else {
            alert("Sila sahkan e-mel anda sebelum log masuk. Semak inbox/spam.");
            await firebase.auth().signOut();
        }
    } catch (error) {
        alert("Ralat: " + error.message);
    }
});

// --- 4. LOGIK DAFTAR + SEND VERIFICATION ---
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = document.getElementById('regNickname').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    if (pass !== confirm) return alert("Kata laluan tidak sepadan!");

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // Simpan Nickname & Hantar E-mel
        await user.updateProfile({ displayName: nickname });
        await user.sendEmailVerification();
        
        // Simpan ke Firestore (kerana anda sudah tambah library Firestore tadi)
        await firebase.firestore().collection('users').doc(user.uid).set({
            username: nickname,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Pendaftaran Berjaya! Sila semak e-mel anda untuk pautan pengesahan.");
        toggleAuth();
    } catch (error) {
        alert("Gagal Daftar: " + error.message);
    }
});

// --- 5. LOGIK FORGOT PASSWORD ---
function handleForgotPassword() {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        alert("Sila masukkan e-mel anda di ruangan 'Emel' terlebih dahulu.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("Pautan set semula kata laluan telah dihantar ke e-mel: " + email);
        })
        .catch((error) => {
            alert("Ralat: " + error.message);
        });
}

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

// --- 3. LOGIK LOGIN (Dengan Semakan E-mel Pengesahan) ---
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');

    try {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Memproses...`;

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // Semak jika email sudah disahkan
        if (user.emailVerified) {
            window.location.href = 'index.html';
        } else {
            alert("⚠️ Akaun belum disahkan! Sila semak peti masuk e-mel anda dan klik pautan pengesahan.");
            await firebase.auth().signOut();
            btn.disabled = false;
            btn.innerHTML = "Masuk Sekarang";
        }
    } catch (error) {
        alert("Ralat Log Masuk: " + error.message);
        btn.disabled = false;
        btn.innerHTML = "Masuk Sekarang";
    }
});

// --- 4. LOGIK DAFTAR (Dengan Hantaran E-mel Pengesahan) ---
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nickname = document.getElementById('regNickname').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');

    if (pass !== confirmPass) {
        alert("Ralat: Kata laluan tidak sepadan!");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "Mencipta Akaun...";

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // 1. Simpan Nickname
        await user.updateProfile({ displayName: nickname });

        // 2. Hantar E-mel Pengesahan
        await user.sendEmailVerification();

        alert("✅ Pendaftaran Berjaya! Satu e-mel pengesahan telah dihantar ke " + email + ". Sila sahkan e-mel anda sebelum log masuk.");
        
        // Reset form dan tukar ke Login
        e.target.reset();
        toggleAuth();
        
    } catch (error) {
        alert("Gagal Daftar: " + error.message);
        btn.disabled = false;
        btn.innerText = "CIPTA AKAUN";
    }
});

// --- 5. LOGIK LUPA KATA LALUAN (FORGOT PASSWORD) ---
window.handleForgotPassword = function() {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        alert("Sila masukkan e-mel anda di ruangan 'Emel' untuk kami hantar pautan set semula kata laluan.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("📧 Pautan set semula kata laluan telah dihantar! Sila semak folder Inbox atau Spam e-mel anda.");
        })
        .catch((error) => {
            alert("Ralat: " + error.message);
        });
};
