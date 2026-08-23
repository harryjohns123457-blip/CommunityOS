import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';

import { Server } from 'socket.io';

import apiRouter from './routes/index.js';
import { prisma } from './db/connection.js';
import { initializeSupabase } from './config/supabase.js';

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  let database = 'unknown';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  res.json({
    success: true,
    message: 'CommunityOS API is running',
    database,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.message === 'CORS origin not allowed') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed',
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.message || 'Internal server error',
  });
});

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join:order', (orderId) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
    }
  });

  socket.on('leave:order', (orderId) => {
    if (orderId) {
      socket.leave(`order:${orderId}`);
    }
  });

  socket.on('join:provider', (providerId) => {
    if (providerId) {
      socket.join(`provider:${providerId}`);
    }
  });

  socket.on('join:community', (communityId) => {
    if (communityId) {
      socket.join(`community:${communityId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    initializeSupabase();

    await prisma.$connect();

    server.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('        COMMUNITYOS BACKEND');
      console.log('========================================');
      console.log(`API:     http://localhost:${PORT}`);
      console.log(`Health:  http://localhost:${PORT}/api/health`);
      console.log(`Frontend origins: ${allowedOrigins.join(', ')}`);
      console.log('========================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start CommunityOS:', error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  await prisma.$disconnect();

  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
