const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Generate a new key pair with 4096 bits for stronger security
const keys = forge.pki.rsa.generateKeyPair(4096);

// Create a new certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// Set the subject and issuer to localhost
const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'NZ'
}, {
  shortName: 'ST',
  value: 'Auckland'
}, {
  name: 'localityName',
  value: 'Auckland'
}, {
  name: 'organizationName',
  value: 'Development'
}, {
  shortName: 'OU',
  value: 'Development'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add Subject Alternative Names (SANs)
cert.setExtensions([{
  name: 'subjectAltName',
  altNames: [{
    type: 2, // DNS
    value: 'localhost'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }]
}, {
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}]);

// Self-sign the certificate with SHA-512
cert.sign(keys.privateKey, forge.md.sha512.create());

// Convert to PEM format
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const certificatePem = forge.pki.certificateToPem(cert);

// Save the files
fs.writeFileSync(path.join(__dirname, 'private.key'), privateKeyPem);
fs.writeFileSync(path.join(__dirname, 'certificate.crt'), certificatePem);

console.log('Certificates generated successfully!');