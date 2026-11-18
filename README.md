# Chess Post-Game Analyzer (Browser Extension)

Ekstensi browser Chrome / Edge / Brave (Manifest V3) untuk menganalisis permainan catur yang telah selesai secara **offline dan aman** menggunakan engine **Stockfish** lokal.

---

## 🚀 Fitur Utama

1. **Aman & Sesuai Aturan Chess.com**:
   - Beroperasi khusus untuk evaluasi dan analisis **pasca-pertandingan (post-game)**.
   - Tidak melakukan injeksi bot live pada halaman pertandingan.

2. **Integrasi Chess.com Public API**:
   - Cukup masukkan username Chess.com Anda, ekstensi akan otomatis mengambil PGN permainan terakhir yang sudah selesai langsung ke analyzer.

3. **Input Notasi PGN Bebas**:
   - Anda juga dapat menempelkan (paste) teks PGN dari game mana pun (Chess.com, Lichess, atau turnamen lokal).

4. **Engine Analisis Stockfish Lokal**:
   - Menghitung evaluasi keunggulan posisi (*Eval Bar*).
   - Menampilkan saran langkah terbaik (*Best Move*) dengan penanda warna pada papan catur.
   - Navigasi langkah lengkap: tombol awal (`<<`), mundur (`<`), maju (`>`), akhir (`>>`), navigasi keyboard (panah kiri/kanan), dan fitur balik papan (Flip Board).

---

## 🛠️ Cara Memasang Ekstensi ke Chrome / Brave / Edge

1. Buka browser dan ketik alamat:
   - Chrome / Brave: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. Aktifkan **Developer mode** (Mode pengembang) di sudut kanan atas.
3. Klik tombol **Load unpacked** (Muat yang belum dibongkar).
4. Pilih folder proyek:
   `D:\project\extension-chess`
5. Selesai! Ikon bidak catur akan muncul di toolbar ekstensi browser Anda.

---

## 📖 Cara Penggunaan

1. Klik ikon ekstensi di toolbar browser.
2. Pilih tab **Impor Game / PGN**:
   - Masukkan username akun Chess.com Anda, lalu klik **"Muat Game Terakhir"**, ATAU
   - Tempelkan teks notasi PGN game yang ingin ditinjau.
3. Klik **"Mulai Analisis"**.
4. Gunakan tombol panah atau tombol navigasi untuk melihat evaluasi langkah demi langkah dari Stockfish engine.

