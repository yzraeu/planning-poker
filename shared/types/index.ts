export interface User {
  id: string;
  name: string;
  isSpectator: boolean;
}

export interface Vote {
  userId: string;
  value: string | null;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  votes: Vote[];
  isRevealed: boolean;
  createdAt: number;
}

export interface SocketEvents {
  // Client to Server
  'join-room': (data: { roomId: string; userName: string; isSpectator: boolean }) => void;
  'leave-room': (data: { roomId: string }) => void;
  'submit-vote': (data: { roomId: string; vote: string }) => void;
  'reveal-votes': (data: { roomId: string }) => void;
  'reset-votes': (data: { roomId: string }) => void;

  // Server to Client
  'room-updated': (room: Room) => void;
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'vote-submitted': (vote: Vote) => void;
  'votes-revealed': () => void;
  'votes-reset': () => void;
  'error': (message: string) => void;
}