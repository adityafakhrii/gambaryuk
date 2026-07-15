const fs = require('fs');
const path = require('path');

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

const DOMAIN = 'https://gambaryuk.com';
const today = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

routes.forEach((route) => {
    const isHome = route === '/';
    const priority = isHome ? '1.0' : (route === '/about' || route === '/privacy' ? '0.5' : '0.8');
    const cleanRoute = route === '/' ? '/' : route;
    
    const locUrl = cleanRoute === '/' ? `${DOMAIN}/` : `${DOMAIN}${cleanRoute}`;
    const idUrl = cleanRoute === '/' ? `${DOMAIN}/?lang=id` : `${DOMAIN}${cleanRoute}?lang=id`;
    const enUrl = cleanRoute === '/' ? `${DOMAIN}/?lang=en` : `${DOMAIN}${cleanRoute}?lang=en`;

    sitemap += `  <url>
    <loc>${locUrl}</loc>
    <xhtml:link rel="alternate" hreflang="id" href="${idUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${locUrl}" />
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
});

sitemap += `</urlset>`;

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('✅ sitemap.xml generated successfully in public/sitemap.xml');
