import { sendGet, sendPost } from './axios';

// Types
export interface ChatMessage {
    id?: number;
    userMessage: string;
    botResponse: string;
    sessionId: string;
    rating?: number;
    feedback?: string;
    createdAt?: string;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    success: boolean;
    message: string;
    data: {
        response: string;
    };
}

export interface ChatHistoryResponse {
    success: boolean;
    message: string;
    data: {
        content: ChatMessage[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface ChatSessionResponse {
    success: boolean;
    message: string;
    data: {
        sessionId: string;
        messages: ChatMessage[];
    };
}

export interface RateChatResponse {
    success: boolean;
    data: ChatMessage;
}

// API Functions
export const chatbotApi = {
    // Send chat message
    sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
        return sendPost('chatbot/chat', request);
    },

    // Get chat history
    getHistory: async (page = 1, limit = 10): Promise<ChatHistoryResponse> => {
        return sendGet('chatbot/history', { page, limit });
    },

    // Search chat history
    searchHistory: async (
        query?: string,
        startDate?: string,
        endDate?: string,
        page = 1,
        limit = 10
    ): Promise<ChatHistoryResponse> => {
        return sendGet('chatbot/history/search', {
            query,
            startDate,
            endDate,
            page,
            limit,
        });
    },

    // Load chat session
    loadSession: async (sessionId: string): Promise<ChatSessionResponse> => {
        return sendGet(`chatbot/session/${sessionId}`);
    },

    // Rate chat
    rateChat: async (
        chatId: number,
        rating: number,
        feedback?: string
    ): Promise<RateChatResponse> => {
        return sendPost(`chatbot/history/${chatId}/rate`, {
            rating,
            feedback,
        });
    },
};
