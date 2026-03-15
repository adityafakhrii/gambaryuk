import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedPage from './AnimatedPage';
import { PageSkeleton } from '@/components/ui/page-skeleton';

const Index = lazy(() => import('@/pages/Index'));
const ResizePage = lazy(() => import('@/pages/ResizePage'));
const CompressPage = lazy(() => import('@/pages/CompressPage'));
const ConvertPage = lazy(() => import('@/pages/ConvertPage'));
const CropPage = lazy(() => import('@/pages/CropPage'));
const RotatePage = lazy(() => import('@/pages/RotatePage'));
const WatermarkPage = lazy(() => import('@/pages/WatermarkPage'));
const RemoveWatermarkPage = lazy(() => import('@/pages/RemoveWatermarkPage'));
const RemoveBgPage = lazy(() => import('@/pages/RemoveBgPage'));
const FiltersPage = lazy(() => import('@/pages/FiltersPage'));
const RenamePage = lazy(() => import('@/pages/RenamePage'));
const CollagePage = lazy(() => import('@/pages/CollagePage'));
const ImageToLinkPage = lazy(() => import('@/pages/ImageToLinkPage'));
const MetadataPage = lazy(() => import('@/pages/MetadataPage'));
const ColorPickerPage = lazy(() => import('@/pages/ColorPickerPage'));
const Base64Page = lazy(() => import('@/pages/Base64Page'));
const QrCodePage = lazy(() => import('@/pages/QrCodePage'));
const FaviconPage = lazy(() => import('@/pages/FaviconPage'));
const SplitterPage = lazy(() => import('@/pages/SplitterPage'));
const BlurPage = lazy(() => import('@/pages/BlurPage'));
const MemeGeneratorPage = lazy(() => import('@/pages/MemeGeneratorPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const BeautifierPage = lazy(() => import('@/pages/BeautifierPage'));
const OcrPage = lazy(() => import('@/pages/OcrPage'));
const AnnotatePage = lazy(() => import('@/pages/AnnotatePage'));
const UpscalePage = lazy(() => import('@/pages/UpscalePage'));
const AiGeneratorPage = lazy(() => import('@/pages/AiGeneratorPage'));

const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function AnimatedRoutes() {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage seo={{ title: 'GambarYuk', description: t('app.slogan'), path: '/' }}><Index /></AnimatedPage>} />
          <Route path="/resize" element={<AnimatedPage seo={{ title: t('feature.resize.title'), description: t('feature.resize.desc'), path: '/resize' }}><ResizePage /></AnimatedPage>} />
          <Route path="/compress" element={<AnimatedPage seo={{ title: t('feature.compress.title'), description: t('feature.compress.desc'), path: '/compress' }}><CompressPage /></AnimatedPage>} />
          <Route path="/convert" element={<AnimatedPage seo={{ title: t('feature.convert.title'), description: t('feature.convert.desc'), path: '/convert' }}><ConvertPage /></AnimatedPage>} />
          <Route path="/crop" element={<AnimatedPage seo={{ title: t('feature.crop.title'), description: t('feature.crop.desc'), path: '/crop' }}><CropPage /></AnimatedPage>} />
          <Route path="/rotate" element={<AnimatedPage seo={{ title: t('feature.rotate.title'), description: t('feature.rotate.desc'), path: '/rotate' }}><RotatePage /></AnimatedPage>} />
          <Route path="/watermark" element={<AnimatedPage seo={{ title: t('feature.watermark.title'), description: t('feature.watermark.desc'), path: '/watermark' }}><WatermarkPage /></AnimatedPage>} />
          <Route path="/remove-watermark" element={<Navigate to="/" replace />} />
          <Route path="/remove-bg" element={<Navigate to="/" replace />} />
          <Route path="/filters" element={<AnimatedPage seo={{ title: t('feature.filters.title'), description: t('feature.filters.desc'), path: '/filters' }}><FiltersPage /></AnimatedPage>} />
          <Route path="/rename" element={<AnimatedPage seo={{ title: t('feature.rename.title'), description: t('feature.rename.desc'), path: '/rename' }}><RenamePage /></AnimatedPage>} />
          <Route path="/collage" element={<AnimatedPage seo={{ title: t('feature.collage.title'), description: t('feature.collage.desc'), path: '/collage' }}><CollagePage /></AnimatedPage>} />
          <Route path="/image-to-link" element={<AnimatedPage seo={{ title: t('feature.imageToLink.title'), description: t('feature.imageToLink.desc'), path: '/image-to-link' }}><ImageToLinkPage /></AnimatedPage>} />
          <Route path="/metadata" element={<AnimatedPage seo={{ title: t('feature.metadata.title'), description: t('feature.metadata.desc'), path: '/metadata' }}><MetadataPage /></AnimatedPage>} />
          <Route path="/color-picker" element={<AnimatedPage seo={{ title: t('feature.colorPicker.title'), description: t('feature.colorPicker.desc'), path: '/color-picker' }}><ColorPickerPage /></AnimatedPage>} />
          <Route path="/base64" element={<AnimatedPage seo={{ title: t('feature.base64.title'), description: t('feature.base64.desc'), path: '/base64' }}><Base64Page /></AnimatedPage>} />
          <Route path="/qr-code" element={<AnimatedPage seo={{ title: t('feature.qrCode.title'), description: t('feature.qrCode.desc'), path: '/qr-code' }}><QrCodePage /></AnimatedPage>} />
          <Route path="/favicon" element={<AnimatedPage seo={{ title: t('feature.favicon.title'), description: t('feature.favicon.desc'), path: '/favicon' }}><FaviconPage /></AnimatedPage>} />
          <Route path="/splitter" element={<AnimatedPage seo={{ title: t('feature.splitter.title'), description: t('feature.splitter.desc'), path: '/splitter' }}><SplitterPage /></AnimatedPage>} />
          <Route path="/blur" element={<AnimatedPage seo={{ title: t('feature.blur.title'), description: t('feature.blur.desc'), path: '/blur' }}><BlurPage /></AnimatedPage>} />
          <Route path="/meme" element={<AnimatedPage seo={{ title: t('feature.meme.title'), description: t('feature.meme.desc'), path: '/meme' }}><MemeGeneratorPage /></AnimatedPage>} />
          <Route path="/compare" element={<AnimatedPage seo={{ title: t('feature.compare.title'), description: t('feature.compare.desc'), path: '/compare' }}><ComparePage /></AnimatedPage>} />
          <Route path="/beautifier" element={<AnimatedPage seo={{ title: t('feature.beautifier.title'), description: t('feature.beautifier.desc'), path: '/beautifier' }}><BeautifierPage /></AnimatedPage>} />
          <Route path="/ocr" element={<Navigate to="/" replace />} />
          <Route path="/annotate" element={<AnimatedPage seo={{ title: t('feature.annotate.title'), description: t('feature.annotate.desc'), path: '/annotate' }}><AnnotatePage /></AnimatedPage>} />
          <Route path="/upscale" element={<Navigate to="/" replace />} />
          <Route path="/ai-generator" element={<Navigate to="/" replace />} />
          <Route path="/privacy" element={<AnimatedPage seo={{ title: t('nav.privacyPolicy'), description: 'Privacy Policy untuk GambarYuk', path: '/privacy' }}><PrivacyPage /></AnimatedPage>} />
          <Route path="/about" element={<AnimatedPage seo={{ title: 'Tentang', description: 'Tentang GambarYuk', path: '/about' }}><AboutPage /></AnimatedPage>} />
          <Route path="*" element={<AnimatedPage seo={{ title: t('notFound.title'), description: 'Halaman tidak ditemukan', path: '' }}><NotFound /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
