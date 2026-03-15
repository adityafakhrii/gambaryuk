import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Joyride, { Step, CallBackProps, STATUS, TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const WALKTHROUGH_KEY = 'gambaryuk_walkthrough_done';

const CustomTooltip = ({
  index,
  step,
  tooltipProps,
  primaryProps,
  backProps,
  skipProps,
  isLastStep,
  closeProps,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="w-full max-w-[340px] bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-5 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          {...closeProps}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        {step.title && (
          <h3 className="text-lg font-bold text-foreground pr-6 mb-2">
            {step.title}
          </h3>
        )}
        <div className="text-sm text-muted-foreground leading-relaxed">
          {step.content}
        </div>
      </div>
      
      <div className="px-5 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
        {!isLastStep ? (
          <button
            {...skipProps}
            className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            {skipProps.title}
          </button>
        ) : (
          <div /> /* Empty div to keep flex alignment */
        )}
        
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button {...backProps} variant="outline" size="sm" className="h-8 text-xs px-3">
              {backProps.title}
            </Button>
          )}
          <Button {...primaryProps} size="sm" className="h-8 text-xs px-3">
            {primaryProps.title}
          </Button>
        </div>
      </div>
    </div>
  );
};

export function Walkthrough() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(WALKTHROUGH_KEY);
    if (!done) {
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(WALKTHROUGH_KEY, 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: language === 'id' ? 'Selamat datang di GambarYuk!' : 'Welcome to GambarYuk!',
      content: language === 'id'  
        ? 'Platform edit gambar gratis dengan 25+ tools. Semua proses terjadi di browser — file kamu tidak pernah keluar dari device. Mari kita lihat sekilas!'
        : 'Free image editing platform with 25+ tools. All processing happens in your browser — your files never leave your device. Let\'s take a quick tour!',
      disableBeacon: true,
    },
    {
      target: '#tour-sidebar',
      title: language === 'id' ? 'Akses Alat Lengkap' : 'Access All Tools',
      content: language === 'id'
        ? 'Dari resize & kompres dasar sampai AI upscale, semua fitur tersedia lengkap di sidebar sebelah kiri ini.'
        : 'From basic resize & compress to AI upscale, all features are neatly organized in this left sidebar.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#tour-search',
      title: language === 'id' ? 'Pencarian Pintar' : 'Smart Search',
      content: language === 'id'
        ? 'Bingung cari alat? Ketik saja di sini dengan bahasa membumi, misalnya "saya mau kecilin gambar".'
        : 'Lost? Just describe what you need here naturally, like "I want to make my image smaller".',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-grid',
      title: language === 'id' ? 'Eksplorasi Fitur' : 'Explore Features',
      content: language === 'id'
        ? 'Kamu juga bisa melihat seluruh katalog alat dengan rapi di sini, lengkap dengan jumlah alat aktif dan yang sedang digarap.'
        : 'You can also browse the entire catalog of nicely sorted tools here, complete with active vs coming soon metrics.',
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '#tour-language',
      title: language === 'id' ? 'Ganti Bahasa' : 'Switch Language',
      content: language === 'id'
        ? 'Kamu bisa mengganti bahasa aplikasi kapan saja di pojok kiri bawah ini.'
        : 'You can switch the app language anytime at the bottom left here.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#tour-donate',
      title: language === 'id' ? 'Dukung Kami' : 'Support Us',
      content: language === 'id'
        ? 'Suka dengan GambarYuk? Kamu bisa traktir kopi kreatornya di sini. Selamat berkreasi!'
        : 'Enjoying GambarYuk? You can buy the creator a coffee here. Happy creating!',
      placement: 'bottom',
      disableBeacon: true,
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      tooltipComponent={CustomTooltip}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.65)',
        },
      }}
      locale={{
        back: language === 'id' ? 'Kembali' : 'Back',
        close: language === 'id' ? 'Tutup' : 'Close',
        last: language === 'id' ? 'Mulai!' : 'Let\'s Go!',
        next: language === 'id' ? 'Lanjut' : 'Next',
        skip: language === 'id' ? 'Lewati tutorial' : 'Skip',
      }}
    />
  );
}
