/**
 * Helper para traduzir nomes de itens do FileSystem.
 * - IDs do sistema (predefinidos) são traduzidos via i18n
 * - IDs de usuário (criados pelo usuário) retornam o nome como está armazenado
 */

// IDs do sistema que podem ser traduzidos
const SYSTEM_ITEM_IDS = new Set([
    'root', 'desktop', 'recycle-bin',
    'my-documents', 'my-pictures', 'my-music', 'my-videos',
    'my-projects',
    'shortcut-1', 'shortcut-2', 'shortcut-3', 'shortcut-4',
    'url-portfolio', 'url-projeto-2', 'url-projeto-3'
]);

/**
 * Retorna o nome do item, traduzido se for do sistema
 * @param itemId - ID único do item
 * @param itemName - Nome armazenado do item
 * @param t - Função de tradução (i18next)
 * @returns Nome do item (traduzido se sistema, como está se usuário)
 */
export function getDisplayName(
    itemId: string,
    itemName: string,
    t: (key: string, options?: any) => string
): string {
    if (SYSTEM_ITEM_IDS.has(itemId)) {
        return t(`fileSystem.${itemId}`, { defaultValue: itemName });
    }
    // Item do usuário: retorna como está
    return itemName;
}
