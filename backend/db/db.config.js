import mysql from 'mysql2/promise'

// database: process.env.DB_DATABASE
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true'
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      }
    : undefined,
});

// database: 'test',
//   ssl: {
//     minVersion: 'TLSv1.2',
//     rejectUnauthorized: true // Mandated by cloud providers for security
//   },
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0


export default db;
