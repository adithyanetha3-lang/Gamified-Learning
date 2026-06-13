import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '../hooks/useAuthSession';

function AIChatbot() {
  const { t } = useTranslation();
  const { profile } = useAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      const welcomeMessage = profile.role === 'student'
        ? "Hi! I'm your learning assistant. How can I help you today? You can ask me about:\n\n• How to take quizzes\n• Checking your progress\n• Understanding XP and levels\n• Finding subjects and topics"
        : "Hello! I'm here to help you with:\n\n• Creating questions\n• Managing subjects\n• Understanding analytics\n• Student progress tracking\n• Question bank usage";
      
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [isOpen, messages.length, profile.role]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Call backend AI API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://gamified-learning-api-7cmb.onrender.com'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          role: profile.role,
          userId: profile.uid,
          context: {
            page: window.location.pathname,
            language: localStorage.getItem('language') || 'en'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Backend not available');
      }

      const data = await response.json();
      
      // Add AI response
      if (data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response
        }]);
      } else {
        throw new Error('No response from backend');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Use fallback responses (no backend needed)
      const fallbackResponse = getFallbackResponse(userMessage, profile.role);
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
    } finally {
      setIsTyping(false);
    }
  }

  function getFallbackResponse(message, role) {
    const lowerMessage = message.toLowerCase();
    
    if (role === 'student') {
      // Quiz-related questions
      if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('take')) {
        return "To take a quiz:\n\n1. Click 'Quiz' in the top menu\n2. Select a subject and topic\n3. Click 'Start Quiz'\n4. Answer all questions\n5. Submit to see your score and earn XP!\n\nEach correct answer gives you XP to level up! 🎯";
      }
      
      // XP and leveling
      if (lowerMessage.includes('xp') || lowerMessage.includes('point') || lowerMessage.includes('level') || lowerMessage.includes('earn')) {
        return "XP (Experience Points) help you level up! 📈\n\n• Complete quizzes to earn XP\n• Each correct answer = more XP\n• 100 XP = 1 Level up\n• Higher levels = more badges\n\nCheck your progress in the 'Track' page!";
      }
      
      // Progress and tracking
      if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('check')) {
        return "View your progress in the 'Track' page! 📊\n\nYou'll see:\n• Your current level and XP\n• Quiz completion stats\n• Subject-wise performance\n• Recent activity\n• Badges earned\n\nKeep learning to see your progress grow!";
      }
      
      // Leaderboard
      if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank') || lowerMessage.includes('top') || lowerMessage.includes('compare')) {
        return "The Leaderboard shows top students! 🏆\n\n• Ranked by total XP\n• See your current rank\n• Compare with classmates\n• Top 10 students displayed\n\nComplete more quizzes to climb higher!";
      }
      
      // Learn page
      if (lowerMessage.includes('learn') || lowerMessage.includes('lesson') || lowerMessage.includes('study') || lowerMessage.includes('read')) {
        return "The 'Learn' page has learning paths! 📚\n\n• Choose a subject to explore\n• Read lesson content\n• Learn before taking quizzes\n• Topics organized by subject\n\nStart learning to master new topics!";
      }
      
      // Rewards
      if (lowerMessage.includes('reward') || lowerMessage.includes('badge') || lowerMessage.includes('prize')) {
        return "Earn rewards as you learn! 🏅\n\n• Complete quizzes for badges\n• Level up for special rewards\n• Track achievements in Rewards page\n• Unlock new badges at milestones\n\nKeep completing quizzes to collect them all!";
      }
      
      // Help with subjects
      if (lowerMessage.includes('subject') || lowerMessage.includes('topic') || lowerMessage.includes('find') || lowerMessage.includes('where')) {
        return "Finding subjects and topics:\n\n• 'Learn' page - Browse all subjects\n• 'Quiz' page - Take quizzes by subject\n• Each subject has multiple topics\n• Start with topics you know best\n\nChoose a subject that interests you!";
      }
      
      // General greeting
      if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        return "Hello! 👋 I'm your learning assistant!\n\nI can help you with:\n• Taking quizzes\n• Tracking progress\n• Understanding XP and levels\n• Finding subjects and topics\n• Checking leaderboard\n\nWhat would you like to know?";
      }
      
      // Default response
      return "I'm here to help! 🤖\n\nI can answer questions about:\n• How to take quizzes\n• Checking your progress\n• Understanding XP and levels\n• Finding subjects and topics\n• Leaderboard rankings\n• Earning rewards\n\nJust ask me anything!";
    } else {
      // Teacher-specific responses
      
      // Question generation
      if (lowerMessage.includes('question') || lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('creating')) {
        return "Generate questions with AI! 🤖\n\n1. Go to 'Generate' page\n2. Select subject and topic\n3. Choose difficulty level\n4. Set number of questions (1-10)\n5. Click 'Generate'\n6. Review and save to question bank\n\nThe AI creates contextual questions instantly!";
      }
      
      // Analytics
      if (lowerMessage.includes('student') || lowerMessage.includes('analytics') || lowerMessage.includes('performance') || lowerMessage.includes('score')) {
        return "View student performance in Analytics! 📊\n\n• Total quiz attempts\n• Average scores by student\n• Top performers\n• Recent activity\n• Subject-wise performance\n• Click student names for details\n\nUse this data to identify struggling students!";
      }
      
      // Subject management
      if (lowerMessage.includes('subject') || lowerMessage.includes('topic') || lowerMessage.includes('manage') || lowerMessage.includes('organize')) {
        return "Manage subjects and topics! 📚\n\n1. Go to 'Subjects' page\n2. Create new subjects\n3. Add topics within subjects\n4. Generate lesson content with AI\n5. Organize your curriculum\n6. Link questions to topics\n\nKeep your content well-structured!";
      }
      
      // Question bank
      if (lowerMessage.includes('bank') || lowerMessage.includes('publish') || lowerMessage.includes('review')) {
        return "Question Bank management! 📝\n\n• View all questions by topic\n• Filter by subject/topic\n• Approve draft questions\n• Publish for student quizzes\n• Edit or delete questions\n• Reuse in multiple quizzes\n\nKeep your question bank organized!";
      }
      
      // Lesson generation
      if (lowerMessage.includes('lesson') || lowerMessage.includes('content') || lowerMessage.includes('teach')) {
        return "Generate lesson content! ✨\n\n1. Go to 'Subjects' page\n2. Create or edit a topic\n3. Enter topic name and description\n4. Click 'Generate Lesson with AI'\n5. AI creates educational content\n6. Edit and save\n\nMake lesson creation faster!";
      }
      
      // General greeting
      if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        return "Hello! 👋 I'm your teaching assistant!\n\nI can help you with:\n• Generating questions\n• Managing subjects and topics\n• Viewing student analytics\n• Question bank management\n• Creating lesson content\n\nWhat do you need help with?";
      }
      
      // Default response
      return "I'm here to assist! 🤖\n\nI can help with:\n• Generating questions with AI\n• Managing subjects and topics\n• Viewing student analytics\n• Question bank management\n• Creating lesson content\n• Student progress tracking\n\nWhat would you like to know?";
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 1000,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        aria-label="Open AI Assistant"
      >
        🤖
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '400px',
        height: '600px',
        backgroundColor: '#ffffff',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#3182ce',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>AI Assistant</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Always here to help</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '0.25rem',
            lineHeight: 1
          }}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#f7f9fc'
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#3182ce' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#1a202c',
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                fontSize: '0.875rem',
                border: '1px solid #e2e8f0',
                color: '#1a202c'
              }}
            >
              <span className="typing-indicator">●●●</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '1rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#ffffff'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f7f9fc',
            color: '#1a202c',
            fontSize: '0.875rem',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3182ce';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#3182ce',
            color: 'white',
            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            fontSize: '0.875rem',
            opacity: input.trim() && !isTyping ? 1 : 0.5
          }}
        >
          Send
        </button>
      </form>

      <style>{`
        .typing-indicator {
          display: inline-block;
          animation: blink 1.4s infinite;
        }
        
        @keyframes blink {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default AIChatbot;
