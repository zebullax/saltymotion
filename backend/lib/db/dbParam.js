module.exports.connection = {
  prod: {
    timezone: 'UTC',
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number.parseInt(process.env.DB_PORT, 10),
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
  },
};
