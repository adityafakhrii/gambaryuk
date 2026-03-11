const fs = require('fs');
const path = require('path');
const express = require('express');
const puppeteer = require('puppeteer');

const routes = [
    '/',
    '/resize',
    '/compress',
    '/convert',
    '/crop',
    '/rotate',
    '/watermark',
    '/remove-bg',
    '/filters',
    '/rename',
    '/collage',
    '/image-to-link',
    '/metadata',
    '/color-picker',
    '/base64',
    '/qr-code',
    '/favicon',
    '/splitter',
    '/blur',
    '/meme',
    '/compare',
    '/beautifier',
    '/ocr',
    '/annotate',
    '/upscale',
    '/ai-generator',
    '/privacy',
    '/about'
];

const PORT = 4173;
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Please run vite build first.');
    process.exit(1);
}

const app = express();
app.use(express.static(distDir));

// Fallback for SPA routing
app.get('/{0,}', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

const server = app.listen(PORT, async () => {
    console.log(`Prerender server running on http://localhost:${PORT}`);

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        for (const route of routes) {
            console.log(`Prerendering ${route}...`);
            await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });

            const html = await page.evaluate(() => {
                return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
            });

            const routeDir = route === '/' ? distDir : path.join(distDir, route.slice(1));
            if (!fs.existsSync(routeDir)) {
                fs.mkdirSync(routeDir, { recursive: true });
            }

            fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
            console.log(`Saved ${routeDir}/index.html`);
        }

        await browser.close();
        console.log('✅ Prerendering complete!');
    } catch (err) {
        console.error('Error during prerendering:', err);
    } finally {
        server.close();
        process.exit(0);
    }
});
