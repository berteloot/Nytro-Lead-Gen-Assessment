const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const inputPath = path.join(__dirname, '../public/logo_Nytro_color.png');
  const outputDir = path.join(__dirname, '../app');

  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    console.log('🎨 Generating favicons from Nytro logo...');

    // Create main favicon (32x32)
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    // Create 180x180 apple-touch-icon
    await sharp(inputPath)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    // Create SVG favicon (simple version)
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <style>
      .logo { fill: #F86A0E; }
    </style>
  </defs>
  <text x="50" y="70" text-anchor="middle" class="logo" font-family="Arial, sans-serif" font-size="60" font-weight="bold">N</text>
</svg>`;

    fs.writeFileSync(path.join(outputDir, 'favicon.svg'), svgFavicon);

    // Also create public directory versions for PWA support
    const publicDir = path.join(__dirname, '../public');
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

    console.log('✅ Favicons generated successfully!');
    console.log('📁 App directory files (Next.js App Router):');
    console.log('   - app/favicon.ico');
    console.log('   - app/favicon.svg');
    console.log('   - app/apple-touch-icon.png');
    console.log('📁 Public directory files (PWA support):');
    console.log('   - public/android-chrome-192x192.png');
    console.log('   - public/android-chrome-512x512.png');
    console.log('   - public/site.webmanifest');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
