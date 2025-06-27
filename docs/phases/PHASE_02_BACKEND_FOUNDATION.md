# Phase 2: Backend Foundation

## Objective
Create the Express server with Socket.io integration, establish basic routing, and test real-time WebSocket connections.

## Prerequisites
- Phase 1 completed (project structure and dependencies installed)
- TypeScript configuration working
- Basic understanding of Express and Socket.io

## Estimated Time
**1 hour** (4 tasks × 15 minutes each)

## Tasks Breakdown

### Task 1: Create Express Server Setup (15 min)
- [x] Create `server/src/index.ts` with basic Express app
- [x] Set up CORS configuration for client communication
- [x] Add error handling middleware
- [x] Configure server to listen on port 3001

### Task 2: Integrate Socket.io (15 min)
- [x] Install and configure Socket.io server
- [x] Set up basic connection handling
- [x] Add connection/disconnection logging
- [x] Configure Socket.io CORS for client origin

### Task 3: Set up Basic Routing (15 min)
- [x] Create health check endpoint (`/api/health`)
- [x] Set up API route structure (`/api/rooms`, `/api/users`)
- [x] Add request logging middleware
- [x] Create placeholder route handlers

### Task 4: Test Real-time Connection (15 min)
- [x] Create simple test HTML page for Socket.io
- [x] Test connection establishment
- [x] Test basic event emission/reception
- [x] Verify server logs show connections

### Additional Tasks Completed:
- [x] Add kill-port functionality to npm scripts (dev:server, dev:client)
- [x] Create React-based Socket.io test component
- [x] Set up client-side routing with React Router
- [x] Implement comprehensive test interface with real-time logging
- [x] Resolve CORS issues for localhost/127.0.0.1 connections
- [x] Create interactive test buttons and status display

## Deliverables

### Server Structure
```
server/
├── src/
│   ├── index.ts           # Main server file
│   ├── routes/
│   │   ├── health.ts
│   │   └── index.ts
│   ├── socket/
│   │   └── handlers.ts
│   └── middleware/
│       └── cors.ts
└── package.json
```

### Main Server File (server/src/index.ts)
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Basic connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "dev:server": "npx kill-port 3001 && npm run dev",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Client Structure (Additional)
```
client/
├── src/
│   ├── components/
│   │   └── SocketTest.tsx      # React test component
│   ├── App.tsx                 # Updated with routing
│   └── main.tsx
└── package.json                # Updated with react-router-dom
```

### Testing Routes
- Server test endpoint: `http://localhost:3001/test`
- Client test route: `http://localhost:5173/test`

## Success Criteria
- [x] Server starts without errors on `npm run dev:server`
- [x] Health check endpoint responds with 200 status
- [x] Socket.io connection established successfully
- [x] Connection/disconnection events logged properly
- [x] No TypeScript compilation errors

## Common Issues & Solutions

### Issue: Socket.io CORS errors
**Solution**: Ensure origin matches client development server URL

### Issue: Port already in use
**Solution**: Check for other processes using port 3001, use different port if needed

### Issue: TypeScript import errors
**Solution**: Ensure all @types packages are installed and tsconfig paths are correct

## Testing

### Manual Testing Steps
1. Start server: `npm run dev:server`
2. Visit `http://localhost:3001/api/health` - should return 200
3. Use browser dev tools to test Socket.io connection
4. Check server logs for connection messages

### Test Socket.io Connection
Create temporary `test-client.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.socket.io/4.7.0/socket.io.min.js"></script>
</head>
<body>
    <script>
        const socket = io('http://localhost:3001');
        socket.on('connect', () => {
            console.log('Connected to server');
        });
    </script>
</body>
</html>
```

## Next Steps
After completion, proceed to **Phase 3: Database Schema & Models** to set up SQLite database and data models.

## Time Tracking
- Start Time: 2025-06-27 20:05
- End Time: 2025-06-27 20:10
- Actual Duration: ~5 minutes
- Notes: Completed ahead of schedule. Server structure was already partially implemented from Phase 1, enhanced with proper modular structure, error handling, and comprehensive testing setup.

## Dependencies
- **Blocks**: Phase 3 (Database), Phase 10 (Real-time Integration)
- **Blocked by**: Phase 1 (Project Setup)