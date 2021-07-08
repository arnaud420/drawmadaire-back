export default () => ({
  jwtSecret: process.env.JWT_SECRET,
  apiUrl: process.env.API_URL,
  frontUrl: process.env.FRONT_URL,

  database: {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || undefined,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
  },

  sendgridKey: process.env.SENGRID_API_KEY,
});
