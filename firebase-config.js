// Konfigurasi Firebase Story Verse
const firebaseConfig = {
    apiKey: "AIzaSyDjad_1a4JJ9Yclt-va0LHLLBbYeDghsWs",
    authDomain: "storyverse-fead8.firebaseapp.com",
    projectId: "storyverse-fead8",
    storageBucket: "storyverse-fead8.firebasestorage.app",
    messagingSenderId: "836135170413",
    appId: "1:836135170413:web:8f5bf9ab90e6a31e20aa64",
    measurementId: "G-VQKW2W9LQB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Eksport db supaya boleh diguna di fail lain
const db = firebase.firestore();
