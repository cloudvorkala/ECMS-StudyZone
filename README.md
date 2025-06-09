# ECMS-StudyZone

ECMS-StudyZone is a modern online learning platform that provides real-time communication, mentor booking, screen sharing, and study group management features.

## Tech Stack

### Frontend
- Next.js 15.2.4
- React 19
- Material-UI 7.1.0
- TailwindCSS 4
- Socket.IO Client
- WebRTC

### Backend
- NestJS 11.1.0
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
- Passport
- WebRTC

## System Requirements

- Node.js >= 18.x
- MongoDB >= 6.x
- npm >= 9.x
- Modern web browser with WebRTC support (Chrome, Firefox, Edge)

## Installation Instructions

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
The frontend will run on https://localhost:3001

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

## Environment Variables Configuration

### Frontend Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3001
```

### Backend Environment Variables
Create a `.env` file:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Key Features

- User Authentication and Authorization
- Real-time Text Chat
- Screen Sharing
  - Mentor can share their screen with students
  - Real-time screen sharing with audio
  - Multiple viewers support
  - Automatic reconnection handling
- Mentor Booking System
  - View available mentors
  - Book sessions with mentors
  - Manage booking requests
  - Reschedule or cancel bookings
- Study Groups
  - Create and manage study groups
  - Add/remove students
  - Group chat functionality
  - Screen sharing within groups
- Real-time Notifications

## Development Guide

### Code Standards
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode compliance

### Testing
Run tests:
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test
```

## Project Structure

```
ECMS-StudyZone/
├── frontend/                      # Next.js frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/            # React context providers
│   │   ├── lib/                 # Utility functions and libraries
│   │   ├── pages/              # Next.js pages and API routes
│   │   │   ├── api/           # API routes
│   │   │   ├── mentor/        # Mentor-specific pages
│   │   │   ├── student/       # Student-specific pages
│   │   │   └── screen-share/  # Screen sharing pages
│   │   ├── services/          # API service integrations
│   │   ├── styles/            # Global styles and CSS modules
│   │   └── types/             # TypeScript type definitions
│   ├── public/                 # Static assets
│   ├── certificates/           # SSL certificates
│   ├── next.config.ts         # Next.js configuration
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── backend/                     # NestJS backend application
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── bookings/          # Booking management
│   │   ├── calendar/          # Calendar and scheduling
│   │   ├── chat/              # Real-time chat functionality
│   │   ├── common/            # Shared utilities and middleware
│   │   ├── config/            # Application configuration
│   │   ├── notifications/     # Notification system
│   │   ├── rooms/             # Virtual room management
│   │   ├── sessions/          # Session management
│   │   ├── study-groups/      # Study group functionality
│   │   ├── users/             # User management
│   │   ├── webrtc/            # WebRTC implementation
│   │   ├── app.module.ts      # Root application module
│   │   └── main.ts            # Application entry point
│   ├── certificates/          # SSL certificates
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── docs/                       # Project documentation
│   ├── Component_UML.drawio   # Component architecture diagram
│   ├── Class_UML.drawio       # Class diagram
│   └── Sequence_UML.drawio    # Sequence diagrams
│
├── .gitignore                 # Git ignore rules
├── LICENSE                    # MIT License
└── README.md                 # Project documentation
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contact

For any questions or suggestions, please contact us through:
- Project Issues
- Email: [Your Email]

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [WebRTC](https://webrtc.org/)

# Environment Setup

## Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```env
DATABASE_URI= your own one
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

### Prerequisites
- Node.js installed
- `node-forge` package installed in the backend directory

### Steps

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

### Installing the Certificate

#### Windows
1. Double-click the `certificate.crt` file in the `backend/certificates` directory
2. Click "Install Certificate"
3. Select "Local Machine"
4. Choose "Place all certificates in the following store"
5. Click "Browse"
6. Select "Trusted Root Certification Authorities"
7. Click "OK" to complete the installation

#### macOS
1. Double-click the `certificate.crt` file
2. Add the certificate to the System keychain
3. Trust the certificate for SSL

#### Linux
1. Copy the certificate to the system certificates directory:
```bash
sudo cp certificate.crt /usr/local/share/ca-certificates/
```
2. Update the certificate store:
```bash
sudo update-ca-certificates
```

### Security Notes
- These certificates are for development purposes only
- Each development machine should generate its own certificates
- Do not commit certificate files to version control
- Certificate files are automatically ignored by git (see .gitignore)

### Certificate Details
- RSA key length: 4096 bits
- Signature algorithm: SHA-512
- Validity period: 1 year
- Subject Alternative Names (SANs): localhost, 127.0.0.1

### Troubleshooting
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
