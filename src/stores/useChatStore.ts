import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate UUID v4
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    chatId?: number;
}

interface ChatStore {
    // State
    messages: Message[];
    sessionId: string;
    isLoading: boolean;
    isOpen: boolean;
    activeTab: 'chat' | 'history';

    // Actions
    addMessage: (role: 'user' | 'assistant', content: string, chatId?: number) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setOpen: (open: boolean) => void;
    loadSession: (messages: Message[], sessionId: string) => void;
    createNewSession: () => void;
    setActiveTab: (tab: 'chat' | 'history') => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            // Initial state
            messages: [],
            sessionId: generateUUID(),
            isLoading: false,
            isOpen: false,
            activeTab: 'chat',

            // Actions
            addMessage: (role, content, chatId) =>
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: generateUUID(),
                            role,
                            content,
                            timestamp: new Date(),
                            chatId,
                        },
                    ],
                })),

            clearMessages: () =>
                set({
                    messages: [],
                    sessionId: generateUUID(),
                }),

            setLoading: (loading) => set({ isLoading: loading }),

            setOpen: (open) => set({ isOpen: open }),

            loadSession: (messages, sessionId) =>
                set({
                    messages,
                    sessionId,
                    activeTab: 'chat',
                }),

            createNewSession: () =>
                set({
                    messages: [],
                    sessionId: generateUUID(),
                    activeTab: 'chat',
                }),

            setActiveTab: (tab) => set({ activeTab: tab }),
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                messages: state.messages,
                sessionId: state.sessionId,
            }),
        }
    )
);
