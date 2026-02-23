import { ref as rtdbRef, update as rtdbUpdate, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp as firestoreServerTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db, firestoreDB } from '../config/firebase';

export interface MsnUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    personalMessage: string;
    status: 'online' | 'offline' | 'busy' | 'away' | 'brb';
    lastSeen: any;
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
        // 1. SYNC FIRESTORE PROFILE
        const userDocRef = doc(firestoreDB, `users/${uid}`);
        const snapshot = await getDoc(userDocRef);

        if (!snapshot.exists()) {
            await setDoc(userDocRef, {
                email,
                displayName,
                photoURL,
                personalMessage: '',
                status: initialStatus,
                lastSeen: firestoreServerTimestamp()
            });

            // Automatically add Tupay as a contact for new users
            if (email !== 'tupay.machado@gmail.com') {
                try {
                    await msnUserService.addContact(uid, 'tupay.machado@gmail.com');
                } catch (e) {
                    console.warn("Não foi possível adicionar Tupay automaticamente:", e);
                }
            }
        } else {
            await updateDoc(userDocRef, {
                status: initialStatus,
                lastSeen: firestoreServerTimestamp()
            });
        }

        // 2. SYNC RTDB PRESENCE (for backward compatibility if needed, though MsnChatWindow handles it. Let's do it here too just in case)
        const presenceRef = rtdbRef(db, `presence/${uid}`);
        await rtdbUpdate(presenceRef, {
            name: displayName,
            photoURL,
            status: initialStatus,
            lastSeen: rtdbServerTimestamp()
        });
    },

    async updateUserProfile(uid: string, updates: Partial<MsnUser>) {
        const userDocRef = doc(firestoreDB, `users/${uid}`);
        await updateDoc(userDocRef, updates);

        // Also update RTDB if name or photoURL changed, to keep presence in sync
        if (updates.displayName || updates.photoURL) {
            const presenceRef = rtdbRef(db, `presence/${uid}`);
            const rtdbUpdates: any = {};
            if (updates.displayName) rtdbUpdates.name = updates.displayName;
            if (updates.photoURL) rtdbUpdates.photoURL = updates.photoURL;
            await rtdbUpdate(presenceRef, rtdbUpdates);
        }
    },

    // Update status (online, offline, etc)
    async updateStatus(uid: string, status: string) {
        // Update Firestore
        const userDocRef = doc(firestoreDB, `users/${uid}`);
        await updateDoc(userDocRef, {
            status,
            lastSeen: firestoreServerTimestamp()
        });

        // Update RTDB Presence
        const presenceRef = rtdbRef(db, `presence/${uid}`);
        await rtdbUpdate(presenceRef, {
            status,
            lastSeen: rtdbServerTimestamp()
        });
    },

    // Add contact to user's contact list
    async addContact(userUid: string, contactEmail: string) {
        // 1. Find user by email in Firestore
        const usersRef = collection(firestoreDB, 'users');
        const q = query(usersRef, where('email', '==', contactEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Usuário não encontrado com esse email.');
        }

        let contactUid: string | null = null;
        querySnapshot.forEach((doc) => {
            contactUid = doc.id;
        });

        if (!contactUid) {
            throw new Error('Usuário não encontrado com esse email.');
        }

        if (contactUid === userUid) {
            throw new Error('Você não pode adicionar a si mesmo.');
        }

        // 2. Add to user's contacts subcollection
        const contactDocRef = doc(firestoreDB, `users/${userUid}/contacts/${contactUid}`);
        await setDoc(contactDocRef, {
            group: 'Outros Contatos',
            addedAt: firestoreServerTimestamp()
        });

        // Auto-accept by adding the user to the contact's list too
        const reverseContactDocRef = doc(firestoreDB, `users/${contactUid}/contacts/${userUid}`);
        await setDoc(reverseContactDocRef, {
            group: 'Outros Contatos',
            addedAt: firestoreServerTimestamp()
        });

        return contactUid;
    }
};
