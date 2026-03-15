import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Code2, BrainCircuit, GraduationCap, PenTool, Github, Instagram, Twitter, Facebook, Youtube, Linkedin, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonationModal } from '@/components/DonationModal';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-full">
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-16">
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
    </div>
  );
}
