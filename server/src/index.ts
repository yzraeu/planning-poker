import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { corsMiddleware, corsOptions } from './middleware/cors.js';
import apiRoutes from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

app.use(corsMiddleware);
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Planning Poker Server - Phase 2 Backend Foundation' });
});

app.get('/test', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Socket.io Test - Served by Express</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <h1>Socket.io Test (Same Origin)</h1>
    <div id="status">Connecting...</div>
    <div id="messages"></div>
    
    <script>
        const status = document.getElementById('status');
        const messages = document.getElementById('messages');
        
        function addMessage(msg) {
            const div = document.createElement('div');
            div.textContent = new Date().toLocaleTimeString() + ': ' + msg;
            messages.appendChild(div);
        }
        
        const socket = io();
        
        socket.on('connect', function() {
            status.textContent = 'Connected! ID: ' + socket.id;
            status.style.color = 'green';
            addMessage('✅ Connected successfully with ID: ' + socket.id);
        });
        
        socket.on('disconnect', function(reason) {
            status.textContent = 'Disconnected: ' + reason;
            status.style.color = 'red';
            addMessage('❌ Disconnected: ' + reason);
        });
        
        socket.on('connect_error', function(error) {
            status.textContent = 'Connection failed: ' + error.message;
            status.style.color = 'red';
            addMessage('❌ Connection error: ' + error.message);
        });
    </script>
</body>
</html>
  `);
});

app.use(express.static('public'));

app.use('/api', apiRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});