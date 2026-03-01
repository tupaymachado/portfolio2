import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { firestoreDB, db, auth } from '../../../config/firebase';
import { useWindowStore } from '../../../stores/useWindowStore';
import styles from './MsnParticipantList.module.css';
import msnFigureOnline from '../../../assets/icons/msn-online.webp';
import msnFigureOffline from '../../../assets/icons/msn-offline.webp';

interface UserParticipant {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
}

export default function MsnParticipantList() {
    const [participants, setParticipants] = useState<UserParticipant[]>([]);
    const [onlineUids, setOnlineUids] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const openWindow = useWindowStore(state => state.openWindow);
    const openContextMenu = useWindowStore(state => state.openContextMenu);
    const currentUser = auth.currentUser;

    // Fetch all users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(firestoreDB, 'users'), orderBy('displayName'));
                const querySnapshot = await getDocs(q);
                const usersList: UserParticipant[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Don't show ourselves in the list
                    if (doc.id !== currentUser?.uid) {
                        usersList.push({
                            uid: doc.id,
                            email: data.email,
                            displayName: data.displayName || data.email,
                            photoURL: data.photoURL || msnFigureOffline,
                        });
                    }
                });
                setParticipants(usersList);
            } catch (error) {
                console.error("Error fetching participants:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Listen to RTDB status node for presence
    useEffect(() => {
        const presenceRef = ref(db, 'presence');
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            const presences = snapshot.val() || {};
            const onlineSet = new Set<string>();

            Object.entries(presences).forEach(([uid, connection]: [string, any]) => {
                if (connection.status !== 'offline') {
                    onlineSet.add(uid);
                }
            });
            setOnlineUids(onlineSet);
        });

        return () => unsubscribe();
    }, []);

    const handleParticipantClick = (e: React.MouseEvent, participant: UserParticipant) => {
        e.preventDefault();
        e.stopPropagation();

        openContextMenu(e.clientX, e.clientY, [
            {
                label: `Enviar Mensagem para ${participant.displayName}`,
                onClick: () => {
                    openWindow('msn-chat', { fileId: participant.uid });
                },
            },
            {
                label: `Adicionar aos Contatos`,
                onClick: async () => {
                    if (!currentUser) return;
                    try {
                        import('firebase/firestore').then(({ doc, setDoc }) => {
                            setDoc(
                                doc(firestoreDB, `users/${currentUser.uid}/contacts/${participant.uid}`),
                                { group: 'Outros Contatos', addedAt: Date.now() }
                            );
                        });
                    } catch (err) {
                        console.error('Error adding contact:', err);
                    }
                },
                disabled: !currentUser,
            }
        ]);
    };

    if (isLoading) {
        return <div className={styles.loading}>Carregando participantes...</div>;
    }

    const sortedParticipants = [...participants].sort((a, b) => {
        const aOnline = onlineUids.has(a.uid);
        const bOnline = onlineUids.has(b.uid);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return a.displayName.localeCompare(b.displayName);
    });

    return (
        <>
            <div className={styles.participantList}>
                {sortedParticipants.map((participant) => {
                    const isOnline = onlineUids.has(participant.uid);

                    return (
                        <div
                            key={participant.uid}
                            className={`${styles.participantItem} ${!isOnline ? styles.offlineWrapper : ''}`}
                            onClick={(e) => handleParticipantClick(e, participant)}
                            title="Clique para ver opções"
                        >
                            <img
                                src={isOnline ? msnFigureOnline : msnFigureOffline}
                                className={styles.statusIcon}
                                alt={isOnline ? "Online" : "Offline"}
                            />
                            <img
                                src={participant.photoURL}
                                className={`${styles.avatarIcon} ${!isOnline ? styles.offlineAvatar : ''}`}
                                alt={participant.displayName}
                                referrerPolicy="no-referrer"
                            />
                            <div className={styles.participantInfo}>
                                <span className={styles.participantName}>{participant.displayName}</span>
                                <span className={styles.participantStatus}>
                                    {isOnline ? '(Online)' : '(Offline)'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
