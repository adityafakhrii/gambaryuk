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
   'nav.resize': { en: 'Resize', id: 'Ubah Ukuran' },
   'nav.compress': { en: 'Compress', id: 'Kompres' },
   'nav.convert': { en: 'Convert', id: 'Konversi' },
   
   // Hero Section
   'hero.title': { en: 'All-in-One Image Tools', id: 'Alat Gambar Lengkap' },
   'hero.subtitle': { en: 'Resize, Compress, Convert — Instantly.', id: 'Ubah Ukuran, Kompres, Konversi — Instan.' },
   'hero.description': { en: 'Optimize your images without hassle. Fast, lightweight, and professional.', id: 'Optimasi gambar lo tanpa ribet. Cepat, ringan, dan profesional.' },
   'hero.cta': { en: 'Upload Image Now', id: 'Upload Gambar Sekarang' },
   
   // Feature Cards
   'feature.resize.title': { en: 'Resize Image', id: 'Ubah Ukuran Gambar' },
   'feature.resize.desc': { en: 'Change dimensions for any platform', id: 'Ubah dimensi untuk platform apapun' },
   'feature.compress.title': { en: 'Compress Image', id: 'Kompres Gambar' },
   'feature.compress.desc': { en: 'Reduce file size, keep quality', id: 'Kurangi ukuran file, jaga kualitas' },
   'feature.convert.title': { en: 'Convert Format', id: 'Konversi Format' },
   'feature.convert.desc': { en: 'JPG, PNG, WEBP conversion', id: 'Konversi JPG, PNG, WEBP' },
   
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
     return (saved as Language) || 'en';
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