import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import AuthPage from './components/AuthPage/AuthPage';
import api from './api';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(
    () => Boolean(localStorage.getItem('authToken')),
  );
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  const signOut = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    setConversations([]);
    setIsSidebarOpen(false);
    setErrorMessage('');
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!authToken) {
      setIsCheckingSession(false);
      return;
    }

    let isCurrent = true;
    api.get('/auth/me')
      .then(response => {
        if (isCurrent) setUser(response.data.data.user);
      })
      .catch(error => {
        if (!isCurrent) return;
        if (error.response?.status === 401) {
          signOut();
        } else {
          setErrorMessage(error.response?.data?.message || 'Unable to verify your session. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsCheckingSession(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [authToken, signOut]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        signOut();
        return;
      }
      setErrorMessage(error.response?.data?.message || 'Unable to load your conversations.');
    }
  }, [signOut]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  const handleSendMessage = async question => {
    setErrorMessage('');
    // Optimistically add user message
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };
    setConversations(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await api.post('/chat/conversations', {
        question,
      });
      if (response.data.success) {
        const { userConversation, assistantConversation } = response.data.data;
        setConversations(prev => {
          const filtered = prev.filter(msg => msg.id !== tempUserMessage.id);
          return [...filtered, userConversation, assistantConversation];
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'There was an error generating a response.';

      if (error.response?.status === 401) {
        signOut();
      } else {
        setConversations(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        setErrorMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticated = ({ token, user: authenticatedUser }) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setUser(authenticatedUser);
    setConversations([]);
    setIsSidebarOpen(false);
    setErrorMessage('');
    setIsCheckingSession(false);
  };

  if (isCheckingSession) {
    return <main className='session-loading' aria-label='Checking your session'>Loading…</main>;
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} initialError={errorMessage} />;
  }

  return (
    <div className='app'>
      {isSidebarOpen && (
        <button
          className='sidebar-backdrop'
          type='button'
          aria-label='Close navigation menu'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        user={user}
        onSignOut={signOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className='chat'>
        <ChatHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} />

        {errorMessage && <p className='chat-error' role='alert'>{errorMessage}</p>}
        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
