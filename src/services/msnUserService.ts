import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { db } from '../config/firebase';

export interface MsnUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    personalMessage: string;
    status: 'online' | 'offline' | 'busy' | 'away' | 'brb';
    lastSeen: number | object;
}

export const msnUserService = {
    // Sync basic user info on login
    async syncUserOnLogin(
        uid: string,
        email: string,
        displayName: string,
        photoURL: string,
        initialStatus: string = 'online'
    ) {
        const userRef = ref(db, `users/${uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            // Create new user profile
            await set(userRef, {
                email,
                displayName,
                photoURL,
                personalMessage: '',
                status: initialStatus,
                lastSeen: serverTimestamp()
            });
        } else {
            // Update status and last seen
            await update(userRef, {
                status: initialStatus,
                lastSeen: serverTimestamp()
            });
        }
    },

    async updateUserProfile(uid: string, updates: Partial<MsnUser>) {
        const userRef = ref(db, `users/${uid}`);
        await update(userRef, updates);
    },

    // Update status (online, offline, etc)
    async updateStatus(uid: string, status: string) {
        const userRef = ref(db, `users/${uid}`);
        await update(userRef, {
            status,
            lastSeen: serverTimestamp()
        });
    },

    // Add contact to user's contact list
    async addContact(userUid: string, contactEmail: string) {
        // 1. Find user by email
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            throw new Error('Nenhum usuário encontrado na base de dados.');
        }

        const users = snapshot.val();
        let contactUid: string | null = null;

        for (const [uid, data] of Object.entries(users)) {
            if ((data as MsnUser).email === contactEmail) {
                contactUid = uid;
                break;
            }
        }

        if (!contactUid) {
            throw new Error('Usuário não encontrado com esse email.');
        }

        if (contactUid === userUid) {
            throw new Error('Você não pode adicionar a si mesmo.');
        }

        // 2. Add to user's contacts node
        const contactRef = ref(db, `contacts/${userUid}/${contactUid}`);
        await set(contactRef, {
            group: 'Outros Contatos', // Default group
            addedAt: serverTimestamp()
        });

        // Auto-accept by adding the user to the contact's list too
        const reverseContactRef = ref(db, `contacts/${contactUid}/${userUid}`);
        await set(reverseContactRef, {
            group: 'Outros Contatos',
            addedAt: serverTimestamp()
        });

        return contactUid;
    }
};
