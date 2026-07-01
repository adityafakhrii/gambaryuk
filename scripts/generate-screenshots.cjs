const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotsDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser to capture screenshots...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Desktop Screenshot
  console.log('Capturing desktop screenshot...');
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
  } catch (err) {
    console.warn('Could not load localhost:8080, attempting fallback or waiting...', err.message);
    // Let's wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
  }

  // Hide scrollbar and wait for any animations
  await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });
  await new Promise(resolve => setTimeout(resolve, 1500)); // wait for transitions
  
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop.png') });
  console.log('Saved desktop.png');

  // 2. Mobile Screenshot
  console.log('Capturing mobile screenshot...');
  // Let's toggle sidebar or just narrow the viewport
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // Standard iPhone 12/13/14 size
  
  // Reload to trigger mobile layout correctly if needed
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
  await page.addStyleTag({ content: 'body { overflow: hidden !important; }' });
  await new Promise(resolve => setTimeout(resolve, 1500));

  await page.screenshot({ path: path.join(screenshotsDir, 'mobile.png') });
  console.log('Saved mobile.png');

  await browser.close();
  console.log('Screenshots captured successfully!');
})().catch(err => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
