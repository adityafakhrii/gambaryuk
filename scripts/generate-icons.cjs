const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching Puppeteer to generate icons...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Read base64 of logo.webp
  const logoPath = path.join(__dirname, '../public/logo.webp');
  if (!fs.existsSync(logoPath)) {
    console.error('Error: public/logo.webp does not exist.');
    process.exit(1);
  }
  const logoData = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/webp;base64,${logoData}`;

  // We expose a function to write the buffer back to disk
  await page.exposeFunction('saveIcon', (name, base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');
    const iconsDir = path.join(__dirname, '../public/icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(iconsDir, name), buffer);
    console.log(`Saved ${name}`);
  });

  await page.evaluate(async (src) => {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    // Helper to resize image
    const resizeImage = (img, size, purpose) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (purpose === 'maskable') {
        // Draw background for maskable icon
        ctx.fillStyle = '#0F1F3D'; // theme background
        ctx.fillRect(0, 0, size, size);
        
        // Draw logo centered with padding
        const padding = size * 0.15;
        ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
      } else {
        // Transparent background
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl.split(',')[1];
    };

    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    const img = await loadImage(src);

    // Generate normal icons
    for (const size of sizes) {
      const base64 = resizeImage(img, size, 'any');
      await window.saveIcon(`icon-${size}x${size}.png`, base64);
    }

    // Generate maskable icon
    const maskableBase64 = resizeImage(img, 512, 'maskable');
    await window.saveIcon('icon-maskable.png', maskableBase64);

    // Generate monochrome icon
    const monoCanvas = document.createElement('canvas');
    monoCanvas.width = 512;
    monoCanvas.height = 512;
    const mctx = monoCanvas.getContext('2d');
    mctx.drawImage(img, 0, 0, 512, 512);
    const imgData = mctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const brightness = 0.34 * imgData.data[i] + 0.5 * imgData.data[i + 1] + 0.16 * imgData.data[i + 2];
      imgData.data[i] = brightness;
      imgData.data[i + 1] = brightness;
      imgData.data[i + 2] = brightness;
    }
    mctx.putImageData(imgData, 0, 0);
    const monoBase64 = monoCanvas.toDataURL('image/png').split(',')[1];
    await window.saveIcon('icon-monochrome.png', monoBase64);

    // Generate apple touch icon
    const appleBase64 = resizeImage(img, 180, 'any');
    await window.saveIcon('apple-touch-icon.png', appleBase64);

  }, logoSrc);

  await browser.close();
  console.log('All icons generated successfully!');
})();
