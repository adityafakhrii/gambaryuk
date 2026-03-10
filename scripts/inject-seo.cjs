const fs = require('fs');

const path = 'src/components/layout/AnimatedRoutes.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('useLanguage')) {
    content = content.replace(
        "import { AnimatePresence } from 'framer-motion';",
        "import { AnimatePresence } from 'framer-motion';\nimport { useLanguage } from '@/contexts/LanguageContext';"
    );
}

if (!content.includes('const { t } = useLanguage();')) {
    content = content.replace(
        "const location = useLocation();",
        "const location = useLocation();\n  const { t } = useLanguage();"
    );
}

const routeMap = {
    '/': { title: "title: 'GambarYuk'", desc: "description: t('app.slogan')" },
    '/resize': { title: "title: t('feature.resize.title')", desc: "description: t('feature.resize.desc')" },
    '/compress': { title: "title: t('feature.compress.title')", desc: "description: t('feature.compress.desc')" },
    '/convert': { title: "title: t('feature.convert.title')", desc: "description: t('feature.convert.desc')" },
    '/crop': { title: "title: t('feature.crop.title')", desc: "description: t('feature.crop.desc')" },
    '/rotate': { title: "title: t('feature.rotate.title')", desc: "description: t('feature.rotate.desc')" },
    '/watermark': { title: "title: t('feature.watermark.title')", desc: "description: t('feature.watermark.desc')" },
    '/remove-bg': { title: "title: t('feature.removeBg.title')", desc: "description: t('feature.removeBg.desc')" },
    '/filters': { title: "title: t('feature.filters.title')", desc: "description: t('feature.filters.desc')" },
    '/rename': { title: "title: t('feature.rename.title')", desc: "description: t('feature.rename.desc')" },
    '/collage': { title: "title: t('feature.collage.title')", desc: "description: t('feature.collage.desc')" },
    '/image-to-link': { title: "title: t('feature.imageToLink.title')", desc: "description: t('feature.imageToLink.desc')" },
    '/metadata': { title: "title: t('feature.metadata.title')", desc: "description: t('feature.metadata.desc')" },
    '/color-picker': { title: "title: t('feature.colorPicker.title')", desc: "description: t('feature.colorPicker.desc')" },
    '/base64': { title: "title: t('feature.base64.title')", desc: "description: t('feature.base64.desc')" },
    '/qr-code': { title: "title: t('feature.qrCode.title')", desc: "description: t('feature.qrCode.desc')" },
    '/favicon': { title: "title: t('feature.favicon.title')", desc: "description: t('feature.favicon.desc')" },
    '/splitter': { title: "title: t('feature.splitter.title')", desc: "description: t('feature.splitter.desc')" },
    '/blur': { title: "title: t('feature.blur.title')", desc: "description: t('feature.blur.desc')" },
    '/meme': { title: "title: t('feature.meme.title')", desc: "description: t('feature.meme.desc')" },
    '/compare': { title: "title: t('feature.compare.title')", desc: "description: t('feature.compare.desc')" },
    '/beautifier': { title: "title: t('feature.beautifier.title')", desc: "description: t('feature.beautifier.desc')" },
    '/ocr': { title: "title: t('feature.ocr.title')", desc: "description: t('feature.ocr.desc')" },
    '/annotate': { title: "title: t('feature.annotate.title')", desc: "description: t('feature.annotate.desc')" },
    '/upscale': { title: "title: t('feature.upscale.title')", desc: "description: t('feature.upscale.desc')" },
    '/ai-generator': { title: "title: t('feature.aiGen.title')", desc: "description: t('feature.aiGen.desc')" },
    '/privacy': { title: "title: t('nav.privacyPolicy')", desc: "description: 'Privacy Policy untuk GambarYuk'" },
    '/about': { title: "title: 'Tentang'", desc: "description: 'Tentang GambarYuk'" },
    '*': { title: "title: '404 Không Ditemukan'", desc: "description: 'Halaman tidak ditemukan'" }
};

const routeRegex = /<Route path="([^"]+)" element={<AnimatedPage>(.*?)<\/AnimatedPage>} \/>/g;

content = content.replace(routeRegex, (match, path, component) => {
    const meta = routeMap[path];
    if (meta) {
        return `<Route path="${path}" element={<AnimatedPage seo={{ ${meta.title}, ${meta.desc}, path: '${path === '*' ? '' : path}' }}>${component}</AnimatedPage>} />`;
    }
    return match;
});

fs.writeFileSync(path, content, 'utf-8');
console.log('Done mapping SEO to routes');
