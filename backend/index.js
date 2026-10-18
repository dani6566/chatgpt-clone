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

  const port = Number(process.env.PORT || 9999);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
