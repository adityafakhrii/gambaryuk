

## Analisis Tools Gambar yang Sudah Ada

Saat ini GambarYuk memiliki **11 tools**:
1. Resize
2. Compress
3. Convert (termasuk JPG↔PDF)
4. Crop
5. Rotate & Flip
6. Watermark
7. Remove Background
8. Filters
9. Bulk Rename
10. Collage
11. Image to Link

---

## Rekomendasi Tools Baru

Berikut tools tambahan yang masih berhubungan erat dengan gambar dan bisa diproses di browser (client-side):

### Kategori: Edit & Enhance

| # | Tool | Deskripsi | Teknologi |
|---|------|-----------|-----------|
| 1 | **Image to Text (OCR)** | Ekstrak teks dari gambar (screenshot, foto dokumen, nota). Hasilnya bisa di-copy atau download sebagai .txt | Lovable AI (Gemini Vision) |
| 2 | **Blur / Censor** | Blur atau pixelate area tertentu pada gambar (wajah, plat nomor, info sensitif). User menandai area lalu apply | Canvas API |
| 3 | **Draw & Annotate** | Tambahkan teks, panah, kotak, lingkaran, garis, dan coretan bebas di atas gambar. Cocok untuk screenshot tutorial | Canvas API |
| 4 | **Color Picker / Eyedropper** | Upload gambar, klik titik manapun untuk ambil kode warna (HEX, RGB, HSL). Tampilkan palet warna dominan | Canvas getImageData |
| 5 | **Upscale / Enhance** | Perbesar resolusi gambar kecil atau buram menggunakan AI supaya lebih tajam | Lovable AI |

### Kategori: Generate & Transform

| # | Tool | Deskripsi | Teknologi |
|---|------|-----------|-----------|
| 6 | **Image to Icon (Favicon)** | Konversi gambar jadi set favicon (.ico 16x16, 32x32, 48x48) dan app icon (192x192, 512x512) siap pakai untuk web | Canvas API |
| 7 | **Meme Generator** | Pilih template meme populer atau upload gambar sendiri, tambahkan teks atas-bawah dengan font Impact klasik | Canvas API |
| 8 | **Screenshot Beautifier** | Bungkus screenshot dengan mockup browser/phone, tambahkan background gradient, shadow, dan rounded corners | Canvas API |
| 9 | **Image Compare (Before/After)** | Upload 2 gambar, tampilkan side-by-side dengan slider geser untuk membandingkan (berguna setelah edit) | CSS + JS |
| 10 | **AI Image Generator** | Generate gambar dari teks prompt menggunakan AI | Lovable AI (Gemini image model) |

### Kategori: Info & Utility

| # | Tool | Deskripsi | Teknologi |
|---|------|-----------|-----------|
| 11 | **Image Metadata / EXIF Viewer** | Lihat detail metadata gambar: dimensi, format, ukuran, tanggal, kamera, GPS, dll. Opsi untuk strip EXIF | exifr library |
| 12 | **QR Code Generator** | Buat QR code dari teks/URL, dengan opsi warna, ukuran, dan embed logo di tengah | qrcode library |
| 13 | **Base64 Encoder/Decoder** | Konversi gambar ke string Base64 (untuk embed di HTML/CSS) dan sebaliknya | Native JS |
| 14 | **Image Splitter / Grid** | Potong 1 gambar jadi grid (2x2, 3x3, dst) untuk kebutuhan Instagram carousel atau puzzle feed | Canvas API |

---

## Ringkasan Total

Dengan penambahan 14 tools baru, GambarYuk akan memiliki **25 tools** total. Semua tetap mengutamakan pemrosesan client-side kecuali fitur AI yang menggunakan Lovable AI.

## Prioritas Implementasi

**Fase 1 — Paling berguna & mudah dibangun:**
1. Image Metadata / EXIF Viewer
2. Color Picker / Eyedropper
3. Base64 Encoder/Decoder
4. QR Code Generator
5. Image to Icon (Favicon)

**Fase 2 — Sedang:**
6. Image Splitter / Grid
7. Blur / Censor
8. Meme Generator
9. Image Compare (Before/After)
10. Screenshot Beautifier

**Fase 3 — Butuh AI:**
11. Image to Text (OCR)
12. Draw & Annotate
13. Upscale / Enhance
14. AI Image Generator

---

## Detail Teknis

- Tools Canvas-based (Blur, Annotate, Splitter, Meme, dll) menggunakan pola yang sama dengan tools yang sudah ada: upload → manipulasi canvas → download/ZIP
- OCR dan Upscale memanfaatkan Lovable AI (Gemini Vision) via edge function, tidak perlu API key tambahan
- QR Code memerlukan dependency baru (`qrcode`)
- EXIF Viewer memerlukan dependency baru (`exifr`)
- Sidebar navigation perlu dikelompokkan ulang karena 25 tools terlalu banyak untuk list datar

