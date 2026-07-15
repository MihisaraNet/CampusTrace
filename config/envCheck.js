const checkEnv = () => {
  const requiredEnvs = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingEnvs = requiredEnvs.filter((envVar) => !process.env[envVar]);

  if (missingEnvs.length > 0) {
    console.error(`\n❌ FATAL ERROR: Missing required environment variables:\n`);
    missingEnvs.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error(`\nPlease set these in your .env file or environment before starting the server.\n`);
    process.exit(1);
  }
};

module.exports = checkEnv;
