const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'src', 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') && f !== 'Index.tsx' && f !== 'NotFound.tsx');

const keywordMap = {
    'ResizePage.tsx': { title: 'resize.title', desc: 'feature.resize.desc', path: '/resize' },
    'CompressPage.tsx': { title: 'compress.title', desc: 'feature.compress.desc', path: '/compress' },
    'ConvertPage.tsx': { title: 'convert.title', desc: 'feature.convert.desc', path: '/convert' },
    'CropPage.tsx': { title: 'crop.title', desc: 'feature.crop.desc', path: '/crop' },
    'RotatePage.tsx': { title: 'rotate.title', desc: 'feature.rotate.desc', path: '/rotate' },
    'WatermarkPage.tsx': { title: 'watermark.title', desc: 'feature.watermark.desc', path: '/watermark' },
    'FiltersPage.tsx': { title: 'filters.title', desc: 'feature.filters.desc', path: '/filters' },
    'RenamePage.tsx': { title: 'rename.title', desc: 'feature.rename.desc', path: '/rename' },
    'CollagePage.tsx': { title: 'collage.title', desc: 'feature.collage.desc', path: '/collage' },
    'ImageToLinkPage.tsx': { title: 'imageToLink.title', desc: 'feature.imageToLink.desc', path: '/image-to-link' },
    'MetadataPage.tsx': { title: 'metadata.title', desc: 'feature.metadata.desc', path: '/metadata' },
    'ColorPickerPage.tsx': { title: 'colorPicker.title', desc: 'feature.colorPicker.desc', path: '/color-picker' },
    'Base64Page.tsx': { title: 'base64.title', desc: 'feature.base64.desc', path: '/base64' },
    'QrCodePage.tsx': { title: 'qrCode.title', desc: 'feature.qrCode.desc', path: '/qr-code' },
    'FaviconPage.tsx': { title: 'favicon.title', desc: 'feature.favicon.desc', path: '/favicon' },
    'SplitterPage.tsx': { title: 'splitter.title', desc: 'feature.splitter.desc', path: '/splitter' },
    'BlurPage.tsx': { title: 'blur.title', desc: 'feature.blur.desc', path: '/blur' },
    'MemeGeneratorPage.tsx': { title: 'meme.title', desc: 'feature.meme.desc', path: '/meme' },
    'ComparePage.tsx': { title: 'compare.title', desc: 'feature.compare.desc', path: '/compare' },
    'BeautifierPage.tsx': { title: 'beautifier.title', desc: 'feature.beautifier.desc', path: '/beautifier' },
    'OcrPage.tsx': { title: 'ocr.title', desc: 'feature.ocr.desc', path: '/ocr' },
    'AnnotatePage.tsx': { title: 'annotate.title', desc: 'feature.annotate.desc', path: '/annotate' },
    'UpscalePage.tsx': { title: 'upscale.title', desc: 'feature.upscale.desc', path: '/upscale' },
    'AiGeneratorPage.tsx': { title: 'aiGen.title', desc: 'feature.aiGen.desc', path: '/ai-generator' },
    'RemoveBgPage.tsx': { title: 'removeBg.title', desc: 'feature.removeBg.desc', path: '/remove-bg' },
    'RemoveWatermarkPage.tsx': { title: 'removeWatermark.title', desc: 'feature.removeWatermark.desc', path: '/remove-watermark' },
    'AboutPage.tsx': { title: 'about.title', desc: 'about.subtitle', path: '/about' },
    'PrivacyPage.tsx': { title: 'privacy.title', desc: 'privacy.subtitle', path: '/privacy' },
};

pages.forEach(file => {
    const fullPath = path.join(pagesDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    if (content.includes('<SEO')) {
        console.log(`Skipping ${file}, SEO already exists.`);
        return;
    }

    const mapping = keywordMap[file];
    if (!mapping) {
        console.log(`No mapping found for ${file}`);
        return;
    }

    // Insert import
    if (!content.includes(`import { SEO }`)) {
        const importMatch = content.match(/^import .*?;?\n/gm);
        if (importMatch && importMatch.length > 0) {
            const lastImportIndex = content.lastIndexOf(importMatch[importMatch.length - 1]);
            const insertPos = lastImportIndex + importMatch[importMatch.length - 1].length;
            content = content.slice(0, insertPos) + `import { SEO } from '@/components/SEO';\n` + content.slice(insertPos);
        } else {
             content = `import { SEO } from '@/components/SEO';\n` + content;
        }
    }

    // Find return ( and <div className="min-h-full"> or similar main container wrapper
    // Typically:
    //   return (
    //     <div className="min-h-full">
    //     <SEO ... />
    
    // Check if 't' is available in the component. If not, maybe we skip or use hardcoded strings (but all seem to have useLanguage)
    let seoTag = `\n      <SEO title={t('${mapping.title}')} description={t('${mapping.desc}')} path="${mapping.path}" />`;

    // Replace first occurrence of `<div className="min-h-full">` or `<div className="min-h-full flex flex-col">` etc inside return
    const returnRegex = /return\s*\(\s*(<[A-Za-z0-9_.-]+(?:[^>]*?)>)/;
    const match = content.match(returnRegex);
    if (match) {
        const tag = match[1];
        content = content.replace(tag, tag + seoTag);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Successfully added SEO to ${file}`);
    } else {
        console.log(`Could not find a place to inject SEO in ${file}`);
    }
});
