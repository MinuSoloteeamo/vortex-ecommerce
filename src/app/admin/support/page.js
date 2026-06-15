'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function AdminSupportPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  const activeSession = sessions.find(s => s.id === selectedSessionId);

  // Poll for sessions list every 3 seconds
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/admin/chat');
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when selected session messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages?.length]);

  const handleAction = async (action, content = null) => {
    if (!selectedSessionId) return;

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          action,
          content
        })
      });

      if (res.ok) {
        if (action === 'SEND') setReplyInput('');
        
        // Instant list refresh
        const listRes = await fetch('/api/admin/chat');
        if (listRes.ok) {
          const data = await listRes.json();
          setSessions(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    handleAction('SEND', replyInput);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Ngăn không cho click vào card kích hoạt setSelectedSessionId
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đoạn hội thoại này không?')) return;

    try {
      const res = await fetch(`/api/admin/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
        }
        // Fetch new list
        const listRes = await fetch('/api/admin/chat');
        if (listRes.ok) {
          const data = await listRes.json();
          setSessions(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h1 className={`${styles.title} text-gradient`}>⚡ LIVE CHAT SUPPORT CENTER</h1>
        <p className={styles.subtitle}>Quản lý, tư vấn và phản hồi khách hàng trực tiếp thời gian thực.</p>
      </div>

      <div className={styles.dashboardContainer}>
        {/* SESSIONS SIDEBAR */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sectionTitle}>💬 Khách Hàng Trực Tuyến</h2>
          {loading && sessions.length === 0 ? (
            <div className={styles.loading}>Đang nạp phiên chat...</div>
          ) : sessions.length === 0 ? (
            <div className={styles.empty}>Chưa có cuộc trò chuyện nào được tạo.</div>
          ) : (
            <div className={styles.sessionList}>
              {sessions.map((session) => {
                const lastMsg = session.messages?.[session.messages.length - 1]?.content || 'Không có tin nhắn';
                return (
                  <div 
                    key={session.id}
                    className={`${styles.sessionCard} ${selectedSessionId === session.id ? styles.activeCard : ''} ${session.status === 'PENDING_HUMAN' ? styles.pendingCard : ''}`}
                    onClick={() => setSelectedSessionId(session.id)}
                    style={{ cursor: 'pointer', textAlign: 'left' }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.guestName}>{session.guestName}</span>
                      <span className={`${styles.statusBadge} ${styles[session.status]}`}>
                        {session.status === 'AI' ? '🤖 AI' : session.status === 'PENDING_HUMAN' ? '🚨 CẦN GẶP' : '👤 LIVE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <p className={styles.cardSnippet} style={{ margin: 0, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{lastMsg}</p>
                      <button 
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '1rem', padding: '0 0.5rem' }}
                        title="Xóa cuộc trò chuyện này"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* CHAT WINDOW AREA */}
        <main className={styles.chatArea}>
          {activeSession ? (
            <div className={styles.chatWrapper}>
              {/* Active Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  <h3>{activeSession.guestName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {activeSession.id}</span>
                </div>
                <div className={styles.chatHeaderRight} style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'transparent' }}
                    onClick={(e) => handleDeleteSession(activeSession.id, e)}
                    title="Xóa toàn bộ cuộc trò chuyện này"
                  >
                    🗑️ Xóa
                  </button>
                  {activeSession.status !== 'HUMAN' ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem' }}
                      onClick={() => handleAction('CLAIM')}
                    >
                      🤝 Tiếp Nhận Hỗ Trợ
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                      onClick={() => handleAction('CLOSE')}
                    >
                      🤖 Trả Về Cho AI
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Content */}
              <div className={styles.messagesDisplay}>
                {activeSession.messages?.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`${styles.messageBlock} ${msg.senderType === 'STAFF' ? styles.staffBlock : msg.senderType === 'USER' ? styles.userBlock : styles.aiBlock}`}
                  >
                    <div className={styles.senderLabel}>
                      {msg.senderType === 'STAFF' ? '👤 Bạn (Nhân viên)' : msg.senderType === 'USER' ? `👤 ${activeSession.guestName}` : '🤖 VORTEX AI'}
                    </div>
                    <div className={styles.messageBubble}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input Area */}
              <form onSubmit={handleSendReply} className={styles.replyArea}>
                <input 
                  type="text" 
                  placeholder={activeSession.status !== 'HUMAN' ? "Nhấp 'Tiếp Nhận Hỗ Trợ' ở phía trên để bắt đầu chat trực tiếp..." : "Gõ phản hồi khách hàng..."}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  disabled={activeSession.status !== 'HUMAN'}
                  className={styles.replyInput}
                />
                <button 
                  type="submit" 
                  disabled={activeSession.status !== 'HUMAN' || !replyInput.trim()}
                  className="btn btn-primary"
                  style={{ height: '48px', minWidth: '100px' }}
                >
                  Gửi Phản Hồi
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.selectPromptIcon}>💬</div>
              <h3>Vui lòng chọn một phòng chat ở danh sách bên trái để bắt đầu.</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
