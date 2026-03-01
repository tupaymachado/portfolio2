import { useState, useEffect, useRef } from 'react';
import { ref, push, onChildAdded, query, limitToLast, serverTimestamp } from 'firebase/database';
import { db, firestoreDB } from '../../../config/firebase';
import styles from './MsnChatWindow.module.css';
import msnFigureOnline from '../../../assets/icons/msn-online.webp'

import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';
import { auth } from '../../../config/firebase';

import angrySvg from '../../../assets/emojis/angry.svg';
import blushSvg from '../../../assets/emojis/blush.svg';
import confusedSvg from '../../../assets/emojis/confused.svg';
import crySvg from '../../../assets/emojis/cry.svg';
import disappointedSvg from '../../../assets/emojis/disappointed.svg';
import eyebrowRaiseSvg from '../../../assets/emojis/eyebrow-raise.svg';
import grinSvg from '../../../assets/emojis/grin.svg';
import hotSvg from '../../../assets/emojis/hot.svg';
import sadSvg from '../../../assets/emojis/sad.svg';
import smileSvg from '../../../assets/emojis/smile.svg';
import surpriseSvg from '../../../assets/emojis/surprise.svg';
import tongueSvg from '../../../assets/emojis/tongue.svg';
import winkSvg from '../../../assets/emojis/wink.svg';
import MsnParticipantList from './MsnParticipantList';

const EMOTICON_MAP: Record<string, string> = {
  ':)': smileSvg, ':-)': smileSvg, '😊': smileSvg, '🙂': smileSvg,
  ':D': grinSvg, ':-D': grinSvg, '😃': grinSvg, '😁': grinSvg,
  ':(': sadSvg, ':-(': sadSvg, '☹️': sadSvg, '🙁': sadSvg,
  ':O': surpriseSvg, ':-O': surpriseSvg, ':o': surpriseSvg, ':-o': surpriseSvg, '😮': surpriseSvg, '😲': surpriseSvg,
  ':P': tongueSvg, ':-P': tongueSvg, ':p': tongueSvg, ':-p': tongueSvg, '😛': tongueSvg, '😜': tongueSvg,
  ';)': winkSvg, ';-)': winkSvg, '😉': winkSvg,
  ':@': angrySvg, ':-@': angrySvg, '😡': angrySvg, '😠': angrySvg,
  ':$': blushSvg, ':-$': blushSvg, '😳': blushSvg,
  ':S': confusedSvg, ':-S': confusedSvg, ':s': confusedSvg, ':-s': confusedSvg, '😕': confusedSvg, '😖': confusedSvg,
  ":'(": crySvg, ":'-(": crySvg, '😢': crySvg, '😭': crySvg,
  ':|': disappointedSvg, ':-|': disappointedSvg, '😐': disappointedSvg, '😑': disappointedSvg,
  '(H)': hotSvg, '(h)': hotSvg, '😎': hotSvg,
  '🤨': eyebrowRaiseSvg, 'o.O': eyebrowRaiseSvg, 'O.o': eyebrowRaiseSvg,
};

const UNIQUE_EMOTICONS = [
  { shortcut: ':)', src: smileSvg },
  { shortcut: ':D', src: grinSvg },
  { shortcut: ':(', src: sadSvg },
  { shortcut: ':O', src: surpriseSvg },
  { shortcut: ':P', src: tongueSvg },
  { shortcut: ';)', src: winkSvg },
  { shortcut: ':@', src: angrySvg },
  { shortcut: ':$', src: blushSvg },
  { shortcut: ':S', src: confusedSvg },
  { shortcut: ':\'(', src: crySvg },
  { shortcut: ':|', src: disappointedSvg },
  { shortcut: '(H)', src: hotSvg },
  { shortcut: '🤨', src: eyebrowRaiseSvg },
];

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMOTICON_REGEX = new RegExp(
  `(${Object.keys(EMOTICON_MAP).sort((a, b) => b.length - a.length).map(escapeRegExp).join('|')})`,
  'g'
);

const parseEmoticons = (text: string) => {
  if (!text) return null;
  const parts = text.split(EMOTICON_REGEX);
  return parts.map((part, index) => {
    if (EMOTICON_MAP[part]) {
      return <img key={index} src={EMOTICON_MAP[part]} alt={part} className={styles.emoticon} />;
    }
    return <span key={index}>{part}</span>;
  });
};

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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false); // Mobile Drawer state

  // Fechar o picker se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (isEmojiPickerOpen && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    }

    // Use capture phase to ensure we catch clicks before Windows/Desktop stops propagation
    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("touchstart", handleClickOutside, { capture: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("touchstart", handleClickOutside, { capture: true });
    };
  }, [isEmojiPickerOpen]);

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

  const addEmojiToInput = (shortcut: string) => {
    setInputText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + shortcut + ' ');
    setIsEmojiPickerOpen(false);

    // Devolve o foco para o input após escolher o emoji
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
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
            {roomId === 'global' && (
              <button
                className={styles.mobileParticipantsBtn}
                onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
              >
                👥 Participantes
              </button>
            )}
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
                      <p className={styles.msgText}>{parseEmoticons(msg.text)}</p>
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

              <div className={styles.emojiPickerContainer} ref={emojiPickerRef}>
                <button
                  className={styles.formatBtn}
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                >
                  😊
                </button>

                {isEmojiPickerOpen && (
                  <div className={styles.emojiPicker}>
                    <div className={styles.emojiGrid}>
                      {UNIQUE_EMOTICONS.map((emoticon) => (
                        <button
                          key={emoticon.shortcut}
                          className={styles.emojiOption}
                          onClick={() => addEmojiToInput(emoticon.shortcut)}
                          title={emoticon.shortcut}
                        >
                          <img src={emoticon.src} alt={emoticon.shortcut} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                ref={textareaRef}
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

        {/* Lado Direito: Avatares Grandes (Privado) OU Lista de Participantes (Global) */}
        {roomId === 'global' ? (
          <div className={`${styles.rightColumn} ${styles.globalColumn} ${isParticipantsOpen ? styles.mobileOpen : ''}`}>
            {/* O cabeçalho no mobile ajuda a fechar */}
            <div className={styles.participantsHeaderMobile}>
              <span>Participantes da Sala</span>
              <button onClick={() => setIsParticipantsOpen(false)}>✕</button>
            </div>

            <div className={styles.participantListContainer}>
              <MsnParticipantList />
            </div>
          </div>
        ) : (
          <div className={styles.rightColumn}>
            <div className={styles.avatarBox}>
              <img
                src={contactInfo?.photoURL || msnFigureOnline}
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
        )}
      </div>
    </div>
  );
}
