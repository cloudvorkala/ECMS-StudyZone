const fs = require('fs');
const path = require('path');

// Read the certificate
const certPath = path.join(__dirname, 'certificate.crt');
const cert = fs.readFileSync(certPath, 'utf8');

// Export as .pem
fs.writeFileSync(path.join(__dirname, 'certificate.pem'), cert);

console.log('Certificate exported as certificate.pem');