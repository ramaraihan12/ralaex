import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const logoPath = path.join(root, 'public', 'logo', 'RaLaEXfullLogo.png')
const iconsDir = path.join(root, 'public', 'icons')
const sizes = [192, 512]

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
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
