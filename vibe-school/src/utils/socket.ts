import { io, Socket } from 'socket.io-client';
import { Profile, Message, FriendRequest } from '../community/db';

let socket: Socket<any, any> | null = null;
const DEBUG_COMMUNITY = process.env.DEBUG_COMMUNITY === 'true';

export const initializeSocket = (token: string): Socket<any, any> => {
  if (socket) {
    return socket;
  }

  // Use localhost for development, production URL otherwise
  const socketUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SOCKET_URL || '' 
    : 'http://localhost:3000';

  socket = io(socketUrl, {
    path: '/api/socket',
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Connected to server:', socket?.id);
    }
    
    // Authenticate the socket connection
    socket?.emit('authenticate', token);
  });

  socket.on('disconnect', (reason) => {
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Disconnected from server:', reason);
    }
  });

  if (DEBUG_COMMUNITY) {
    console.log('[SOCKET] Initialized socket connection');
  }

  return socket;
};

export const getSocket = (): Socket<any, any> | null => {
  return socket;
};

export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('join-conversation', conversationId);
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Joined conversation:', conversationId);
    }
  }
};

export const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('leave-conversation', conversationId);
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Left conversation:', conversationId);
    }
  }
};

export const sendTypingStart = (conversationId: string, userId: string) => {
  if (socket) {
    socket.emit('typing:start', { conversationId, userId });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Sent typing start:', { conversationId, userId });
    }
  }
};

export const sendTypingStop = (conversationId: string, userId: string) => {
  if (socket) {
    socket.emit('typing:stop', { conversationId, userId });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Sent typing stop:', { conversationId, userId });
    }
  }
};

export const sendMessage = (
  conversationId: string,
  senderId: string,
  body: string,
  attachment_url?: string,
  attachment_type?: string
) => {
  if (socket) {
    socket.emit('message:send', {
      conversationId,
      senderId,
      body,
      attachment_url,
      attachment_type,
    });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Sent message:', { conversationId, senderId, body });
    }
  }
};

export const markMessageAsRead = (conversationId: string, userId: string, lastReadAt: string) => {
  if (socket) {
    socket.emit('message:mark-read', { conversationId, userId, lastReadAt });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Marked messages as read:', { conversationId, userId, lastReadAt });
    }
  }
};

export const sendFriendRequest = (requesterId: string, addresseeId: string) => {
  if (socket) {
    socket.emit('friend:request', { requesterId, addresseeId });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Sent friend request:', { requesterId, addresseeId });
    }
  }
};

export const updateFriendRequest = (requestId: string, status: string, updaterId: string) => {
  if (socket) {
    socket.emit('friend:request-update', { requestId, status, updaterId });
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Updated friend request:', { requestId, status, updaterId });
    }
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    if (DEBUG_COMMUNITY) {
      console.log('[SOCKET] Disconnected socket');
    }
  }
};