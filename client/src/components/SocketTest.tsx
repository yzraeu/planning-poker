import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Disconnected');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      addLog('✅ Connected to server with ID: ' + socket.id);
      setStatus('Status: Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason: string) => {
      addLog('❌ Disconnected from server. Reason: ' + reason);
      setStatus('Status: Disconnected');
      setIsConnected(false);
    });

    socket.on('test-response', (data: any) => {
      addLog('📨 Received test response: ' + JSON.stringify(data, null, 2));
    });

    socket.on('connect_error', (error: any) => {
      addLog('❌ Connection error: ' + error.message);
      setStatus('Status: Connection Error');
      setIsConnected(false);
    });

    addLog('🚀 Test client initialized');

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const testConnection = () => {
    if (socketRef.current?.connected) {
      addLog('✅ Socket is connected with ID: ' + socketRef.current.id);
    } else {
      addLog('❌ Socket is not connected');
    }
  };

  const sendTestEvent = () => {
    const testData = {
      message: 'Hello from React test client!',
      timestamp: new Date().toISOString()
    };
    socketRef.current?.emit('test-event', testData);
    addLog('📤 Sent test event: ' + JSON.stringify(testData));
  };

  const clearLog = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Planning Poker Socket.io Test Client</h1>
        
        <div className={`p-4 mb-6 rounded-lg border ${
          isConnected 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {status}
        </div>
        
        <div className="mb-6 space-x-4">
          <button
            onClick={testConnection}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Connection
          </button>
          <button
            onClick={sendTestEvent}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Test Event
          </button>
          <button
            onClick={clearLog}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Log
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200">Connection Log:</h3>
          <div 
            ref={logContainerRef}
            className="p-4 h-96 overflow-y-auto bg-gray-50 font-mono text-sm"
          >
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketTest;