# Environment Setup

## Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```env
DATABASE_URI= your own one
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_API_KEY=
TWILIO_API_SECRET=
TWILIO_TWIML_APP_SID=
PORT=3000
ALLOWED_ORIGINS=https://localhost:3000,https://localhost:3001






## Frontend Environment Variables
Create a `.env.local` file in the `frontend` directory with the following variables:
```env

NEXTAUTH_SECRET=your-development-secret
NEXTAUTH_URL=https://localhost:3001
NEXT_PUBLIC_API_URL=https://localhost:3000


# After installing Certificate, backend - npm run start:dev, frontend - npm run dev, all will be running with https




# SSL Certificate Generation and Installation

This document provides instructions for generating and installing SSL certificates for local development.

## Prerequisites

- Node.js installed
- `node-forge` package installed in the backend directory

## Generating Certificates

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install required dependencies (if not already installed):
   ```bash
   npm install node-forge
   ```

3. Generate new SSL certificates:
   ```bash
   node certificates/generate-cert.js
   ```

4. Export certificate in PEM format:
   ```bash
   node certificates/export-pem.js
   ```

## Installing the Certificate

### Windows

1. Double-click the `certificate.crt` file in the `backend/certificates` directory
2. Click "Install Certificate"
3. Select "Local Machine"
4. Choose "Place all certificates in the following store"
5. Click "Browse"
6. Select "Trusted Root Certification Authorities"
7. Click "OK" to complete the installation

### macOS

1. Double-click the `certificate.crt` file
2. Add the certificate to the System keychain
3. Trust the certificate for SSL

### Linux

1. Copy the certificate to the system certificates directory:
   ```bash
   sudo cp certificate.crt /usr/local/share/ca-certificates/
   ```
2. Update the certificate store:
   ```bash
   sudo update-ca-certificates
   ```

## Security Notes

- These certificates are for development purposes only
- Each development machine should generate its own certificates
- Do not commit certificate files to version control
- Certificate files are automatically ignored by git (see .gitignore)

## Troubleshooting

If you encounter SSL certificate errors:

1. Ensure the certificate is properly installed
2. Clear your browser cache
3. Restart your browser
4. Restart both frontend and backend servers

## Certificate Details

- RSA key length: 4096 bits
- Signature algorithm: SHA-512
- Validity period: 1 year
- Subject Alternative Names (SANs): localhost, 127.0.0.1