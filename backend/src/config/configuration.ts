// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/studyzone',
  },

  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },

  uploadDir: process.env.UPLOAD_DIR || 'uploads',

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromEmail: process.env.FROM_EMAIL || 'noreply@mentormatch.com',
  },
});
