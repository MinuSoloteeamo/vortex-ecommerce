'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import styles from './AIChatBox.module.css';

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('AI');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === 'ADMIN';

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initialize or restore session
  useEffect(() => {
    const initSession = async () => {
      const storedId = localStorage.getItem('vortex_chat_session_id');
      try {
        const res = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: storedId })
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.id);
          setSessionStatus(data.status);
          localStorage.setItem('vortex_chat_session_id', data.id);
          
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            // First time welcome message
            setMessages([
              {
                id: 'welcome',
                senderType: 'AI',
                content: 'Chào mừng game thủ đến với VORTEX! 🌀 Tôi là trợ lý ảo hỗ trợ tư vấn Gaming Gear và chính sách 24/7. Hôm nay bạn cần tôi tư vấn thiết bị nào?'
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to initialize chat session', err);
      }
    };

    initSession();
  }, []);

  // 2. Poll for new messages if the session is HUMAN or PENDING_HUMAN
  useEffect(() => {
    if (!sessionId) return;
    if (sessionStatus === 'AI') return; // AI responds instantly, no polling needed

    const pollSession = async () => {
      try {
        const res = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (res.ok) {
          const data = await res.json();
          // Nếu backend trả về ID mới (do đổi tài khoản đăng nhập), đồng bộ lại state
          if (data.id && data.id !== sessionId) {
            setSessionId(data.id);
            localStorage.setItem('vortex_chat_session_id', data.id);
          }
          setSessionStatus(data.status);
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error('Error polling chat messages:', err);
      }
    };

    const interval = setInterval(pollSession, 3000);
    return () => clearInterval(interval);
  }, [sessionId, sessionStatus]);

  // Admin Notification Polling
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchPendingChats = async () => {
      try {
        const res = await fetch('/api/admin/chat');
        if (res.ok) {
          const sessions = await res.json();
          const count = sessions.filter(s => s.status === 'PENDING_HUMAN').length;
          setPendingCount(count);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPendingChats();
    const interval = setInterval(fetchPendingChats, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // 3. Automated Timeout Fallback (Reverts to AI with a polite message if no staff claims in 1 min)
  useEffect(() => {
    let timeoutId = null;

    if (sessionStatus === 'PENDING_HUMAN' && sessionId) {
      // 2 minutes timeout (120000ms) for auto-fallback to AI
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch('/api/admin/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              action: 'TIMEOUT'
            })
          });

          if (res.ok) {
            const data = await res.json();
            setSessionStatus('AI');
            
            // Add the server-persisted highly polite system-level AI fallback message
            if (data.fallbackMsg) {
              setMessages(prev => [...prev, data.fallbackMsg]);
            }
          }
        } catch (err) {
          console.error('Error handling timeout fallback:', err);
        }
      }, 120000); // 2 minutes
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionStatus, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || !sessionId) return;

    if (!textToSend) setInput('');

    // Local append for user UI responsiveness
    const tempUserMsg = { id: Date.now().toString(), senderType: 'USER', content: userText };
    setMessages(prev => [...prev, tempUserMsg]);
    
    if (sessionStatus === 'AI') {
      setIsTyping(true);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content: userText })
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.status === 'AI' && data.aiMessage) {
          // Delay for realistic typing simulator feel
          setTimeout(() => {
            setMessages(prev => {
              // Filter out temp duplicates if any and append real AI message
              const filtered = prev.filter(m => m.id !== tempUserMsg.id);
              return [...filtered, data.userMessage, data.aiMessage];
            });
            setIsTyping(false);
          }, 800);
        } else {
          // In HUMAN mode, just sync database message back
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== tempUserMsg.id);
            return [...filtered, data.userMessage];
          });
          setIsTyping(false);
        }
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const handleConnectHuman = async () => {
    if (!sessionId) return;

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'CONNECT_HUMAN'
        })
      });

      if (res.ok) {
        setSessionStatus('PENDING_HUMAN');
        // Refresh session messages immediately
        const sessionRes = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (data.id && data.id !== sessionId) {
            setSessionId(data.id);
            localStorage.setItem('vortex_chat_session_id', data.id);
            
            // Re-trigger connect human for the new correct session
            await fetch('/api/admin/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: data.id, action: 'CONNECT_HUMAN' })
            });
          }
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert simple markdown-like syntax (**bold**, [link](url)) into react elements
  const renderMessageContent = (content) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    const hasLinks = content.match(linkRegex);
    if (hasLinks) {
      const elements = [];
      let lastIndex = 0;
      let match;
      
      const linkPattern = /\[(.*?)\]\((.*?)\)/g;
      while ((match = linkPattern.exec(content)) !== null) {
        const textBefore = content.substring(lastIndex, match.index);
        elements.push(parseBoldText(textBefore));
        
        elements.push(
          <a key={match.index} href={match[2]} className={styles.chatLink}>
            {match[1]}
          </a>
        );
        lastIndex = linkPattern.lastIndex;
      }
      elements.push(parseBoldText(content.substring(lastIndex)));
      return elements;
    }

    return parseBoldText(content);
  };

  const parseBoldText = (text) => {
    const boldPattern = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(text)) !== null) {
      parts.push(text.substring(lastIndex, match.index));
      parts.push(<strong key={match.index} style={{ color: 'var(--color-primary)' }}>{match[1]}</strong>);
      lastIndex = boldPattern.lastIndex;
    }
    parts.push(text.substring(lastIndex));
    return parts;
  };

  const QUICK_QUESTIONS = [
    { label: '⌨️ Bàn phím cơ', text: 'Tư vấn cho tôi các dòng bàn phím cơ đang bán chạy' },
    { label: '🛡️ Bảo hành?', text: 'Chính sách bảo hành và đổi trả của cửa hàng thế nào?' },
    { label: '🚚 Giao hàng?', text: 'Thời gian giao hàng mất bao lâu và phí ship ra sao?' },
    { label: '📍 Địa chỉ?', text: 'Địa chỉ showroom VORTEX ở đâu và có mở cửa tối không?' }
  ];

  return (
    <div className={styles.chatWidget} id="vortex-ai-chatbox">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button 
          className={`${styles.chatBubble} ${isAdmin && pendingCount > 0 ? styles.alertBubble : ''}`} 
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          {isAdmin && pendingCount > 0 ? (
            <span className={styles.notificationBadge}>{pendingCount}</span>
          ) : (
            <span className={styles.onlineBadge}></span>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.bubbleIcon}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className={styles.bubbleText}>
            {isAdmin && pendingCount > 0 ? 'Khách Cần Giúp!' : 'VORTEX AI'}
          </span>
        </button>
      )}

      {/* Expanded Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}>
                {sessionStatus === 'AI' ? '🤖' : '👤'}
              </div>
              <div>
                <h3 className={styles.botName}>
                  {sessionStatus === 'AI' ? 'Trợ Lý VORTEX' : 'Tư Vấn Viên'}
                </h3>
                <span className={styles.botStatus}>
                  ● {sessionStatus === 'AI' ? 'Trợ lý ảo AI' : sessionStatus === 'PENDING_HUMAN' ? 'Đang kết nối...' : 'Hỗ trợ trực tuyến'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin && pendingCount > 0 && (
                <a href="/admin/support" className={styles.adminAlertLink} title="Đến trang quản lý chat">
                  🔔 {pendingCount} Khách chờ
                </a>
              )}
              {sessionStatus === 'AI' && !isAdmin && (
                <button 
                  className={styles.connectHumanBtn}
                  onClick={handleConnectHuman}
                  title="Gặp nhân viên hỗ trợ trực tiếp"
                >
                  💬 Gặp người
                </button>
              )}
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close Chat">
                &times;
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={styles.messagesContainer}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.messageWrapper} ${msg.senderType === 'USER' ? styles.userWrapper : styles.botWrapper}`}
              >
                {msg.senderType !== 'USER' && (
                  <div className={styles.messageAvatar}>
                    {msg.senderType === 'AI' ? '🤖' : '👤'}
                  </div>
                )}
                <div className={`${styles.messageBubble} ${msg.senderType === 'USER' ? styles.userBubble : msg.senderType === 'STAFF' ? styles.staffBubble : styles.botBubble}`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={`${styles.messageBubble} ${styles.botBubble} ${styles.typingBubble}`}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions List (Only shown in AI mode to avoid cluttering human chat) */}
          {sessionStatus === 'AI' && (
            <div className={styles.quickQuestions}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button 
                  key={i} 
                  className={styles.quickBtn}
                  onClick={() => handleSendMessage(q.text)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className={styles.inputArea}
          >
            <input 
              type="text" 
              placeholder={sessionStatus === 'PENDING_HUMAN' ? "Đang chờ nhân viên trực kết nối..." : "Hỏi VORTEX AI..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sessionStatus === 'PENDING_HUMAN'}
              className={styles.chatInput}
            />
            <button 
              type="submit" 
              className={styles.sendBtn} 
              disabled={!input.trim() || sessionStatus === 'PENDING_HUMAN'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.sendIcon}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
