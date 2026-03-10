import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, ChevronRight, ChevronLeft, Search, Layers, Wand2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WALKTHROUGH_KEY = 'gambaryuk_walkthrough_done';

interface Step {
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    titleEn: 'Welcome to GambarYuk! 👋',
    titleId: 'Selamat datang di GambarYuk! 👋',
    descEn: 'Free image editing platform with 25+ tools. All processing happens in your browser — your files never leave your device.',
    descId: 'Platform edit gambar gratis dengan 25+ tools. Semua proses terjadi di browser — file kamu tidak pernah keluar dari device.',
    icon: Layers,
  },
  {
    titleEn: 'Smart Search',
    titleId: 'Pencarian Pintar',
    descEn: 'Describe what you need in natural language, like "I want to make my image smaller" and we\'ll suggest the right tools.',
    descId: 'Deskripsikan kebutuhanmu dengan bahasa sehari-hari, seperti "saya mau kecilin gambar" dan kami akan sarankan tools yang tepat.',
    icon: Search,
  },
  {
    titleEn: '25+ Powerful Tools',
    titleId: '25+ Tools Canggih',
    descEn: 'From basic resize & compress to AI-powered upscale, OCR, and image generation. Find them all in the sidebar.',
    descId: 'Dari resize & kompres dasar sampai AI upscale, OCR, dan pembuat gambar. Temukan semua di sidebar.',
    icon: Wand2,
  },
  {
    titleEn: 'Multi-Language Support',
    titleId: 'Dukungan Multi-Bahasa',
    descEn: 'Switch between English and Indonesian anytime from the sidebar. Your preference is saved automatically.',
    descId: 'Ganti antara English dan Indonesia kapan saja dari sidebar. Preferensi kamu disimpan otomatis.',
    icon: Globe,
  },
];

export function Walkthrough() {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(WALKTHROUGH_KEY);
    if (!done) {
      // Small delay so page loads first
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(WALKTHROUGH_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!show) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <StepIcon className="h-7 w-7" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-lg font-bold text-foreground text-center">
          {language === 'id' ? step.titleId : step.titleEn}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed">
          {language === 'id' ? step.descId : step.descEn}
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {language === 'id' ? 'Kembali' : 'Back'}
          </Button>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {isLast
              ? language === 'id'
                ? 'Mulai!'
                : "Let's Go!"
              : language === 'id'
              ? 'Lanjut'
              : 'Next'}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={handleClose}
          className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {language === 'id' ? 'Lewati tutorial' : 'Skip tutorial'}
        </button>
      </div>
    </div>
  );
}
