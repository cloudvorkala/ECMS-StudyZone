// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mentor-match',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'refresh-super-secret-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
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
