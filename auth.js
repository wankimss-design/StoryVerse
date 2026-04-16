<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StoryVerse | Masuk ke Dimensi</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Itim&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="login.css">
</head>
<body class="bg-[#0a0a0a] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 blur-[120px] rounded-full"></div>

    <div class="w-full max-w-md bg-[#151515]/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative z-10">
        
        <a href="index.html" class="text-gray-500 hover:text-purple-500 text-sm transition flex items-center gap-2 mb-8 group">
            <i class="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> Kembali ke Home
        </a>

        <div id="loginSection">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-black italic text-purple-500 tracking-tighter mb-2">STORY VERSE</h1>
                <p class="text-gray-400 text-sm italic">Sambung pengembaraan anda...</p>
            </div>

            <form id="loginForm" class="space-y-5">
                <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Emel</label>
                    <input type="email" id="loginEmail" required 
                        class="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition"
                        placeholder="nama@email.com">
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Kata Laluan</label>
                        <a href="#" class="text-xs text-purple-500 hover:underline">Lupa?</a>
                    </div>
                    <div class="relative">
                        <input type="password" id="loginPassword" required 
                            class="w-full bg-black/40 border border-white/5 p-4 pr-12 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition"
                            placeholder="••••••••">
                        <button type="button" onclick="togglePassword('loginPassword', 'eyeLogin')" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500 z-20">
                            <i id="eyeLogin" class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl font-bold text-white shadow-lg shadow-purple-900/20 hover:scale-[1.02] transition-transform mt-4">
                    Masuk Sekarang
                </button>
            </form>

            <div class="mt-8 text-center text-sm text-gray-500">
                Belum ada akaun? <a href="javascript:void(0)" onclick="toggleAuth()" class="text-white font-bold hover:text-purple-500 transition">Daftar Sini</a>
            </div>
        </div>

        <div id="registerSection" style="display: none;">
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-black italic text-pink-500 tracking-tighter mb-2">SERTAI KAMI</h1>
                <p class="text-gray-400 text-xs italic">Cipta identiti anda.</p>
            </div>

            <form id="registerForm" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nickname</label>
                    <input type="text" id="regNickname" required 
                        class="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                        placeholder="PenulisMisteri">
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Emel</label>
                    <input type="email" id="regEmail" required 
                        class="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                        placeholder="nama@email.com">
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Kata Laluan</label>
                    <div class="relative">
                        <input type="password" id="regPassword" required 
                            class="w-full bg-black/40 border border-white/5 p-3 pr-12 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                            placeholder="••••••••">
                        <button type="button" onclick="togglePassword('regPassword', 'eyeReg1')" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-500 z-20">
                            <i id="eyeReg1" class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sahkan Kata Laluan</label>
                    <div class="relative">
                        <input type="password" id="regConfirmPassword" required 
                            class="w-full bg-black/40 border border-white/5 p-3 pr-12 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition"
                            placeholder="••••••••">
                        <button type="button" onclick="togglePassword('regConfirmPassword', 'eyeReg2')" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-500 z-20">
                            <i id="eyeReg2" class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" 
                    class="w-full bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-xl font-bold text-white shadow-lg shadow-pink-900/20 hover:scale-[1.02] transition-transform mt-2">
                    CIPTA AKAUN
                </button>
            </form>

            <div class="mt-6 text-center text-xs text-gray-500">
                Sudah ada akaun? <a href="javascript:void(0)" onclick="toggleAuth()" class="text-white font-bold hover:text-purple-500 transition">Log Masuk</a>
            </div>
        </div>

    </div>

    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="firebase-config.js"></script>
    
    <script src="auth.js"></script>
</body>
</html>
