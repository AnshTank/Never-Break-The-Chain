// Generate PWA icons from existing logo
// Run: node generate-pwa-icons.js

const fs = require('fs');
const path = require('path');

console.log('PWA Icon Generation Instructions:');
console.log('==================================\n');
console.log('Visit: https://realfavicongenerator.net/');
console.log('1. Upload your logo: public/logo/neverbreakthechain.svg');
console.log('2. Generate all icons');
console.log('3. Download the package');
console.log('4. Extract these files to /public:');
console.log('   - icon-192x192.png');
console.log('   - icon-512x512.png');
console.log('   - icon-maskable-192x192.png (optional)');
console.log('   - icon-maskable-512x512.png (optional)');
console.log('\nOr use this online tool:');
console.log('https://www.pwabuilder.com/imageGenerator');
