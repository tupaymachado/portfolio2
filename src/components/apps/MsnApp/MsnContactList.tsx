import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../config/firebase';
import styles from './MsnContactList.module.css';

interface MsnContactListProps {
  user: User;
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

const ROOMS = [
  { id: 'global', name: 'Sala Global', emoji: '\uD83C\uDF0D' },
  { id: 'tupay', name: 'Falar com o Tupay', emoji: '\uD83D\uDCBC' },
];

export default function MsnContactList({ user, onOpenChat, onLogout }: MsnContactListProps) {
  const [onlineCount, setOnlineCount] = useState(0);

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
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.contactList}>
      {/* Header com info do usuário */}
      <div className={styles.header}>
        <div className={styles.headerGradient}>
          <div className={styles.userInfo}>
            <img
              src={user.photoURL || ''}
              alt="Avatar"
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.displayName}</span>
              <span className={styles.userStatus}>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de salas */}
      <div className={styles.roomList}>
        <div className={styles.groupHeader}>
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
