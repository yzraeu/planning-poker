import cors from 'cors';

export const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "file://",
    null
  ],
  methods: ["GET", "POST"],
  credentials: true
};

export const corsMiddleware = cors(corsOptions);