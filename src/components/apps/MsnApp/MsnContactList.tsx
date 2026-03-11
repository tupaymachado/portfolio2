import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp, onChildAdded, query, limitToLast } from 'firebase/database';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db, firestoreDB } from '../../../config/firebase';
import { useWebampStore } from '../../../stores/useWebampStore';
import { msnUserService } from '../../../services/msnUserService';
import MsnProfileModal from './MsnProfileModal';
import MsnAddContactModal from './MsnAddContactModal';
import styles from './MsnContactList.module.css';
import msnLogoTitle from '../../../assets/icons/msn-logo-title.webp'
import msnFigureOnline from '../../../assets/icons/msn-online.webp'
import msnFigureOffline from '../../../assets/icons/msn-offline.webp'
import { useWindowStore } from '../../../stores/useWindowStore';

interface MsnContactListProps {
  user: User;
  initialStatus: string;
  onLogout: () => void;
}

interface PresenceData {
  [uid: string]: {
    name: string;
    photoURL: string;
    status: 'online' | 'offline';
    lastSeen: number;
  };
}

interface ContactData {
  uid: string;
  group: string;
  email: string;
  displayName: string;
  photoURL: string;
  personalMessage: string;
  status: string;
}

export default function MsnContactList({ user, initialStatus, onLogout }: MsnContactListProps) {
  const { t } = useTranslation();
  const openWindow = useWindowStore(state => state.openWindow);

  // Construir ROOMS dinamicamente usando traduções
  const ROOMS = [
    { id: 'global', name: t('msn.rooms.global'), emoji: '\uD83C\uDF0D' },
  ];

  const [onlineCount, setOnlineCount] = useState(0);
  const [presenceMap, setPresenceMap] = useState<PresenceData>({});
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [personalMessage, setPersonalMessage] = useState('');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [contactMetas, setContactMetas] = useState<{ uid: string; group: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Obter música atual do Webamp
  const currentTrack = useWebampStore(state => state.currentTrack);

  // Escutar presença e Registrar própria presença
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const myPresenceRef = ref(db, `presence/${user.uid}`);

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        const myDisconnectRef = onDisconnect(myPresenceRef);
        myDisconnectRef.update({
          status: 'offline',
          lastSeen: serverTimestamp(),
        }).then(() => {
          set(myPresenceRef, {
            name: user.displayName || 'Anônimo',
            photoURL: user.photoURL || '',
            status: initialStatus || 'online',
            lastSeen: serverTimestamp(),
          });
        });
      }
    });

    const presenceRef = ref(db, 'presence');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() as PresenceData | null;
      if (data) {
        const count = Object.values(data).filter(p => p.status === 'online').length;
        setOnlineCount(count);
        setPresenceMap(data);
      } else {
        setOnlineCount(0);
        setPresenceMap({});
      }
    });

    const userDocRef = doc(firestoreDB, `users/${user.uid}`);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setDisplayName(data.displayName || user.displayName || '');
        setPhotoURL(data.photoURL || user.photoURL || '');
        setPersonalMessage(data.personalMessage || '');
      }
    });

    // Listen to contacts list — só UIDs e grupos, perfis em tempo real no effect abaixo
    const contactsRef = collection(firestoreDB, `users/${user.uid}/contacts`);
    const unsubscribeContacts = onSnapshot(contactsRef, (snapshot) => {
      if (snapshot.empty) {
        setContactMetas([]);
        return;
      }
      setContactMetas(
        snapshot.docs.map(d => ({
          uid: d.id,
          group: d.data().group || 'Outros Contatos',
        }))
      );
    });

    return () => {
      unsubscribeConnected();
      set(myPresenceRef, {
        name: user.displayName || 'Anônimo',
        photoURL: user.photoURL || '',
        status: 'offline',
        lastSeen: serverTimestamp(),
      });
      unsubscribe();
      unsubscribeUser();
      unsubscribeContacts();
    };
  }, [user.uid, user.displayName, user.photoURL]);

  // Auto-open chat when an incoming message arrives from a contact
  useEffect(() => {
    if (contacts.length === 0) return;

    const unsubs: (() => void)[] = [];

    for (const contact of contacts) {
      const roomId = [user.uid, contact.uid].sort().join('_');
      // Capture mount time — any msg with timestamp <= this is already "old"
      const listenStart = Date.now();

      const msgRef = query(ref(db, `messages/${roomId}`), limitToLast(10));

      const unsub = onChildAdded(msgRef, (snapshot) => {
        const msg = snapshot.val();
        if (!msg || msg.uid === user.uid) return;

        // Firebase timestamps can be a number or null (serverTimestamp pending)
        const msgTime = typeof msg.timestamp === 'number' ? msg.timestamp : 0;
        // Ignore messages that existed before we started listening
        if (msgTime <= listenStart) return;

        // Check if window is already open for this contact
        const alreadyOpen = useWindowStore.getState().openWindows.find(
          w => w.programId === 'msn-chat' && w.initialFileId === contact.uid
        );
        if (!alreadyOpen) {
          openWindow('msn-chat', { fileId: contact.uid });
        }
      });

      unsubs.push(unsub);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }, [contacts, user.uid, openWindow]);

  // Listener em tempo real para o perfil de cada contato
  useEffect(() => {
    if (contactMetas.length === 0) {
      setContacts([]);
      return;
    }

    const profileMap = new Map<string, ContactData>();
    const unsubs: (() => void)[] = [];

    for (const meta of contactMetas) {
      const userDocRef = doc(firestoreDB, `users/${meta.uid}`);
      const unsub = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          profileMap.set(meta.uid, {
            uid: meta.uid,
            group: meta.group,
            email: data.email || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL || '',
            personalMessage: data.personalMessage || '',
            status: data.status || 'offline',
          });
          setContacts(Array.from(profileMap.values()));
        }
      });
      unsubs.push(unsub);
    }

    return () => unsubs.forEach(u => u());
  }, [contactMetas]);

  const handleUpdateProfile = async (newName: string, newPhoto: string, newMessage: string) => {
    await msnUserService.updateUserProfile(user.uid, {
      displayName: newName,
      photoURL: newPhoto,
      personalMessage: newMessage,
    });
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    await msnUserService.updateStatus(user.uid, newStatus);
  };

  const handlePersonalMessageChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (currentTrack) return; // música tocando — não sobrescrever a mensagem real
    const newMessage = e.target.value;
    if (newMessage !== personalMessage) {
      await msnUserService.updateUserProfile(user.uid, {
        personalMessage: newMessage
      });
    }
  };

  const devMockContacts: ContactData[] = import.meta.env.DEV ? [
    ...Array.from({ length: 10 }).map((_, i) => ({
      uid: `mock-online-${i}`,
      group: 'Outros Contatos',
      email: `online${i}@dev.local`,
      displayName: `Amigo Online ${i} (Mock)`,
      photoURL: `https://avatars.githubusercontent.com/u/${i + 1000}?v=4`,
      personalMessage: `Testando MSN msg ${i}...`,
      status: 'online',
    })),
    ...Array.from({ length: 10 }).map((_, i) => ({
      uid: `mock-offline-${i}`,
      group: 'Outros Contatos',
      email: `offline${i}@dev.local`,
      displayName: `Amigo Offline ${i} (Mock)`,
      photoURL: `https://avatars.githubusercontent.com/u/${i + 2000}?v=4`,
      personalMessage: '',
      status: 'offline',
    }))
  ] : [];

  const computedContacts = contacts.map(c => ({
    ...c,
    status: presenceMap[c.uid]?.status || 'offline'
  }));

  const allContacts = [...computedContacts, ...devMockContacts];

  const filteredContacts = allContacts.filter(c => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return c.displayName.toLowerCase().includes(lowerSearch) || c.email.toLowerCase().includes(lowerSearch);
  });

  const onlineContacts = filteredContacts.filter(c => c.status !== 'offline');
  const offlineContacts = filteredContacts.filter(c => c.status === 'offline');

  return (
    <div className={styles.contactList}>
      {/* Header com info do usuário */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <img src={msnLogoTitle} alt="MSN Messenger" className={styles.logoTitle} />
          <span className={styles.headerText}>Messenger</span>
        </div>
        <div className={styles.userInfo}>
          <img
            src={photoURL || 'https://github.com/tupaymachado.png'}
            alt="Avatar"
            className={styles.avatar}
            referrerPolicy="no-referrer"
            onClick={() => setIsProfileModalOpen(true)}
            style={{ cursor: 'pointer' }}
            title="Alterar imagem ou nome"
          />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div className={styles.userDetails}>
              <span
                className={styles.userName}
                onClick={() => setIsProfileModalOpen(true)}
                style={{ cursor: 'pointer' }}
                title="Alterar imagem ou nome"
              >
                {displayName}
              </span>
              <select
                className={styles.userStatus}
                value={currentStatus}
                onChange={handleStatusChange}
              >
                <option value="online">(Online)</option>
                <option value="busy">(Ocupado)</option>
                <option value="away">(Ausente)</option>
                <option value="brb">(Já volto)</option>
              </select>
            </div>

            <div className={styles.personalMessageRow}>
              {currentTrack && (
                <span className={styles.musicBadge} title={`Tocando: ${currentTrack}`}>
                  <span className={styles.musicIcon}>🎵</span>
                  {/* Se houver música, podemos mostrar o nome da música ou só o ícone. Vamos por enquanto deixar as duas opções fluirem juntas */}
                </span>
              )}
              <input
                type="text"
                className={styles.personalMessageInput}
                placeholder="Digite uma mensagem pessoal"
                value={currentTrack ? `${currentTrack}` : personalMessage}
                onChange={(e) => {
                  if (!currentTrack) setPersonalMessage(e.target.value)
                }}
                onBlur={handlePersonalMessageChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                readOnly={!!currentTrack}
                title={currentTrack ? "Música em reprodução" : "Mensagem Pessoal"}
              />
            </div>
          </div>
        </div>
      </div>

      <MsnProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        uid={user.uid}
        currentName={displayName}
        currentPhoto={photoURL}
        currentMessage={personalMessage}
        onSave={handleUpdateProfile}
      />

      <MsnAddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        uid={user.uid}
      />

      <div
        className={styles.addContactArea}
        onClick={() => setIsAddContactOpen(true)}
      >
        <span className={styles.addContactIcon}><img src={msnFigureOnline} />+</span>
        <span>Adicionar um Contato</span>
      </div>

      {/* Lista de salas */}
      <div className={styles.roomList}>
        <div className={styles.groupHeader} style={{ marginTop: 8 }}>
          Salas de Bate-Papo ({onlineCount} online)
        </div>

        {ROOMS.map(room => (
          <button
            key={room.id}
            className={styles.roomItem}
            onClick={() => openWindow('msn-chat', { fileId: room.id })}
          >
            <span className={styles.roomEmoji}>{room.emoji}</span>
            <span className={styles.roomName}>{room.name}</span>
            {room.id === 'global' && onlineCount > 0 && (
              <span className={styles.onlineBadge}>{onlineCount}</span>
            )}
          </button>
        ))}

        <div className={styles.groupHeader}>
          Online ({onlineContacts.length})
        </div>

        {onlineContacts.map(contact => (
          <div
            key={contact.uid}
            className={styles.contactItem}
            title={contact.email}
            onDoubleClick={() => openWindow('msn-chat', { fileId: contact.uid })}
          >
            <img
              src={contact.photoURL || msnFigureOnline}
              className={styles.contactStatusIcon}
              alt={contact.status}
              referrerPolicy="no-referrer"
            />
            <div className={styles.contactInfo}>
              <span className={styles.contactName}>
                {contact.displayName} <span className={styles.contactStatusText}>({contact.status})</span>
              </span>
              {contact.personalMessage && (
                <span className={styles.contactMessage}> - {contact.personalMessage}</span>
              )}
            </div>
          </div>
        ))}

        <div className={styles.groupHeader}>
          Offline ({offlineContacts.length})
        </div>

        {offlineContacts.map(contact => (
          <div
            key={contact.uid}
            className={styles.contactItem}
            title={contact.email}
            onDoubleClick={() => openWindow('msn-chat', { fileId: contact.uid })}
          >
            <img
              src={msnFigureOffline}
              className={styles.contactStatusIcon}
              alt={contact.status}
            />
            <div className={styles.contactInfo}>
              <span className={styles.contactName}>
                {contact.displayName} <span className={styles.contactStatusText}>({contact.status})</span>
              </span>
              {contact.personalMessage && (
                <span className={styles.contactMessage}> - {contact.personalMessage}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Procurar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
