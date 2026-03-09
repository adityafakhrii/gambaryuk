import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Code2, BrainCircuit, GraduationCap, PenTool } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="page-gradient min-h-full">
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
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Code2 className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1">Aditya Fakhri Riansyah</h3>
              <p className="text-primary font-medium text-sm mb-3">Fullstack Developer</p>
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

        {/* Tech Stack */}
        <div className="card-soft p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t('about.techStack')}</h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Lovable Cloud', 'Canvas API'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
