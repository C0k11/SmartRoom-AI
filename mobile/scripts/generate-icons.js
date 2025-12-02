const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// 创建Cok11风格图标 - 蓝色渐变 + 闪电
async function generateIcon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0052CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.22}"/>
      
      <!-- Lightning bolt -->
      <path d="M${size*0.55} ${size*0.15} L${size*0.35} ${size*0.48} L${size*0.48} ${size*0.48} L${size*0.42} ${size*0.85} L${size*0.68} ${size*0.45} L${size*0.52} ${size*0.45} Z" 
            fill="white"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, filename));
  
  console.log(`Created ${filename}`);
}

// 创建启动页 - Cok11品牌
async function generateSplash() {
  const width = 1284;
  const height = 2778;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0052CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      
      <!-- Logo container -->
      <rect x="${width/2 - 100}" y="${height/2 - 180}" width="200" height="200" 
            fill="rgba(255,255,255,0.15)" rx="44"/>
      
      <!-- Lightning bolt -->
      <path d="M${width/2 + 30} ${height/2 - 130} L${width/2 - 50} ${height/2 - 10} L${width/2} ${height/2 - 10} L${width/2 - 20} ${height/2 + 70} L${width/2 + 70} ${height/2 - 40} L${width/2 + 10} ${height/2 - 40} Z" 
            fill="white"/>
      
      <!-- Cok11 text -->
      <text x="${width/2 - 80}" y="${height/2 + 130}" 
            font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
        Cok
      </text>
      <text x="${width/2 + 45}" y="${height/2 + 130}" 
            font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="rgba(255,255,255,0.8)">
        11
      </text>
      
      <!-- Subtitle -->
      <text x="50%" y="${height/2 + 200}" 
            font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.7)" 
            text-anchor="middle">
        SmartRoom AI
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  
  console.log('Created splash.png');
}

// 创建favicon
async function generateFavicon() {
  const size = 48;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0052CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="10"/>
      <path d="M${size*0.55} ${size*0.15} L${size*0.32} ${size*0.5} L${size*0.47} ${size*0.5} L${size*0.4} ${size*0.85} L${size*0.7} ${size*0.45} L${size*0.52} ${size*0.45} Z" 
            fill="white"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  
  console.log('Created favicon.png');
}

async function main() {
  console.log('Generating Cok11 brand icons...\n');
  
  await generateIcon(1024, 'icon.png');
  await generateIcon(1024, 'adaptive-icon.png');
  await generateSplash();
  await generateFavicon();
  
  console.log('\nAll icons generated!');
}

main().catch(console.error);
