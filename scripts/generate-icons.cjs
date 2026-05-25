const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const logoPath = path.join(__dirname, '..', 'public', 'logo', 'RaLaEXfullLogo.png')
const iconsDir = path.join(__dirname, '..', 'public', 'icons')
const sizes = [192, 512]

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

async function generate() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`)
    await sharp(logoPath)
      .resize(size, size)
      .png()
      .toFile(outputPath)
    console.log(`Generated: icon-${size}x${size}.png`)
  }
  console.log('PWA icons generated successfully!')
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err)
  process.exit(1)
})
