# 🚀 Panduan Hosting ke Vercel

Proyek ini telah dikonfigurasi menjadi **Web App Statis Modern** (`index.html`) yang 100% siap di-deploy ke **Vercel** secara gratis.

---

## Opsi 1: Deploy via GitHub (Paling Mudah & Otomatis)

1. **Inisialisasi Git dan Push ke Repository GitHub Anda**:
   Buka terminal di folder proyek (`d:\project\extension-chess`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Chess Web App"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/NAMA-REPO-ANDA.git
   git push -u origin main
   ```

2. **Hubungkan ke Vercel**:
   - Masuk ke akun Anda di [vercel.com](https://vercel.com).
   - Klik tombol **"Add New..."** -> **"Project"**.
   - Pilih repository GitHub proyek catur yang baru saja Anda push.
   - Pada kolom **Framework Preset**, biarkan **"Other"** (karena murni Static HTML/JS/CSS).
   - Klik **"Deploy"**.

3. **Selesai!** 
   - Dalam waktu kurang dari 30 detik, web catur Anda akan aktif dan memiliki link publik gratis (misal: `https://chess-review-anda.vercel.app`).

---

## Opsi 2: Deploy Langsung Lewat Vercel CLI (Tanpa Buka GitHub)

Jika Anda sudah menginstal Node.js:
1. Buka terminal di folder proyek:
   ```bash
   npx vercel
   ```
2. Ikuti instruksi di layar (Login akun Vercel, pilih nama project, tekan Enter).
3. Untuk rilis ke domain live production:
   ```bash
   npx vercel --prod
   ```

---

## 💻 Menguji di Komputer Lokal Sebelum Deploy

Anda bisa membuka file `index.html` langsung di browser, atau menjalankannya dengan server lokal:
```bash
npx serve .
```
Lalu buka alamat `http://localhost:3000` di browser Anda.

