import { SEO } from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Code2, BrainCircuit, GraduationCap, PenTool, Github, Instagram, Twitter, Facebook, Youtube, Linkedin, Coffee, WifiOff, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonationModal } from '@/components/DonationModal';

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-full flex flex-col">
      <SEO title={t('about.title')} description={t('about.subtitle')} path="/about" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-16 flex-1">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t('about.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('about.subtitle')}
          </p>
        </div>

        {/* About GambarYuk */}
        <div className="card-soft p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t('about.whatIs')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        {/* Offline Access & PWA Installation Guide */}
        <div className="card-soft p-6 sm:p-8 mb-8 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <WifiOff className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'id' ? 'Akses Offline & Instalasi' : 'Offline Access & Installation'}
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
            {language === 'id'
              ? 'GambarYuk dapat diakses dan digunakan sepenuhnya secara offline (tanpa koneksi internet) setelah diinstal di perangkat Anda. Seluruh proses pengeditan gambar berjalan secara lokal di dalam browser Anda tanpa mengirim data apa pun ke server.'
              : 'GambarYuk can be fully accessed and used offline (without an internet connection) once installed on your device. All image editing processes run locally within your browser without sending any data to the server.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop */}
            <div className="p-4 rounded-xl bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  {language === 'id' ? 'Di Desktop (PC / Laptop)' : 'On Desktop (PC / Laptop)'}
                </h3>
              </div>
              <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-2 leading-relaxed">
                <li>
                  {language === 'id'
                    ? 'Buka browser (Chrome, Edge, Opera, dll).'
                    : 'Open your browser (Chrome, Edge, Opera, etc.).'}
                </li>
                <li>
                  {language === 'id'
                    ? 'Klik ikon unduh/instal (tanda plus atau monitor panah) di sebelah kanan address bar.'
                    : 'Click the download/install icon (plus sign or monitor icon) on the right side of the address bar.'}
                </li>
                <li>
                  {language === 'id'
                    ? 'Klik tombol "Instal" pada pop-up yang muncul.'
                    : 'Click the "Install" button on the pop-up that appears.'}
                </li>
              </ol>
            </div>

            {/* Mobile */}
            <div className="p-4 rounded-xl bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  {language === 'id' ? 'Di Mobile (HP / Tablet)' : 'On Mobile (Phone / Tablet)'}
                </h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <li>
                  <span className="font-semibold text-foreground">Android (Chrome): </span>
                  {language === 'id'
                    ? 'Klik banner "Instal Aplikasi" di bagian bawah layar, atau klik ikon titik tiga di pojok kanan atas lalu pilih "Tambahkan ke Layar Utama".'
                    : 'Click the "Install App" banner at the bottom of the screen, or tap the three dots icon in the top right and select "Add to Home Screen".'}
                </li>
                <li>
                  <span className="font-semibold text-foreground">iOS (Safari): </span>
                  {language === 'id'
                    ? 'Ketuk tombol "Bagikan" (Share) di bagian bawah layar Safari, gulir ke bawah, lalu ketuk "Tambahkan ke Layar Utama" (Add to Home Screen).'
                    : 'Tap the "Share" button at the bottom of the Safari screen, scroll down, and tap "Add to Home Screen".'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Creator */}
        <div className="card-soft p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">{t('about.creator')}</h2>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-sm">
              <img src="https://i.ibb.co.com/BHwXQ6K5/Foto-Aditya-Fakhri-2-1.webp" alt="Aditya Fakhri" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1">Aditya Fakhri Riansyah</h3>
              <p className="text-primary font-medium text-sm mb-3">Fullstack Developer</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <a href="https://github.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://www.threads.net/@adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground font-medium text-xs leading-none flex items-center justify-center">
                  @
                </a>
                <a href="https://x.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="X (Twitter)">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://facebook.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://youtube.com/@adityafakhrii" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/adityafakhrii/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('about.creatorBio')}
              </p>

              {/* Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BrainCircuit className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('about.skill.ai')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('about.skill.mentoring')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PenTool className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('about.skill.content')}</span>
                </div>
              </div>

              {/* Website link */}
              <a
                href="https://www.adityafakhri.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                adityafakhri.com
              </a>
            </div>
          </div>
        </div>

        {/* Support Us */}
        <div className="card-soft p-6 sm:p-8 border-primary/20 bg-primary/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground mb-2">{t('about.support')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-5 text-sm sm:text-base">
                {t('about.supportDesc')}
              </p>
              <DonationModal>
                <Button className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold px-6">
                  <span className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    {t('about.supportBtn')}
                  </span>
                </Button>
              </DonationModal>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-6">
        <div className="container mx-auto max-w-5xl text-center space-y-3">
          <div className="flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
            <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
            <a
              href="https://instagram.com/gambar.yuk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-medium"
            >
              @gambar.yuk
            </a>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              © 2026 GambarYuk. Part of YukAccess.
            </p>
            <p className="text-xs text-muted-foreground/70">
              {t('footer.browserOnly')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
