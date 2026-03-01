import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { firestoreDB, db } from '../../../config/firebase';
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

    // Fetch all users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(firestoreDB, 'users'), orderBy('displayName'));
                const querySnapshot = await getDocs(q);
                const usersList: UserParticipant[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    usersList.push({
                        uid: doc.id,
                        email: data.email,
                        displayName: data.displayName || data.email,
                        photoURL: data.photoURL || msnFigureOffline,
                    });
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
                // Ignore disconnected / offline statuses
                if (connection.status !== 'offline') {
                    onlineSet.add(uid);
                }
            });
            setOnlineUids(onlineSet);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Carregando participantes...</div>;
    }

    // Sort participants so online users are grouped first
    const sortedParticipants = [...participants].sort((a, b) => {
        const aOnline = onlineUids.has(a.uid);
        const bOnline = onlineUids.has(b.uid);
        // Sort online users first
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        // Alphabetical within the group
        return a.displayName.localeCompare(b.displayName);
    });

    return (
        <div className={styles.participantList}>
            {sortedParticipants.map((user) => {
                const isOnline = onlineUids.has(user.uid);

                return (
                    <div key={user.uid} className={`${styles.participantItem} ${!isOnline ? styles.offlineWrapper : ''}`}>
                        <img
                            src={isOnline ? msnFigureOnline : msnFigureOffline}
                            className={styles.statusIcon}
                            alt={isOnline ? "Online" : "Offline"}
                        />
                        <img
                            src={user.photoURL}
                            className={`${styles.avatarIcon} ${!isOnline ? styles.offlineAvatar : ''}`}
                            alt={user.displayName}
                            referrerPolicy="no-referrer"
                        />
                        <div className={styles.participantInfo}>
                            <span className={styles.participantName}>{user.displayName}</span>
                            <span className={styles.participantStatus}>
                                {isOnline ? '(Online)' : '(Offline)'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
