// --- 1. TOGGLE LOGIN/REGISTER ---
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

// --- 2. LOGIK LOGIN ---
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => alert("Ops! " + error.message));
});

// --- 3. LOGIK DAFTAR ---
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then(() => {
            alert("Akaun berjaya dicipta!");
            window.location.href = 'index.html';
        })
        .catch(error => alert("Gagal daftar: " + error.message));
});
