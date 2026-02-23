import { useState, useEffect, useRef } from 'react';
import { ref, push, onChildAdded, query, limitToLast, serverTimestamp } from 'firebase/database';
import { db, firestoreDB } from '../../../config/firebase';
import styles from './MsnChatWindow.module.css';
import msnFigureOnline from '../../../assets/icons/msn-online.webp'

import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';
import { auth } from '../../../config/firebase';

interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  photoURL: string;
  text: string;
  timestamp: number | null;
  type?: 'text' | 'nudge';
}

const ROOM_NAMES: Record<string, string> = {
  global: 'Sala Global',
};

export default function MsnChatWindow() {
  const { instanceId } = useWindowContext();
  const windowState = useWindowStore(state => state.openWindows.find(w => w.id === instanceId));
  const roomId = windowState?.initialFileId || 'global';
  const user = auth.currentUser;

  if (!user) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomName = ROOM_NAMES[roomId] || roomId;

  const [contactInfo, setContactInfo] = useState<{ displayName: string; email: string; photoURL: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [canNudge, setCanNudge] = useState(true);

  // Buscar informações do contato (se não for global)
  useEffect(() => {
    if (roomId === 'global') return;
    import('firebase/firestore').then(async ({ doc, getDoc }) => {
      const uRef = doc(firestoreDB, `users/${roomId}`);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const data = uSnap.data();
        setContactInfo({ displayName: data.displayName, email: data.email, photoURL: data.photoURL });
      }
    });
  }, [roomId]);

  // Atualizar título da janela OS
  useEffect(() => {
    if (roomId === 'global') {
      useWindowStore.getState().updateWindowMeta(instanceId, { title: 'Sala Global - Bate-papo do MSN' });
    } else if (contactInfo) {
      const titleName = contactInfo.displayName || contactInfo.email;
      useWindowStore.getState().updateWindowMeta(instanceId, { title: `${titleName} - Conversa` });
    }
  }, [contactInfo, roomId, instanceId]);

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
        type: data.type || 'text',
      };
      setMessages(prev => [...prev, msg]);

      // Handle nudge arriving (only if it's recent, not from history dump)
      if (msg.type === 'nudge' && msg.timestamp) {
        const isRecent = (Date.now() - msg.timestamp) < 5000;
        if (isRecent) {
          triggerNudgeEffect();
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const triggerNudgeEffect = () => {
    // Tocar Som
    const audio = new Audio('https://www.myinstants.com/media/sounds/nudge.mp3');
    audio.play().catch(console.error);

    // Tremer Janela
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);

    // Trazer pro topo
    useWindowStore.getState().bringToFront(instanceId);
  };

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [messages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !user) return;

    const messagesRef = ref(db, `messages/${roomId}`);
    push(messagesRef, {
      uid: user.uid,
      name: user.displayName || 'Anônimo',
      photoURL: user.photoURL || '',
      text,
      type: 'text',
      timestamp: serverTimestamp(),
    });

    setInputText('');
  };

  const sendNudge = () => {
    if (!user || !canNudge) return;

    // Rate limit the nudge
    setCanNudge(false);
    setTimeout(() => setCanNudge(true), 10000); // 10s cooldown

    const messagesRef = ref(db, `messages/${roomId}`);
    push(messagesRef, {
      uid: user.uid,
      name: user.displayName || 'Anônimo',
      photoURL: user.photoURL || '',
      text: '',
      type: 'nudge',
      timestamp: serverTimestamp(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${styles.chatWindow} ${isShaking ? styles.shake : ''}`}>
      {/* Menu Fictício Estilo MSN Clássico */}
      <div className={styles.classicMenuBar}>
        <span>Ficheiro</span>
        <span>Editar</span>
        <span>Acções</span>
        <span>Ferramentas</span>
        <span>Ajuda</span>
      </div>

      <div className={styles.mainLayout}>

        {/* Lado Esquerdo: Bate-papo principal */}
        <div className={styles.leftColumn}>

          <div className={styles.chatHeader}>
            <span className={styles.toLabel}>Para: </span>
            <span className={styles.toValue}>
              {roomId === 'global' ? roomName : contactInfo?.email || 'Carregando...'}
            </span>
          </div>

          <div className={styles.messagesBox}>
            <div className={styles.messagesArea}>
              {messages.length === 0 && (
                <div className={styles.emptyState}>Nenhuma mensagem ainda. Diga oi!</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={styles.messageItem}>
                  <div className={styles.msgHeader}>
                    <span className={styles.msgName}>{msg.name} diz:</span>
                  </div>
                  <div className={styles.msgBody}>
                    {msg.type === 'nudge' ? (
                      <p className={styles.nudgeText}>
                        {msg.uid === user?.uid
                          ? 'Você acaba de enviar uma chamadela!'
                          : `${msg.name} acaba de enviar uma chamadela!`}
                      </p>
                    ) : (
                      <p className={styles.msgText}>{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.inputSection}>
            <div className={styles.formatToolbar}>
              <button className={styles.formatBtn}><strong>A</strong></button>
              <button className={styles.formatBtn}>😊</button>
              <button className={styles.formatBtn}>🎙️ Clip de Voz</button>
              <div className={styles.toolbarDivider}></div>
              <button
                className={styles.formatBtn}
                onClick={sendNudge}
                disabled={!canNudge}
                title="Chamar a Atenção"
              >
                📳 Chamar Atenção
              </button>
            </div>

            <div className={styles.inputInner}>
              <textarea
                className={styles.textInput}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
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
        </div>

        {/* Lado Direito: Avatares Grandes */}
        <div className={styles.rightColumn}>
          <div className={styles.avatarBox}>
            <img
              src={roomId === 'global' ? msnFigureOnline : (contactInfo?.photoURL || msnFigureOnline)}
              className={styles.avatarImage}
              alt="Contato"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className={styles.avatarBox}>
            <img
              src={user.photoURL || msnFigureOnline}
              className={styles.avatarImage}
              alt="Meu Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
