import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'id';

interface Translations {
  [key: string]: {
    en: string;
    id: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', id: 'Beranda' },
  'nav.tools': { en: 'Tools', id: 'Alat' },
  'nav.resize': { en: 'Resize', id: 'Ubah Ukuran' },
  'nav.compress': { en: 'Compress', id: 'Kompres' },
  'nav.convert': { en: 'Convert', id: 'Konversi' },
  'nav.crop': { en: 'Crop', id: 'Potong' },
  'nav.rotate': { en: 'Rotate & Flip', id: 'Putar & Balik' },
  'nav.watermark': { en: 'Watermark', id: 'Tanda Air' },
  'nav.removeBg': { en: 'Remove Background', id: 'Hapus Latar' },
  'nav.filters': { en: 'Filters', id: 'Filter' },
  'nav.rename': { en: 'Bulk Rename', id: 'Rename Massal' },
  'nav.collage': { en: 'Collage', id: 'Kolase' },
  'nav.imageToLink': { en: 'Image to Link', id: 'Gambar ke Link' },
  
  // Hero Section
  'hero.title': { en: 'All-in-One Image Tools', id: 'Alat Gambar Lengkap' },
  'hero.subtitle': { en: 'Resize, Compress, Convert — Instantly.', id: 'Ubah Ukuran, Kompres, Konversi — Instan.' },
  'hero.description': { en: 'Optimize your images without hassle. Fast, lightweight, and professional.', id: 'Optimasi gambar lo tanpa ribet. Cepat, ringan, dan profesional.' },
  'hero.cta': { en: 'Upload Image Now', id: 'Upload Gambar Sekarang' },
  
  // App Branding
  'app.slogan': { en: 'Edit images? Just upload and go! AD-FREE, 100% FREE!', id: 'Edit gambar? Langsung upload gas! TANPA IKLAN, 100% GRATIS!' },
  
  // Footer
  'footer.privacy': { en: 'Your images never leave your device', id: 'Gambar kamu nggak pernah keluar dari device kamu' },
  'footer.browserOnly': { en: 'All processing happens in your browser — zero data stored.', id: 'Semua proses terjadi di browser kamu — nol data tersimpan.' },
  
  // Privacy Page
  'privacy.title': { en: 'Privacy Policy', id: 'Kebijakan Privasi' },
  'privacy.subtitle': { en: 'We take your privacy seriously. Here\'s exactly what happens with your images.', id: 'Kami serius soal privasi kamu. Ini penjelasan lengkap tentang apa yang terjadi dengan gambar kamu.' },
  'privacy.tldr': { en: 'Your images never leave your browser. GambarYuk has no server, no database, and no way to access your files. Everything is processed locally on your device using JavaScript. When you close the tab, everything is gone. Period.', id: 'Gambar kamu nggak pernah keluar dari browser. GambarYuk nggak punya server, nggak punya database, dan nggak bisa akses file kamu. Semua diproses secara lokal di perangkat kamu pakai JavaScript. Kalau tab ditutup, semua hilang. Titik.' },
  'privacy.lastUpdated': { en: 'Last updated: February 2026', id: 'Terakhir diperbarui: Februari 2026' },
  
  // Feature Categories
  'category.essential': { en: 'Essential Tools', id: 'Alat Utama' },
  'category.edit': { en: 'Edit Tools', id: 'Alat Edit' },
  'category.advanced': { en: 'Advanced Tools', id: 'Alat Lanjutan' },
  
  // Feature Cards
  'feature.resize.title': { en: 'Resize Image', id: 'Ubah Ukuran Gambar' },
  'feature.resize.desc': { en: 'Change dimensions for any platform', id: 'Ubah dimensi untuk platform apapun' },
  'feature.compress.title': { en: 'Compress Image', id: 'Kompres Gambar' },
  'feature.compress.desc': { en: 'Reduce file size, keep quality', id: 'Kurangi ukuran file, jaga kualitas' },
  'feature.convert.title': { en: 'Convert Format', id: 'Konversi Format' },
  'feature.convert.desc': { en: 'JPG, PNG, WEBP conversion', id: 'Konversi JPG, PNG, WEBP' },
  'feature.crop.title': { en: 'Crop Image', id: 'Potong Gambar' },
  'feature.crop.desc': { en: 'Cut images with preset ratios', id: 'Potong gambar dengan rasio preset' },
  'feature.rotate.title': { en: 'Rotate & Flip', id: 'Putar & Balik' },
  'feature.rotate.desc': { en: 'Rotate 90°/180° and flip', id: 'Putar 90°/180° dan balik' },
  'feature.watermark.title': { en: 'Add Watermark', id: 'Tambah Tanda Air' },
  'feature.watermark.desc': { en: 'Add text or logo watermark', id: 'Tambah teks atau logo watermark' },
  'feature.removeBg.title': { en: 'Remove Background', id: 'Hapus Latar Belakang' },
  'feature.removeBg.desc': { en: 'Auto remove image background', id: 'Hapus latar belakang otomatis' },
  'feature.filters.title': { en: 'Image Filters', id: 'Filter Gambar' },
  'feature.filters.desc': { en: 'Brightness, contrast, effects', id: 'Kecerahan, kontras, efek' },
  'feature.rename.title': { en: 'Bulk Rename', id: 'Rename Massal' },
  'feature.rename.desc': { en: 'Rename multiple files at once', id: 'Rename banyak file sekaligus' },
  'feature.collage.title': { en: 'Create Collage', id: 'Buat Kolase' },
  'feature.collage.desc': { en: 'Merge images into a grid', id: 'Gabung gambar jadi grid' },
  'feature.imageToLink.title': { en: 'Image to Link', id: 'Gambar ke Link' },
  'feature.imageToLink.desc': { en: 'Upload image and get a shareable link', id: 'Upload gambar dan dapatkan link yang bisa dibagikan' },

  // Fase 1 tools
  'feature.metadata.title': { en: 'EXIF / Metadata Viewer', id: 'Lihat Metadata / EXIF' },
  'feature.metadata.desc': { en: 'View image metadata, EXIF, camera info', id: 'Lihat metadata gambar, EXIF, info kamera' },
  'feature.colorPicker.title': { en: 'Color Picker', id: 'Ambil Warna' },
  'feature.colorPicker.desc': { en: 'Pick colors from any image', id: 'Ambil warna dari gambar apapun' },
  'feature.base64.title': { en: 'Base64 Encode/Decode', id: 'Base64 Encode/Decode' },
  'feature.base64.desc': { en: 'Convert image to/from Base64', id: 'Konversi gambar ke/dari Base64' },
  'feature.qrCode.title': { en: 'QR Code Generator', id: 'Pembuat QR Code' },
  'feature.qrCode.desc': { en: 'Generate QR code from text/URL', id: 'Buat QR code dari teks/URL' },
  'feature.favicon.title': { en: 'Image to Icon', id: 'Gambar ke Ikon' },
  'feature.favicon.desc': { en: 'Generate favicon & app icon set', id: 'Buat set favicon & ikon aplikasi' },

  // Nav for new tools
  'nav.metadata': { en: 'EXIF Viewer', id: 'Lihat EXIF' },
  'nav.colorPicker': { en: 'Color Picker', id: 'Ambil Warna' },
  'nav.base64': { en: 'Base64', id: 'Base64' },
  'nav.qrCode': { en: 'QR Code', id: 'QR Code' },
  'nav.favicon': { en: 'Image to Icon', id: 'Gambar ke Ikon' },

  // Category
  'category.utility': { en: 'Info & Utility', id: 'Info & Utilitas' },

  // Color Picker page
  'colorPicker.clickToPick': { en: 'Click anywhere to pick a color', id: 'Klik di mana saja untuk ambil warna' },
  'colorPicker.dominant': { en: 'Dominant Colors', id: 'Warna Dominan' },
  'colorPicker.picked': { en: 'Picked Colors', id: 'Warna Terpilih' },

  // Base64 page
  'base64.encode': { en: 'Image → Base64', id: 'Gambar → Base64' },
  'base64.decode': { en: 'Base64 → Image', id: 'Base64 → Gambar' },
  'base64.pasteHere': { en: 'Paste Base64 string here', id: 'Tempel string Base64 di sini' },

  // QR Code page
  'qrCode.content': { en: 'Text or URL', id: 'Teks atau URL' },
  'qrCode.size': { en: 'Size', id: 'Ukuran' },
  'qrCode.fgColor': { en: 'Foreground', id: 'Warna Depan' },
  'qrCode.bgColor': { en: 'Background', id: 'Warna Latar' },
  'qrCode.errorLevel': { en: 'Error Correction', id: 'Koreksi Error' },
  'qrCode.logo': { en: 'Logo (optional)', id: 'Logo (opsional)' },
  'qrCode.logoHint': { en: 'Drop logo image here', id: 'Letakkan logo di sini' },
  'qrCode.generate': { en: 'Generate QR Code', id: 'Buat QR Code' },
  'qrCode.preview': { en: 'QR code will appear here', id: 'QR code akan muncul di sini' },

  // Favicon page
  'favicon.generate': { en: 'Generate Icons', id: 'Buat Ikon' },
  'favicon.results': { en: 'Generated Icons', id: 'Ikon yang Dibuat' },
  'favicon.downloadAll': { en: 'Download All as ZIP', id: 'Unduh Semua sebagai ZIP' },

  // Fase 2 tools
  'feature.splitter.title': { en: 'Image Splitter', id: 'Pemotong Gambar' },
  'feature.splitter.desc': { en: 'Split image into grid for carousel', id: 'Potong gambar jadi grid untuk carousel' },
  'feature.blur.title': { en: 'Blur / Censor', id: 'Blur / Sensor' },
  'feature.blur.desc': { en: 'Blur or pixelate sensitive areas', id: 'Blur atau pixelate area sensitif' },
  'feature.meme.title': { en: 'Meme Generator', id: 'Pembuat Meme' },
  'feature.meme.desc': { en: 'Add text to images, meme style', id: 'Tambah teks ke gambar, gaya meme' },
  'feature.compare.title': { en: 'Image Compare', id: 'Bandingkan Gambar' },
  'feature.compare.desc': { en: 'Before/after comparison slider', id: 'Slider perbandingan sebelum/sesudah' },
  'feature.beautifier.title': { en: 'Screenshot Beautifier', id: 'Percantik Screenshot' },
  'feature.beautifier.desc': { en: 'Add mockup, gradient, shadow', id: 'Tambah mockup, gradien, bayangan' },

  // Nav Fase 2
  'nav.splitter': { en: 'Image Splitter', id: 'Pemotong Gambar' },
  'nav.blur': { en: 'Blur / Censor', id: 'Blur / Sensor' },
  'nav.meme': { en: 'Meme Generator', id: 'Pembuat Meme' },
  'nav.compare': { en: 'Image Compare', id: 'Bandingkan Gambar' },
  'nav.beautifier': { en: 'Beautifier', id: 'Percantik' },

  // Category
  'category.generate': { en: 'Generate & Transform', id: 'Buat & Transformasi' },

  // Splitter page
  'splitter.grid': { en: 'Grid Layout', id: 'Layout Grid' },
  'splitter.split': { en: 'Split Image', id: 'Potong Gambar' },

  // Blur page
  'blur.gaussian': { en: 'Blur', id: 'Blur' },
  'blur.pixelate': { en: 'Pixelate', id: 'Pixelate' },
  'blur.intensity': { en: 'Intensity', id: 'Intensitas' },
  'blur.undo': { en: 'Undo', id: 'Batalkan' },
  'blur.dragHint': { en: 'Draw rectangles on the image to mark areas for blurring', id: 'Gambar kotak pada gambar untuk menandai area yang akan di-blur' },

  // Meme page
  'meme.topText': { en: 'Top Text', id: 'Teks Atas' },
  'meme.bottomText': { en: 'Bottom Text', id: 'Teks Bawah' },
  'meme.topPlaceholder': { en: 'TOP TEXT HERE', id: 'TEKS ATAS DI SINI' },
  'meme.bottomPlaceholder': { en: 'BOTTOM TEXT HERE', id: 'TEKS BAWAH DI SINI' },
  'meme.fontSize': { en: 'Font Size', id: 'Ukuran Font' },
  'meme.generate': { en: 'Generate Meme', id: 'Buat Meme' },

  // Compare page
  'compare.uploadFirst': { en: 'Upload first image (Before)', id: 'Upload gambar pertama (Sebelum)' },
  'compare.uploadSecond': { en: 'Upload second image (After)', id: 'Upload gambar kedua (Sesudah)' },
  'compare.before': { en: 'Before', id: 'Sebelum' },
  'compare.after': { en: 'After', id: 'Sesudah' },

  // Beautifier page
  'beautifier.bg': { en: 'Background', id: 'Latar Belakang' },
  'beautifier.mockup': { en: 'Frame Style', id: 'Gaya Bingkai' },
  'beautifier.padding': { en: 'Padding', id: 'Padding' },
  'beautifier.radius': { en: 'Border Radius', id: 'Radius Sudut' },
  'beautifier.shadow': { en: 'Shadow', id: 'Bayangan' },
  'beautifier.generate': { en: 'Beautify', id: 'Percantik' },

  // Image to Link
  'imageToLink.readyToUpload': { en: 'images ready to upload', id: 'gambar siap diupload' },
  'imageToLink.uploading': { en: 'Uploading...', id: 'Mengupload...' },
  'imageToLink.generateLinks': { en: 'Generate Links', id: 'Buat Link' },
  'imageToLink.generatedLinks': { en: 'Generated Links', id: 'Link yang Dibuat' },
  'imageToLink.copyAll': { en: 'Copy All', id: 'Salin Semua' },
  'imageToLink.allCopied': { en: 'All links copied!', id: 'Semua link tersalin!' },
  'imageToLink.uploaded': { en: '{count} images uploaded successfully!', id: '{count} gambar berhasil diupload!' },
  'imageToLink.expiry': { en: 'Auto-delete after', id: 'Hapus otomatis setelah' },
  'imageToLink.expiry.24h': { en: '24 hours', id: '24 jam' },
  'imageToLink.expiry.7d': { en: '7 days', id: '7 hari' },
  'imageToLink.expiry.30d': { en: '30 days', id: '30 hari' },
  'imageToLink.expiry.90d': { en: '90 days', id: '90 hari' },
  'imageToLink.expiry.forever': { en: 'Forever', id: 'Selamanya' },
  'imageToLink.downloadAllZip': { en: 'Download All as ZIP', id: 'Unduh Semua sebagai ZIP' },
  
  // Benefits
  'benefits.title': { en: 'Why Use Our Tools?', id: 'Kenapa Pakai Tools Kami?' },
  'benefits.fast.title': { en: 'Lightning Fast', id: 'Super Cepat' },
  'benefits.fast.desc': { en: 'All processing happens in your browser. No waiting for uploads.', id: 'Semua proses di browser kamu. Tidak perlu menunggu upload.' },
  'benefits.private.title': { en: 'Privacy First', id: 'Privasi Utama' },
  'benefits.private.desc': { en: 'Images never leave your device. 100% secure.', id: 'Gambar tidak pernah keluar dari device kamu. 100% aman.' },
  'benefits.free.title': { en: 'Always Free', id: 'Selalu Gratis' },
  'benefits.free.desc': { en: 'No limits, no watermarks, no registration required.', id: 'Tanpa batas, tanpa watermark, tanpa registrasi.' },
  
  // Upload Zone
  'upload.title': { en: 'Drop your images here', id: 'Letakkan gambar kamu di sini' },
  'upload.subtitle': { en: 'or click to browse', id: 'atau klik untuk memilih' },
  'upload.formats': { en: 'Supports JPG, PNG, WEBP', id: 'Mendukung JPG, PNG, WEBP' },
  'upload.batch': { en: 'Upload multiple files at once', id: 'Upload banyak file sekaligus' },
  
  // Resize Tool
  'resize.title': { en: 'Resize Image', id: 'Ubah Ukuran Gambar' },
  'resize.width': { en: 'Width', id: 'Lebar' },
  'resize.height': { en: 'Height', id: 'Tinggi' },
  'resize.aspectRatio': { en: 'Lock aspect ratio', id: 'Kunci rasio aspek' },
  'resize.presets': { en: 'Quick Presets', id: 'Preset Cepat' },
  'resize.instagram.post': { en: 'Instagram Post', id: 'Post Instagram' },
  'resize.instagram.story': { en: 'Instagram Story', id: 'Story Instagram' },
  'resize.youtube': { en: 'YouTube Thumbnail', id: 'Thumbnail YouTube' },
  'resize.banner': { en: 'Website Banner', id: 'Banner Website' },
  'resize.custom': { en: 'Custom', id: 'Kustom' },
  
  // Compress Tool
  'compress.title': { en: 'Compress Image', id: 'Kompres Gambar' },
  'compress.quality': { en: 'Quality', id: 'Kualitas' },
  'compress.mode': { en: 'Compression Mode', id: 'Mode Kompresi' },
  'compress.balanced': { en: 'Balanced (Recommended)', id: 'Seimbang (Rekomendasi)' },
  'compress.maximum': { en: 'Maximum Compression', id: 'Kompresi Maksimal' },
  'compress.highQuality': { en: 'High Quality', id: 'Kualitas Tinggi' },
  'compress.before': { en: 'Before', id: 'Sebelum' },
  'compress.after': { en: 'After', id: 'Sesudah' },
  'compress.reduction': { en: 'Size reduced by', id: 'Ukuran berkurang' },
  'compress.success': { en: 'File size reduced — web loading will be faster 🚀', id: 'Ukuran file berkurang — loading web akan lebih cepat 🚀' },
  
  // Convert Tool
  'convert.title': { en: 'Convert Format', id: 'Konversi Format' },
  'convert.from': { en: 'Current Format', id: 'Format Saat Ini' },
  'convert.to': { en: 'Convert To', id: 'Konversi Ke' },
  'convert.transparency': { en: 'Preserve transparency', id: 'Pertahankan transparansi' },
  
  // Crop Tool
  'crop.title': { en: 'Crop Image', id: 'Potong Gambar' },
  'crop.ratio': { en: 'Aspect Ratio', id: 'Rasio Aspek' },
  'crop.free': { en: 'Free', id: 'Bebas' },
  'crop.square': { en: 'Square (1:1)', id: 'Kotak (1:1)' },
  'crop.landscape': { en: 'Landscape (16:9)', id: 'Landscape (16:9)' },
  'crop.portrait': { en: 'Portrait (9:16)', id: 'Portrait (9:16)' },
  'crop.apply': { en: 'Apply Crop', id: 'Terapkan Crop' },
  
  // Rotate Tool
  'rotate.title': { en: 'Rotate & Flip', id: 'Putar & Balik' },
  'rotate.left': { en: 'Rotate Left 90°', id: 'Putar Kiri 90°' },
  'rotate.right': { en: 'Rotate Right 90°', id: 'Putar Kanan 90°' },
  'rotate.180': { en: 'Rotate 180°', id: 'Putar 180°' },
  'rotate.flipH': { en: 'Flip Horizontal', id: 'Balik Horizontal' },
  'rotate.flipV': { en: 'Flip Vertical', id: 'Balik Vertikal' },
  'rotate.custom': { en: 'Custom Angle', id: 'Sudut Kustom' },
  
  // Watermark Tool
  'watermark.title': { en: 'Add Watermark', id: 'Tambah Tanda Air' },
  'watermark.text': { en: 'Text Watermark', id: 'Watermark Teks' },
  'watermark.image': { en: 'Image Watermark', id: 'Watermark Gambar' },
  'watermark.content': { en: 'Watermark Text', id: 'Teks Watermark' },
  'watermark.position': { en: 'Position', id: 'Posisi' },
  'watermark.opacity': { en: 'Opacity', id: 'Transparansi' },
  'watermark.size': { en: 'Size', id: 'Ukuran' },
  'watermark.color': { en: 'Color', id: 'Warna' },
  
  // Remove Background Tool
  'removeBg.title': { en: 'Remove Background', id: 'Hapus Latar Belakang' },
  'removeBg.processing': { en: 'Processing... This may take a moment', id: 'Memproses... Mohon tunggu sebentar' },
  'removeBg.success': { en: 'Background removed successfully!', id: 'Latar belakang berhasil dihapus!' },
  'removeBg.transparent': { en: 'Transparent Background', id: 'Latar Transparan' },
  'removeBg.solid': { en: 'Solid Color Background', id: 'Latar Warna Solid' },
  
  // Filters Tool
  'filters.title': { en: 'Image Filters', id: 'Filter Gambar' },
  'filters.brightness': { en: 'Brightness', id: 'Kecerahan' },
  'filters.contrast': { en: 'Contrast', id: 'Kontras' },
  'filters.saturation': { en: 'Saturation', id: 'Saturasi' },
  'filters.blur': { en: 'Blur', id: 'Blur' },
  'filters.grayscale': { en: 'Grayscale', id: 'Hitam Putih' },
  'filters.sepia': { en: 'Sepia', id: 'Sepia' },
  'filters.invert': { en: 'Invert', id: 'Balik Warna' },
  'filters.vintage': { en: 'Vintage', id: 'Vintage' },
  'filters.reset': { en: 'Reset All', id: 'Reset Semua' },
  
  // Bulk Rename Tool
  'rename.title': { en: 'Bulk Rename', id: 'Rename Massal' },
  'rename.pattern': { en: 'Naming Pattern', id: 'Pola Penamaan' },
  'rename.startIndex': { en: 'Start Index', id: 'Indeks Awal' },
  'rename.preview': { en: 'Preview Names', id: 'Preview Nama' },
  'rename.tokens': { en: 'Available tokens: {name}, {index}, {date}, {width}, {height}', id: 'Token tersedia: {name}, {index}, {date}, {width}, {height}' },
  'rename.downloadZip': { en: 'Download as ZIP', id: 'Unduh sebagai ZIP' },
  
  // Collage Tool
  'collage.title': { en: 'Create Collage', id: 'Buat Kolase' },
  'collage.template': { en: 'Template', id: 'Template' },
  'collage.gap': { en: 'Gap / Spacing', id: 'Jarak / Spasi' },
  'collage.bgColor': { en: 'Background Color', id: 'Warna Latar' },
  'collage.generate': { en: 'Generate Collage', id: 'Buat Kolase' },
  'collage.minImages': { en: 'Upload at least 2 images', id: 'Upload minimal 2 gambar' },
  
  // Common
  'common.download': { en: 'Download', id: 'Unduh' },
  'common.downloadAll': { en: 'Download All', id: 'Unduh Semua' },
  'common.process': { en: 'Process Image', id: 'Proses Gambar' },
  'common.processAll': { en: 'Process All', id: 'Proses Semua' },
  'common.original': { en: 'Original', id: 'Asli' },
  'common.result': { en: 'Result', id: 'Hasil' },
  'common.size': { en: 'Size', id: 'Ukuran' },
  'common.dimensions': { en: 'Dimensions', id: 'Dimensi' },
  'common.format': { en: 'Format', id: 'Format' },
  'common.processing': { en: 'Processing...', id: 'Memproses...' },
  'common.success': { en: 'Success! Your image is ready 🎉', id: 'Berhasil! Gambarmu sudah siap 🎉' },
  'common.clear': { en: 'Clear', id: 'Hapus' },
  'common.clearAll': { en: 'Clear All', id: 'Hapus Semua' },
  'common.apply': { en: 'Apply', id: 'Terapkan' },
  'common.getStarted': { en: 'Get started', id: 'Mulai' },
  
  // Errors
  'error.unsupported': { en: 'Unsupported file format', id: 'Format file tidak didukung' },
  'error.tooLarge': { en: 'File too large (max 10MB)', id: 'File terlalu besar (maks 10MB)' },
  'error.uploadFailed': { en: 'Upload failed. Please try again.', id: 'Upload gagal. Silakan coba lagi.' },
  
  // Theme & Language
  'theme.light': { en: 'Light', id: 'Terang' },
  'theme.dark': { en: 'Dark', id: 'Gelap' },
  'language.en': { en: 'English', id: 'English' },
  'language.id': { en: 'Indonesian', id: 'Indonesia' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'id'; // Default to Indonesian
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}