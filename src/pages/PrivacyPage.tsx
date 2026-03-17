import { SEO } from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, Eye, Server, Trash2, Globe } from 'lucide-react';

const PrivacyPage = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Lock,
      title: 'Browser-Only Processing',
      titleId: 'Pemrosesan Hanya di Browser',
      content: 'All image processing on GambarYuk happens entirely within your web browser using JavaScript and HTML5 Canvas APIs. Your images are never uploaded to any external server. The moment you open an image, it is loaded into your browser\'s memory and processed locally on your device.',
      contentId: 'Semua pemrosesan gambar di GambarYuk terjadi sepenuhnya di dalam browser web kamu menggunakan JavaScript dan HTML5 Canvas API. Gambar kamu tidak pernah diupload ke server eksternal manapun. Saat kamu membuka gambar, gambar tersebut dimuat ke memori browser dan diproses secara lokal di perangkat kamu.',
    },
    {
      icon: Server,
      title: 'No Server Storage',
      titleId: 'Tidak Ada Penyimpanan Server',
      content: 'GambarYuk does not have any backend server or database that stores your images. We do not collect, store, transmit, or have access to any images you process. There is no cloud storage, no temporary file hosting, and no server-side processing involved at any point.',
      contentId: 'GambarYuk tidak memiliki server backend atau database yang menyimpan gambar kamu. Kami tidak mengumpulkan, menyimpan, mengirimkan, atau memiliki akses ke gambar apapun yang kamu proses. Tidak ada cloud storage, tidak ada hosting file sementara, dan tidak ada pemrosesan server-side yang terlibat.',
    },
    {
      icon: Eye,
      title: 'No Tracking of Image Content',
      titleId: 'Tidak Ada Pelacakan Konten Gambar',
      content: 'We do not analyze, scan, or track the content of your images in any way. No AI analysis, no metadata extraction for tracking purposes, and no image fingerprinting is performed. Your creative work remains entirely private.',
      contentId: 'Kami tidak menganalisis, memindai, atau melacak konten gambar kamu dengan cara apapun. Tidak ada analisis AI, tidak ada ekstraksi metadata untuk tujuan pelacakan, dan tidak ada image fingerprinting yang dilakukan. Karya kreatif kamu tetap sepenuhnya privat.',
    },
    {
      icon: Trash2,
      title: 'Automatic Data Cleanup',
      titleId: 'Pembersihan Data Otomatis',
      content: 'When you close or refresh the browser tab, all image data is automatically cleared from memory. There are no cookies, no local storage entries, and no cached copies of your images left behind. Each session starts completely fresh.',
      contentId: 'Saat kamu menutup atau me-refresh tab browser, semua data gambar otomatis dihapus dari memori. Tidak ada cookies, tidak ada entri local storage, dan tidak ada salinan gambar yang tersisa. Setiap sesi dimulai dari awal.',
    },
    {
      icon: Globe,
      title: 'Open & Transparent',
      titleId: 'Terbuka & Transparan',
      content: 'GambarYuk is a static website — it consists only of HTML, CSS, and JavaScript files served directly to your browser. You can verify this by inspecting the network activity in your browser\'s developer tools. You will see that no image data is ever sent to any server.',
      contentId: 'GambarYuk adalah website statis — hanya terdiri dari file HTML, CSS, dan JavaScript yang disajikan langsung ke browser kamu. Kamu bisa memverifikasi ini dengan memeriksa aktivitas network di developer tools browser kamu. Kamu akan melihat bahwa tidak ada data gambar yang dikirim ke server manapun.',
    },
    {
      icon: Shield,
      title: 'Your Rights',
      titleId: 'Hak Kamu',
      content: 'Since we never collect or store your data, there is nothing to delete, export, or manage. You have complete control over your images at all times. You can use GambarYuk with full confidence that your images remain on your device and are never shared with anyone.',
      contentId: 'Karena kami tidak pernah mengumpulkan atau menyimpan data kamu, tidak ada yang perlu dihapus, diekspor, atau dikelola. Kamu memiliki kontrol penuh atas gambar kamu setiap saat. Kamu bisa menggunakan GambarYuk dengan keyakinan penuh bahwa gambar kamu tetap di perangkat kamu dan tidak pernah dibagikan ke siapapun.',
    },
  ];

  const isId = true; // We'll use the language context

  return (
    <div className="min-h-full flex flex-col">
      <SEO title={t('privacy.title')} description={t('privacy.subtitle')} path="/privacy" />
      <main className="relative z-10 flex-1 px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {t('privacy.title')}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t('privacy.subtitle')}
            </p>
          </div>

          {/* TL;DR Box */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-10">
            <h2 className="text-lg font-bold text-foreground mb-2">TL;DR</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {t('privacy.tldr')}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const SectionIcon = section.icon;
              const lang = t('nav.home') === 'Home' ? 'en' : 'id';
              return (
                <div key={index} className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {lang === 'id' ? section.titleId : section.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {lang === 'id' ? section.contentId : section.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Last updated */}
          <p className="mt-10 text-center text-xs text-muted-foreground/60">
            {t('privacy.lastUpdated')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-6">
        <div className="container mx-auto max-w-5xl text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © 2026 GambarYuk. Part of YukAccess.
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t('footer.browserOnly')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
