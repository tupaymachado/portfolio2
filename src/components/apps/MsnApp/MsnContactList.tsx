import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../config/firebase';
import { useWebampStore } from '../../../stores/useWebampStore';
import { msnUserService } from '../../../services/msnUserService';
import MsnProfileModal from './MsnProfileModal';
import MsnAddContactModal from './MsnAddContactModal';
import styles from './MsnContactList.module.css';
import msnLogoTitle from '../../../assets/icons/msn-logo-title.webp'

interface MsnContactListProps {
  user: User;
  initialStatus: string;
  onOpenChat: (roomId: string) => void;
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

const ROOMS = [
  { id: 'global', name: 'Sala Global', emoji: '\uD83C\uDF0D' },
  { id: 'tupay', name: 'Falar com o Tupay', emoji: '\uD83D\uDCBC' },
];

export default function MsnContactList({ user, initialStatus, onOpenChat, onLogout }: MsnContactListProps) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [personalMessage, setPersonalMessage] = useState('');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactData[]>([]);

  // Obter música atual do Webamp
  const currentTrack = useWebampStore(state => state.currentTrack);

  // Escutar presença
  useEffect(() => {
    const presenceRef = ref(db, 'presence');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() as PresenceData | null;
      if (data) {
        const count = Object.values(data).filter(p => p.status === 'online').length;
        setOnlineCount(count);
      } else {
        setOnlineCount(0);
      }
    });

    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDisplayName(data.displayName || user.displayName || '');
        setPhotoURL(data.photoURL || user.photoURL || '');
        setPersonalMessage(data.personalMessage || '');
      }
    });

    // Listen to contacts
    const contactsRef = ref(db, `contacts/${user.uid}`);
    const unsubscribeContacts = onValue(contactsRef, async (snapshot) => {
      const contactsData = snapshot.val();
      if (!contactsData) {
        setContacts([]);
        return;
      }

      // We need to fetch each contact's profile info from users/
      const loadedContacts: ContactData[] = [];
      const { get } = await import('firebase/database'); // Lazy load get just for this or move it up

      for (const [contactUid, contactMeta] of Object.entries(contactsData)) {
        const uRef = ref(db, `users/${contactUid}`);
        const uSnap = await get(uRef);
        if (uSnap.exists()) {
          const uData = uSnap.val();
          loadedContacts.push({
            uid: contactUid,
            group: (contactMeta as any)?.group || 'Outros Contatos',
            email: uData.email,
            displayName: uData.displayName,
            photoURL: uData.photoURL,
            personalMessage: uData.personalMessage,
            status: uData.status || 'offline',
          });
        }
      }
      setContacts(loadedContacts);
    });

    return () => {
      unsubscribe();
      unsubscribeUser();
      unsubscribeContacts();
    };
  }, [user.uid, user.displayName, user.photoURL]);

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
    const newMessage = e.target.value;
    if (newMessage !== personalMessage) {
      await msnUserService.updateUserProfile(user.uid, {
        personalMessage: newMessage
      });
    }
  };

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
        <span className={styles.addContactIcon}>👤+</span>
        <span>Adicionar um Contato</span>
      </div>

      {/* Lista de salas */}
      <div className={styles.roomList}>
        <div className={styles.groupHeader}>
          Contatos ({contacts.filter(c => c.status !== 'offline').length}/{contacts.length})
        </div>

        {contacts.map(contact => (
          <div key={contact.uid} className={styles.contactItem} title={contact.email}>
            <div className={`${styles.contactStatus} ${styles[contact.status]}`}></div>
            <div className={styles.contactInfo}>
              <span className={styles.contactName}>{contact.displayName}</span>
              {contact.personalMessage && (
                <span className={styles.contactMessage}> - {contact.personalMessage}</span>
              )}
            </div>
          </div>
        ))}

        <div className={styles.groupHeader} style={{ marginTop: 8 }}>
          Salas de Bate-Papo ({onlineCount} online)
        </div>

        {ROOMS.map(room => (
          <button
            key={room.id}
            className={styles.roomItem}
            onClick={() => onOpenChat(room.id)}
          >
            <span className={styles.roomEmoji}>{room.emoji}</span>
            <span className={styles.roomName}>{room.name}</span>
            {room.id === 'global' && onlineCount > 0 && (
              <span className={styles.onlineBadge}>{onlineCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={onLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
