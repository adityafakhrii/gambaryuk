# 🎨 GambarYuk — All-in-One Image Tools

> **Edit images? Just upload and go!**  
> Platform optimasi dan edit gambar lengkap yang cepat, ringan, tanpa iklan, dan 100% gratis. 

---

## 📖 Tentang Proyek

**GambarYuk** adalah platform edit gambar berbasis web (PWA Ready) dengan lebih dari 20 fitur lengkap. Visi utama aplikasi ini adalah menghadirkan kemudahan layaknya menggunakan versi premium dari tool populer, secara langsung di dalam browser tanpa instalasi apapun.

Aplikasi ini menunjang **Privacy First** (Privasi Utama): sebagian besar pemrosesan gambar langsung terjadi dan dieksekusi secara lokal pada browser pengguna menggunakan JavaScript (Web Workers dan HTML5 Canvas API), sehingga gambar tidak pernah dibagikan ke server komputasi eksternal atau database manapun kecuali secara eksplisit menggunakan fitur online yang ada seperti *Image to Link* atau *AI Features*.

---

## ✨ Daftar Fitur & Alat

Peralatan dikelompokkan dalam berbagai kategori profesional agar mudah ditemukan melalui sidebar:

### ⚡ Alat Utama (Essential)
- **Resize**: Mengubah dimensi ukuran foto spesifik (Px, Aspect Ratio, dll).
- **Compress**: Menyusutkan ukuran *file size* untuk menghemat memori tanpa mengurangi banyak kualitas.
- **Convert**: Mengubah format atau *extension* file antar JPG, PNG, WEBP, dan PDF (termasuk kompilasi banyak gambar jadi 1 file PDF).

### ✂️ Alat Edit (Edit Tools)
- **Crop**: Memotong gambar presisi dengan aspect ratio default social media (1:1, 16:9, dll).
- **Rotate & Flip**: Rotasi angle fleksibel, serta pencerminan vertikal/horizontal.
- **Watermark**: Menyematkan *branding* tambahan baik itu teks bebas maupun menumpuk gambar logo.

### 💼 Alat Tingkat Lanjut (Advanced)
- **Image Filters**: Pilihan filter manipulasi foto, brightness, contrast, saturasi (Instagram-like).
- **Bulk Rename**: Penggantian nama file banyak aset gambar dengan cepat mengikuti sebuah pola/pattern.
- **Collage**: Penggabungan berbagai foto menjadi bentuk grid (Grid vertikal & horizontal).
- **Image to Link**: Unggah gambar dengan masa kedaluwarsa tertentu agar *sharable* melalui sebuah *URL link*.

### 🎉 Transformasi & Kreativitas (Generate)
- **Image Splitter**: Memecah sebuah foto rasio panjang menjadi feed grid untuk Carousel.
- **Blur / Censor**: Menyensor atau mem-pixelate area sensitif pada gambar secara spesifik.
- **Meme Generator**: Menyisipkan teks bergaya tebal pada bagian atas dan bawah foto.
- **Image Compare**: Interaktif *slider* untuk membandingkan foto A dan foto B (Before & After).
- **Screenshot Beautifier**: Menambahkan frame OS, padding estetik, shadow, dan background gradient.

### 🛠️ Informasi & Utilitas (Utility)
- **EXIF Viewer**: Membaca deretan metadata tersembunyi berformat EXIF yang dibawa oleh foto asli (Kamera, device, koordinat lokal).
- **Color Picker**: Menarik palet *hex colors* dominan langsung dari foto manapun.
- **Base64 Encode/Decode**: Standarisasi string gambar menjadi kode enkripsi base64 dan sebaliknya.
- **QR Code Generator**: Membuat output QRCode scan dari logo/gambar maupun teks URL.
- **Favicon Generator**: Pencetak variasi set ikon lengkap untuk keperluan perakitan website UI/UX.

