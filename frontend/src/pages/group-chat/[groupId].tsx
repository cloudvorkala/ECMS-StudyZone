import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readBy: string[];
}

interface TypingEvent {
  userId: string;
  isTyping: boolean;
}

interface UserData {
  id: string;
  name: string;
  role: string;
}

export default function GroupChatPage() {
  const router = useRouter();
  const { groupId } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId) return;

    const user = sessionStorage.getItem('user');
    if (!user) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);

    // Initialize Socket.IO connection
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3001', {
      auth: {
        userId: parsedUser.id,
      },
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      socketRef.current?.emit('joinGroup', groupId);
    });

    // Message event handlers
    socketRef.current.on('groupMessages', (receivedMessages: Message[]) => {
      setMessages(receivedMessages.reverse());
      setLoading(false);
    });

    socketRef.current.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('userTyping', ({ userId, isTyping }: TypingEvent) => {
      if (userId !== parsedUser.id) {
        setIsTyping(isTyping);
      }
    });

    socketRef.current.on('error', (error: string) => {
      setError(error);
      setLoading(false);
    });

    // Heartbeat
    const pingInterval = setInterval(() => {
      socketRef.current?.emit('ping');
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socketRef.current?.emit('leaveGroup', groupId);
      socketRef.current?.disconnect();
    };
  }, [groupId, router]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !groupId) return;

    socketRef.current.emit('sendMessage', {
      groupId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !groupId) return;
    socketRef.current.emit('typing', {
      groupId,
      isTyping: true,
    });

    // Auto-cancel typing status after 3 seconds
    setTimeout(() => {
      socketRef.current?.emit('typing', {
        groupId,
        isTyping: false,
      });
    }, 3000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" p={3}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['mentor', 'student']}>
      <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Group Chat</Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <List
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
            }}
          >
            {messages.map((message) => (
              <ListItem
                key={message._id}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.senderId === userData.id ? 'flex-end' : 'flex-start',
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  {message.senderName}
                </Typography>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    backgroundColor: message.senderId === userData.id ? 'primary.light' : 'grey.100',
                    color: message.senderId === userData.id ? 'white' : 'text.primary',
                    maxWidth: '70%',
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
                <Typography variant="caption" color="textSecondary">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Typography>
              </ListItem>
            ))}
            {isTyping && (
              <ListItem>
                <Typography variant="caption" color="textSecondary">
                  Someone is typing...
                </Typography>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          <Divider />

          <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={handleTyping}
                multiline
                maxRows={4}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
}