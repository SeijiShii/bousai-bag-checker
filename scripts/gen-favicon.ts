/**
 * gen-favicon — 単一 SVG ソース (`public/favicon.svg`) から派生 PNG/ICO を自動生成。
 *
 * 出力:
 *   public/favicon.ico              (16×16 + 32×32 + 48×48 multi-resolution)
 *   public/apple-touch-icon.png     (180×180、iOS ホーム画面)
 *   public/icon-192.png             (Android インストール)
 *   public/icon-512.png             (Android インストール)
 *   public/icon-maskable-512.png    (Android maskable、safe-zone padding)
 *
 * 再生成: SVG ソース編集後に `npm run gen:favicon`。
 * 設計 SoT: docs/design/design-system.md §7.1
 * perspectives: O56 (brand mark = favicon / PWA app icon)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const SOURCE_SVG = join(publicDir, 'favicon.svg');

const PRIMARY = '#2E8B74';

async function pngFromSvg(svg: Buffer, size: number): Promise<Buffer> {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

async function maskablePng(svg: Buffer, size: number): Promise<Buffer> {
  const inner = Math.round(size * 0.8);
  const innerPng = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
  const pad = Math.round((size - inner) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background: PRIMARY },
  })
    .composite([{ input: innerPng, top: pad, left: pad }])
    .png()
    .toBuffer();
}

async function main() {
  const svg = await readFile(SOURCE_SVG);

  const png16 = await pngFromSvg(svg, 16);
  const png32 = await pngFromSvg(svg, 32);
  const png48 = await pngFromSvg(svg, 48);
  const ico = await toIco([png16, png32, png48]);
  await writeFile(join(publicDir, 'favicon.ico'), ico);

  await writeFile(join(publicDir, 'apple-touch-icon.png'), await pngFromSvg(svg, 180));
  await writeFile(join(publicDir, 'icon-192.png'), await pngFromSvg(svg, 192));
  await writeFile(join(publicDir, 'icon-512.png'), await pngFromSvg(svg, 512));
  await writeFile(join(publicDir, 'icon-maskable-512.png'), await maskablePng(svg, 512));

  console.log('gen-favicon: 派生ファイル生成完了');
  console.log('  public/favicon.ico              (16/32/48 multi)');
  console.log('  public/apple-touch-icon.png     (180×180)');
  console.log('  public/icon-192.png             (192×192)');
  console.log('  public/icon-512.png             (512×512)');
  console.log('  public/icon-maskable-512.png    (512×512, safe-zone padded)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
