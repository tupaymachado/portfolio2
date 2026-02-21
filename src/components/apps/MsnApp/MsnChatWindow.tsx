import { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { ref, push, onChildAdded, query, limitToLast, serverTimestamp, set, onDisconnect } from 'firebase/database';
import { db } from '../../../config/firebase';
import styles from './MsnChatWindow.module.css';

interface MsnChatWindowProps {
  user: User;
  roomId: string;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  photoURL: string;
  text: string;
  timestamp: number | null;
}

const ROOM_NAMES: Record<string, string> = {
  global: 'Sala Global',
  tupay: 'Falar com o Tupay',
};

export default function MsnChatWindow({ user, roomId, onBack }: MsnChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomName = ROOM_NAMES[roomId] || roomId;

  // Registrar presença online
  useEffect(() => {
    const presenceRef = ref(db, `presence/${user.uid}`);
    set(presenceRef, {
      name: user.displayName || 'Anônimo',
      photoURL: user.photoURL || '',
      status: 'online',
      lastSeen: serverTimestamp(),
    });

    // Marcar offline ao desconectar
    onDisconnect(presenceRef).set({
      name: user.displayName || 'Anônimo',
      photoURL: user.photoURL || '',
      status: 'offline',
      lastSeen: serverTimestamp(),
    });

    return () => {
      set(presenceRef, {
        name: user.displayName || 'Anônimo',
        photoURL: user.photoURL || '',
        status: 'offline',
        lastSeen: serverTimestamp(),
      });
    };
  }, [user]);

  // Escutar novas mensagens
  useEffect(() => {
    setMessages([]);
    const messagesRef = query(ref(db, `messages/${roomId}`), limitToLast(100));

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const msg: ChatMessage = {
        id: snapshot.key!,
        uid: data.uid,
        name: data.name,
        photoURL: data.photoURL,
        text: data.text,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, msg]);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [messages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const messagesRef = ref(db, `messages/${roomId}`);
    push(messagesRef, {
      uid: user.uid,
      name: user.displayName || 'Anônimo',
      photoURL: user.photoURL || '',
      text,
      timestamp: serverTimestamp(),
    });

    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatWindow}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.backButton} onClick={onBack}>
          &larr; Voltar
        </button>
        <span className={styles.roomTitle}>{roomName}</span>
      </div>

      {/* Área de mensagens */}
      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            Nenhuma mensagem ainda. Diga oi!
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.uid === user.uid ? styles.own : ''}`}
          >
            <img
              src={msg.photoURL}
              alt=""
              className={styles.msgAvatar}
              referrerPolicy="no-referrer"
            />
            <div className={styles.msgContent}>
              <div className={styles.msgHeader}>
                <span className={styles.msgName}>{msg.name}</span>
                <span className={styles.msgTime}>{formatTime(msg.timestamp)}</span>
              </div>
              <p className={styles.msgText}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <textarea
          className={styles.textInput}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          rows={2}
        />
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={!inputText.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
