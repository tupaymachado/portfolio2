import { useEffect, useRef } from 'react';
import { useWindowStore, useWindowContext } from '../../../stores/useWindowStore';
import ErrorDialog from '../../ErrorDialog/ErrorDialog';
import { useShallow } from 'zustand/shallow';
import errorSound from '../../../assets/sounds/error.mp3';

export default function ErrorApp() {
    const { instanceId } = useWindowContext();
    const closeWindow = useWindowStore(state => state.closeWindow);
    const audioPlayedRef = useRef(false);

    // Recupera o initialContext passado pela chamada openWindow
    const initialContext = useWindowStore(
        useShallow(state => state.openWindows.find(w => w.id === instanceId)?.initialContext)
    );

    useEffect(() => {
        // Toca o som de erro ao montar (somente uma vez, ignorando o double mount do StrictMode)
        if (!audioPlayedRef.current) {
            audioPlayedRef.current = true;
            try {
                const audio = new Audio(errorSound);
                audio.play().catch(e => console.log('Áudio bloqueado pelo navegador:', e));
            } catch (e) {
                console.error('Falha ao tocar som de erro:', e);
            }
        }
    }, []);

    const title = initialContext?.title || 'Erro';
    const message = initialContext?.message || 'A funcionalidade solicitada não está implementada no momento.';

    return (
        <ErrorDialog
            isOpen={true}
            title={title}
            message={message}
            onClose={() => closeWindow(instanceId)}
        />
    );
}
