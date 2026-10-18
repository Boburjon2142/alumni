// Rebuild responsive artwork without changing the original source files.
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const root = path.join(__dirname, '../public/recognitions');
  const output = path.join(root, 'responsive-v1');
  await fs.mkdir(output, { recursive: true });
  for (const file of (await fs.readdir(root)).filter(name => /^\d\d-.+\.png$/.test(name))) {
    for (const width of [80, 160, 480]) {
      await sharp(path.join(root, file)).resize({ width, withoutEnlargement: true })
        .webp({ lossless: true, effort: 6 })
        .toFile(path.join(output, `${file.slice(0, -4)}-${width}.webp`));
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
