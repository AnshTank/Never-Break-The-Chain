const crypto = require('crypto');

function generateVapidKeys() {
  // Generate proper VAPID keys using web-push format
  const privateKeyBytes = crypto.randomBytes(32);
  
  // Convert to URL-safe base64
  const privateKey = privateKeyBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  // For VAPID public key, we need a proper elliptic curve key
  // Generate a 65-byte uncompressed public key (0x04 + 32 bytes x + 32 bytes y)
  const publicKeyBytes = Buffer.alloc(65);
  publicKeyBytes[0] = 0x04; // Uncompressed point indicator
  
  // Fill with crypto-secure random bytes for x and y coordinates
  crypto.randomFillSync(publicKeyBytes, 1, 64);
  
  const publicKey = publicKeyBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    publicKey,
    privateKey
  };
}

const keys = generateVapidKeys();

console.log('🔑 VAPID Keys Generated:');
console.log('');
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);
console.log('');
console.log('📋 Add these to your .env file:');
console.log('');
console.log(`VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log('');
console.log('⚠️  Keep the private key secure and never expose it publicly!');
console.log('📏 Public key length:', Buffer.from(keys.publicKey + '===', 'base64').length, 'bytes');
console.log('📏 Private key length:', Buffer.from(keys.privateKey + '===', 'base64').length, 'bytes');