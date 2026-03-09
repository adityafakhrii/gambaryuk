import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedPage from './AnimatedPage';

import Index from '@/pages/Index';
import ResizePage from '@/pages/ResizePage';
import CompressPage from '@/pages/CompressPage';
import ConvertPage from '@/pages/ConvertPage';
import CropPage from '@/pages/CropPage';
import RotatePage from '@/pages/RotatePage';
import WatermarkPage from '@/pages/WatermarkPage';
import RemoveBgPage from '@/pages/RemoveBgPage';
import FiltersPage from '@/pages/FiltersPage';
import RenamePage from '@/pages/RenamePage';
import CollagePage from '@/pages/CollagePage';
import ImageToLinkPage from '@/pages/ImageToLinkPage';
import MetadataPage from '@/pages/MetadataPage';
import ColorPickerPage from '@/pages/ColorPickerPage';
import Base64Page from '@/pages/Base64Page';
import QrCodePage from '@/pages/QrCodePage';
import FaviconPage from '@/pages/FaviconPage';
import SplitterPage from '@/pages/SplitterPage';
import BlurPage from '@/pages/BlurPage';
import MemeGeneratorPage from '@/pages/MemeGeneratorPage';
import ComparePage from '@/pages/ComparePage';
import BeautifierPage from '@/pages/BeautifierPage';
import OcrPage from '@/pages/OcrPage';
import AnnotatePage from '@/pages/AnnotatePage';
import UpscalePage from '@/pages/UpscalePage';
import AiGeneratorPage from '@/pages/AiGeneratorPage';
import PrivacyPage from '@/pages/PrivacyPage';
import AboutPage from '@/pages/AboutPage';
import NotFound from '@/pages/NotFound';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
        <Route path="/resize" element={<AnimatedPage><ResizePage /></AnimatedPage>} />
        <Route path="/compress" element={<AnimatedPage><CompressPage /></AnimatedPage>} />
        <Route path="/convert" element={<AnimatedPage><ConvertPage /></AnimatedPage>} />
        <Route path="/crop" element={<AnimatedPage><CropPage /></AnimatedPage>} />
        <Route path="/rotate" element={<AnimatedPage><RotatePage /></AnimatedPage>} />
        <Route path="/watermark" element={<AnimatedPage><WatermarkPage /></AnimatedPage>} />
        <Route path="/remove-bg" element={<AnimatedPage><RemoveBgPage /></AnimatedPage>} />
        <Route path="/filters" element={<AnimatedPage><FiltersPage /></AnimatedPage>} />
        <Route path="/rename" element={<AnimatedPage><RenamePage /></AnimatedPage>} />
        <Route path="/collage" element={<AnimatedPage><CollagePage /></AnimatedPage>} />
        <Route path="/image-to-link" element={<AnimatedPage><ImageToLinkPage /></AnimatedPage>} />
        <Route path="/metadata" element={<AnimatedPage><MetadataPage /></AnimatedPage>} />
        <Route path="/color-picker" element={<AnimatedPage><ColorPickerPage /></AnimatedPage>} />
        <Route path="/base64" element={<AnimatedPage><Base64Page /></AnimatedPage>} />
        <Route path="/qr-code" element={<AnimatedPage><QrCodePage /></AnimatedPage>} />
        <Route path="/favicon" element={<AnimatedPage><FaviconPage /></AnimatedPage>} />
        <Route path="/splitter" element={<AnimatedPage><SplitterPage /></AnimatedPage>} />
        <Route path="/blur" element={<AnimatedPage><BlurPage /></AnimatedPage>} />
        <Route path="/meme" element={<AnimatedPage><MemeGeneratorPage /></AnimatedPage>} />
        <Route path="/compare" element={<AnimatedPage><ComparePage /></AnimatedPage>} />
        <Route path="/beautifier" element={<AnimatedPage><BeautifierPage /></AnimatedPage>} />
        <Route path="/ocr" element={<AnimatedPage><OcrPage /></AnimatedPage>} />
        <Route path="/annotate" element={<AnimatedPage><AnnotatePage /></AnimatedPage>} />
        <Route path="/upscale" element={<AnimatedPage><UpscalePage /></AnimatedPage>} />
        <Route path="/ai-generator" element={<AnimatedPage><AiGeneratorPage /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
