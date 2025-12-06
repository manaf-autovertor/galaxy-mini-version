// Simple script to generate PWA icons as SVG
// Run this with: node generate-icons.js

const fs = require("fs");
const path = require("path");

// SVG template with gradient
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d946ef;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${
  size * 0.15
}" fill="url(#grad1)"/>
  <g transform="translate(${size * 0.25}, ${size * 0.25})">
    <!-- Q letter icon -->
    <circle cx="${size * 0.25}" cy="${size * 0.22}" r="${
  size * 0.18
}" stroke="white" stroke-width="${size * 0.06}" fill="none"/>
    <line x1="${size * 0.35}" y1="${size * 0.35}" x2="${size * 0.42}" y2="${
  size * 0.42
}" stroke="white" stroke-width="${size * 0.06}" stroke-linecap="round"/>
  </g>
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate icons
const sizes = [192, 512];

sizes.forEach((size) => {
  const svg = createSVG(size);
  const filename = `pwa-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);

  fs.writeFileSync(filepath, svg.trim());
  console.log(`Generated ${filename}`);
});

console.log("\\nPWA icons generated successfully!");
console.log(
  "Note: For production, convert these SVGs to PNG using an image converter."
);
console.log("You can use online tools like: https://svgtopng.com/");
