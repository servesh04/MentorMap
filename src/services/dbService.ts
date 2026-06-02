export interface LocalChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface LocalChatRecord {
    nodeId: string;
    messages: LocalChatMessage[];
    updatedAt: number;
}

const DB_NAME = "mentormap_offline_chats";
const DB_VERSION = 1;
const STORE_NAME = "messages";

/**
 * Open or initialize the IndexedDB connection.
 */
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error("IndexedDB is only available in browser environments."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "nodeId" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Save chat history logs for a specific roadmap node/module.
 */
export const saveChatHistory = async (nodeId: string, messages: LocalChatMessage[]): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            const record: LocalChatRecord = {
                nodeId,
                messages,
                updatedAt: Date.now()
            };

            const request = store.put(record);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error(`Failed to save offline chat history for ${nodeId}:`, e);
    }
};

/**
 * Load offline chat history logs for a specific roadmap node/module.
 */
export const getChatHistory = async (nodeId: string): Promise<LocalChatMessage[]> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(nodeId);

            request.onsuccess = () => {
                const record = request.result as LocalChatRecord | undefined;
                resolve(record ? record.messages : []);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error(`Failed to retrieve offline chat history for ${nodeId}:`, e);
        return [];
    }
};

/**
 * Delete chat logs for a specific node/module.
 */
export const deleteChatHistory = async (nodeId: string): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(nodeId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error(`Failed to delete chat history for ${nodeId}:`, e);
    }
};
