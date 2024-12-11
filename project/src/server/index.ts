import express from 'express';
import { createServer } from 'http';
import { authRouter } from './routes/auth';
import { noticesRouter } from './routes/notices';
import { feedbackRouter } from './routes/feedback';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';
import { initializeSocket } from './socket';
import { networkInterfaces } from 'os';

const app = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/feedback', feedbackRouter);

// Error handling
app.use(errorHandler);

// Get network interfaces
const getNetworkAddresses = () => {
  const interfaces = networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        addresses.push(net.address);
      }
    }
  }

  return addresses;
};

const port = process.env.PORT || 3000;

// Listen on all network interfaces
httpServer.listen(port, '0.0.0.0', () => {
  const addresses = getNetworkAddresses();
  
  console.log('\nServer running at:');
  console.log(`  ➜ Local:    http://localhost:${port}`);
  addresses.forEach(address => {
    console.log(`  ➜ Network:  http://${address}:${port}`);
  });
  console.log('\nFrontend accessible at:');
  console.log(`  ➜ Local:    http://localhost:5173`);
  addresses.forEach(address => {
    console.log(`  ➜ Network:  http://${address}:5173`);
  });
});