### 🤖 Fitur AI (Edge Function Integration) *(Segera Hadir / Disabled di route)*
Fitur berteknologi *Artificial Intelligence* ini diproses di *Edge Server/Function* Supabase dan APIs.
- **Image to Text (OCR)**: Ekstrak bacaan dalam foto.
- **Hapus Latar Belakang (Remove BG)**.
- **Penghapus Watermark NotebookLM/Tiktok**.
- **AI Upscaler**: Meningkatkan rasio resolusi ketajaman dari foto blur menggunakan engine AI.
- **AI Image Generator**: Membangun ilustrasi dari teks (Prompt-to-Image).

---

## 🛠️ Stack Teknologi & Arsitektur

Secara teknis, platform ini ditulis murni menggunakan **TypeScript**. Berikut detail peralatannya:

1. **Frontend Core**:
   - `React 18` (Pusat antarmuka).
   - `Vite` (Build tool, local dev server yang kilat).
   - `React Router DOM` (Pengendali perpindahan antar halaman komponen klien).
2. **UI & Styling**:
   - `Tailwind CSS v3` (Utility-first styling).
   - `Shadcn UI` / `@radix-ui` (Komponen UI tak berbayar yang *accessible* dan sangat *customizable*).
   - `Framer Motion` (Animasi transisi halaman saat berpindah *routing*).
3. **Data & State Management**:
   - `React Query` (Handling async client/server APIs state).
   - `React Hook Form` & `Zod` (Validasi input / formulir). 
   - Konteks asli React (Untuk Theme Gelap/Terang, Multibahasa En/Id).
4. **Alat Pengolah Media**:
   - Web Worker API manual eksklusif di dalam sistem (`pixelWorker.ts`) agar thread canvas UI React tidak lag.
   - `jspdf` & `pdfjs-dist` (Untuk konversi image-PDF dan sebaliknya).
   - `exifr` (Pemutar balik data metadata kamera).
5. **Backend & Infrastruktur**:
   - **Supabase** (Bertindak sebagai BaaS).
   - **PostgreSQL** Database.
   - **Supabase Storage** (Buckets: `shared-images`).
   - **Deno Edge Functions** (Menampung script terisolasi untuk manipulasi API AI).

---

## 🚀 Instalasi & Menjalankan Lokal (Development)

Jika Anda ingin menjalankan atau mengembangkan skrip *open source* pada GambarYuk:

### 1. Prasyarat
- Anda perlu menginstal [Node.js](https://nodejs.org/en) (Minimumversi v18x direkomendasikan).
- Akun dan Project di Supabase *(Opsional; apabila Anda menyalakan fitur AI dan Image Link)*.

### 2. Kloning Proyek
Klon repositori ini ke dalam direktori komputer Anda.
```bash
git clone <url_repo_ini>
cd gambaryuk-new
```

### 3. Instalasi *Dependencies* Packages
Jalankan komando Node Package Manager untuk mengunduh semua librari:
```bash
npm install
```

### 4. Setup Lingkungan
Jika menggunakan layanan Backend (seperti API), buat file `.env` dan tambahkan variabel Anda:
```env
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="xxxxx"
```
*(Untuk fungsionalitas murni lokal client-side, environment ini mungkin dapat dihiraukan)*

### 5. Jalankan Server Dev
Gunakan *fast auto-reloading* pada Vite:
```bash
npm run dev
```

Anda bisa mengakses aplikasi pratinjaunya di `http://localhost:5173`.

### 6. Build Produksi
Ketika pengembangan selesai dan siap *deploy*:
```bash
npm run build
```
*(Nantinya seluruh bundel statis akan tersimpan rapi pada direktori `/dist`)*.

---

## 🔒 Izin dan Kontribusi

Jika GambarYuk membantu hidup Anda, berikan masukan Anda kepada kreator aplikasi ini.
Setiap Pull Request yang masuk untuk membantu mengoptimasikan logic algoritma gambar/komponen sangat diterima terbuka! 

**Keep building!** 🎨🚀
