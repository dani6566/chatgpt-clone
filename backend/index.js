import 'dotenv/config';
import express from 'express';
import db from './db/db.config.js';
import mainRoutes from './src/api/main.routes.js';
import { errorHandler } from './src/middleware/error.handler.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', mainRoutes);


app.use(errorHandler);

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Database connected');
  } catch (error) {
    console.log('Database connection failed, continuing startup:', error.message);
  }

  app.listen(9999, () => {
    console.log('Server is running at http://localhost:9999');
  });
}

startServer();

