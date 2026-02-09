
Color Scheme Change: From current blue (#7BBEDE) to Soft Sage (#ACC8A2) and Deep Olive (#1A2517)
Default Language: Change from 'en' to 'id' (Indonesian)

# Implementasi 7 Fitur Image Utilities Tambahan

## Ringkasan
Menambahkan 7 fitur image utilities baru ke aplikasi untuk menjadikannya platform pengolahan gambar yang lebih lengkap. Semua proses tetap dilakukan di browser (client-side) untuk kecepatan dan privasi.

---

## Fitur yang Akan Ditambahkan

| No | Fitur | Deskripsi | Route |
|----|-------|-----------|-------|
| 1 | Crop Image | Potong gambar dengan rasio bebas atau preset | `/crop` |
| 2 | Rotate & Flip | Putar 90°/180°/270° dan flip horizontal/vertikal | `/rotate` |
| 3 | Watermark | Tambah teks atau logo ke gambar | `/watermark` |
| 4 | Remove Background | Hapus latar belakang gambar | `/remove-bg` |
| 5 | Image Filters | Filter brightness, contrast, grayscale, sepia | `/filters` |
| 6 | Bulk Rename | Rename banyak file dengan pattern | `/rename` |
| 7 | Merge/Collage | Gabung beberapa gambar jadi satu | `/collage` |

---

## Perubahan File yang Diperlukan

### 1. File Baru yang Dibuat

```text
src/pages/
├── CropPage.tsx          (Halaman Crop)
├── RotatePage.tsx        (Halaman Rotate & Flip)
├── WatermarkPage.tsx     (Halaman Watermark)
├── RemoveBgPage.tsx      (Halaman Remove Background)
├── FiltersPage.tsx       (Halaman Image Filters)
├── RenamePage.tsx        (Halaman Bulk Rename)
└── CollagePage.tsx       (Halaman Merge/Collage)
```

### 2. File yang Dimodifikasi

- `src/App.tsx` - Tambah 7 route baru
- `src/components/layout/Header.tsx` - Update navigasi dengan dropdown untuk tools
- `src/contexts/LanguageContext.tsx` - Tambah terjemahan untuk 7 fitur baru
- `src/lib/imageProcessing.ts` - Tambah fungsi processing baru
- `src/pages/Index.tsx` - Update landing page dengan semua 10 fitur

---

## Detail Implementasi Per Fitur

### 1. Crop Image (Potong Gambar)

**Fungsi:**
- Area pemilihan crop yang bisa di-drag dan resize
- Preset rasio: 1:1, 4:3, 16:9, 9:16 (Story), Free

**Kontrol:**
- Drag handles untuk resize area crop
- Tombol preset rasio
- Input manual untuk posisi dan ukuran

**Fungsi Processing:**
```text
cropImage(imageUrl, { x, y, width, height }) → ProcessedImage
```

---

### 2. Rotate & Flip (Putar & Balik)

**Fungsi:**
- Rotasi: 90° CW, 90° CCW, 180°
- Flip: Horizontal, Vertikal

**Kontrol:**
- Tombol rotasi dengan preview real-time
- Tombol flip horizontal/vertikal
- Slider untuk rotasi custom (0-360°)

**Fungsi Processing:**
```text
rotateImage(imageUrl, { angle, flipH, flipV }) → ProcessedImage
```

---

### 3. Watermark (Tanda Air)

**Fungsi:**
- Tambah teks watermark
- Upload logo sebagai watermark
- Kontrol posisi (9 titik: corners, edges, center)

**Kontrol:**
- Input teks watermark
- Pilihan font, ukuran, warna
- Slider opacity (0-100%)
- Grid posisi 3x3

**Fungsi Processing:**
```text
addWatermark(imageUrl, { type: 'text'|'image', content, position, opacity, size }) → ProcessedImage
```

---

### 4. Remove Background (Hapus Latar)

**Catatan:** Fitur ini memerlukan library external karena browser Canvas API tidak bisa otomatis mendeteksi objek.

**Pendekatan:**
- Gunakan library `@imgly/background-removal` (client-side AI)
- Atau API gratis seperti remove.bg (perlu koneksi internet)

**Kontrol:**
- Tombol "Remove Background"
- Preview before/after
- Pilihan background: Transparan atau warna solid

**Fungsi Processing:**
```text
removeBackground(imageUrl) → ProcessedImage (PNG dengan transparansi)
```

---

### 5. Image Filters (Filter Gambar)

**Fungsi:**
- Adjustments: Brightness, Contrast, Saturation, Blur, Sharpen
- Preset filters: Grayscale, Sepia, Invert, Vintage, Cool, Warm

**Kontrol:**
- Slider untuk setiap adjustment (-100 to +100)
- Tombol preset filter
- Reset button

**Fungsi Processing:**
```text
applyFilters(imageUrl, { brightness, contrast, saturation, preset }) → ProcessedImage
```

---

### 6. Bulk Rename (Rename Massal)

**Fungsi:**
- Rename banyak file sekaligus dengan pattern
- Pattern tokens: `{name}`, `{index}`, `{date}`, `{width}`, `{height}`

**Contoh Pattern:**
- `photo_{index}` → photo_1.jpg, photo_2.jpg, ...
- `{name}_edited` → original_edited.jpg
- `img_{date}_{index}` → img_20240115_1.jpg

**Kontrol:**
- Input pattern template
- Preview daftar nama baru
- Start index input
- Download sebagai ZIP

---

### 7. Merge/Collage (Gabung Gambar)

**Fungsi:**
- Gabung 2-9 gambar dalam layout grid
- Template: 2x1, 1x2, 2x2, 3x3, 2x3, dll

**Kontrol:**
- Pilihan template layout
- Drag & drop untuk reorder gambar
- Slider gap/spacing antar gambar
- Warna background

**Fungsi Processing:**
```text
createCollage(images[], { template, gap, bgColor }) → ProcessedImage
```

---

## Update Navigasi

Karena sekarang ada 10 tools, navigasi akan diubah menjadi dropdown menu:

```text
[Home] [Tools ▼] [Language] [Theme]
         │
         ├── Resize
         ├── Compress
         ├── Convert
         ├── ─────────
         ├── Crop
         ├── Rotate & Flip
         ├── Watermark
         ├── ─────────
         ├── Remove Background
         ├── Filters
         ├── Bulk Rename
         └── Collage
```

---

## Update Landing Page

Landing page akan menampilkan grid 10 fitur yang dikategorikan:

**Kategori 1: Essential Tools**
- Resize, Compress, Convert

**Kategori 2: Edit Tools**
- Crop, Rotate & Flip, Watermark

**Kategori 3: Advanced Tools**
- Remove Background, Filters, Bulk Rename, Collage

---

## Terjemahan Baru (LanguageContext)

Tambah 50+ key terjemahan baru untuk:
- Nama navigasi 7 tools
- Judul dan deskripsi setiap fitur
- Kontrol dan label UI
- Pesan sukses/error

---

## Detail Teknis

### Dependencies Baru
- `jszip` - Untuk download batch sebagai ZIP file (Bulk Rename & Batch processing)
- `@imgly/background-removal` - Untuk fitur Remove Background (opsional, ~5MB)

### Fungsi Processing Baru di imageProcessing.ts

```text
// Crop
cropImage(imageUrl, options: CropOptions): Promise<ProcessedImage>

// Rotate & Flip
rotateImage(imageUrl, options: RotateOptions): Promise<ProcessedImage>

// Watermark
addTextWatermark(imageUrl, options: TextWatermarkOptions): Promise<ProcessedImage>
addImageWatermark(imageUrl, options: ImageWatermarkOptions): Promise<ProcessedImage>

// Filters (menggunakan CSS filters via Canvas)
applyFilters(imageUrl, options: FilterOptions): Promise<ProcessedImage>

// Collage
createCollage(images: string[], options: CollageOptions): Promise<ProcessedImage>

// Remove Background (wrapper untuk library external)
removeBackground(imageUrl): Promise<ProcessedImage>
```

---

## Urutan Implementasi

1. **Phase 1**: Update navigasi dan landing page
2. **Phase 2**: Crop & Rotate (fitur dasar)
3. **Phase 3**: Watermark & Filters (fitur edit)
4. **Phase 4**: Bulk Rename & Collage (fitur batch)
5. **Phase 5**: Remove Background (fitur AI - opsional)

---

## Hasil Akhir

Aplikasi image utilities yang lengkap dengan 10 fitur:
- 3 fitur existing (Resize, Compress, Convert)
- 7 fitur baru (Crop, Rotate, Watermark, Remove BG, Filters, Rename, Collage)
- Semua proses client-side untuk kecepatan dan privasi
- UI konsisten dengan design system existing
- Support batch upload untuk semua fitur
