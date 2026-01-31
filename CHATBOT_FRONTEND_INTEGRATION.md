# 🤖 AI Chatbot - Frontend Integration Guide

> Hướng dẫn tích hợp Chatbot AI với React, ShadCN UI, và TailwindCSS

---

## 📋 Mục lục

1. [Tổng quan Backend](#tổng-quan-backend)
2. [Setup Frontend](#setup-frontend)
3. [API Integration](#api-integration)
4. [Components](#components)
5. [State Management](#state-management)
6. [UI Implementation](#ui-implementation)
7. [Testing](#testing)

---

## 🎯 Tổng quan Backend

### API Endpoints đã có sẵn

| Endpoint | Method | Mô tả | Auth |
|----------|--------|-------|------|
| `/api/chatbot/chat` | POST | Gửi tin nhắn chat | ✅ |
| `/api/chatbot/history` | GET | Lấy lịch sử chat | ✅ |
| `/api/chatbot/history/search` | GET | Tìm kiếm lịch sử | ✅ |
| `/api/chatbot/session/{id}` | GET | Load session chat | ✅ |
| `/api/chatbot/history/{id}/rate` | POST | Đánh giá chat | ✅ |

### Training Data Categories
- **SIZE_GUIDE**: Hướng dẫn chọn size
- **PRODUCT_INFO**: Thông tin sản phẩm
- **ORDER_GUIDE**: Hướng dẫn đặt hàng
- **RETURN_POLICY**: Chính sách đổi trả
- **PROMOTION**: Khuyến mãi
- **WARRANTY**: Bảo hành
src/
├── components/
│   ├── chatbot/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatHistory.tsx
│   │   ├── ChatHistorySearch.tsx
│   │   ├── ChatRating.tsx
│   │   └── ChatButton.tsx
│   └── ui/ (ShadCN components)
├── lib/
│   ├── api/
│   │   └── chatbot.ts
│   └── store/
│       └── chatStore.ts
├── types/
│   └── chatbot.ts
└── hooks/
    └── useChatbot.ts
```

---

## 🔌 API Integration

### 1. API Client Setup

**`src/lib/api/chatbot.ts`**

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// API Functions
export const chatbotApi = {
  // Send chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post('/api/chatbot/chat', request);
    return response.data;
  },

  // Get chat history
  getHistory: async (page = 1, limit = 10): Promise<ChatHistoryResponse> => {
    const response = await apiClient.get('/api/chatbot/history', {
      params: { page, limit },
    });
    return response.data;
  },

  // Search chat history
  searchHistory: async (
    query?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 10
  ): Promise<ChatHistoryResponse> => {
    const response = await apiClient.get('/api/chatbot/history/search', {
      params: { query, startDate, endDate, page, limit },
    });
    return response.data;
  },

  // Load chat session
  loadSession: async (sessionId: string): Promise<ChatSessionResponse> => {
    const response = await apiClient.get(`/api/chatbot/session/${sessionId}`);
    return response.data;
  },

  // Rate chat
  rateChat: async (
    chatId: number,
    rating: number,
    feedback?: string
  ): Promise<{ success: boolean; data: ChatMessage }> => {
    const response = await apiClient.post(`/api/chatbot/history/${chatId}/rate`, {
      rating,
      feedback,
    });
    return response.data;
  },
};
```

---

## 🗂️ State Management

### Zustand Store

**`src/lib/store/chatStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface Message {
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
  
  // Actions
  addMessage: (role: 'user' | 'assistant', content: string, chatId?: number) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  loadSession: (messages: Message[], sessionId: string) => void;
  createNewSession: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      sessionId: uuidv4(),
      isLoading: false,
      isOpen: false,

      // Actions
      addMessage: (role, content, chatId) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: uuidv4(),
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
          sessionId: uuidv4(),
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setOpen: (open) => set({ isOpen: open }),

      loadSession: (messages, sessionId) =>
        set({
          messages,
          sessionId,
        }),

      createNewSession: () =>
        set({
          messages: [],
          sessionId: uuidv4(),
        }),
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
```

---

## 🎨 Components

### 1. Chat Button (Floating Button)

**`src/components/chatbot/ChatButton.tsx`**

```tsx
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store/chatStore';

export function ChatButton() {
  const { isOpen, setOpen } = useChatStore();

  return (
    <Button
      onClick={() => setOpen(!isOpen)}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      size="icon"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
}
```

### 2. Chat Window

**`src/components/chatbot/ChatWindow.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatStore } from '@/lib/store/chatStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHistory } from './ChatHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatWindow() {
  const { isOpen, setOpen, messages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">
                  Xin chào! Tôi có thể giúp gì cho bạn?
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
          </ScrollArea>
          <Separator />
          <ChatInput />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 mt-0">
          <ChatHistory />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
```

### 3. Chat Message

**`src/components/chatbot/ChatMessage.tsx`**

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChatRating } from './ChatRating';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chatId?: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={isUser ? 'bg-primary' : 'bg-secondary'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'HH:mm', { locale: vi })}
          </span>
          
          {!isUser && message.chatId && (
            <ChatRating chatId={message.chatId} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4. Chat Input

**`src/components/chatbot/ChatInput.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '@/lib/store/chatStore';
import { chatbotApi } from '@/lib/api/chatbot';
import { useToast } from '@/components/ui/use-toast';

export function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, sessionId, isLoading, setLoading } = useChatStore();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage('user', userMessage);
    setLoading(true);

    try {
      // Call API
      const response = await chatbotApi.sendMessage({
        message: userMessage,
        sessionId,
      });

      // Add bot response
      addMessage('assistant', response.data.response);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập tin nhắn..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        size="icon"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

### 5. Chat History

**`src/components/chatbot/ChatHistory.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { chatbotApi, ChatMessage } from '@/lib/api/chatbot';
import { useChatStore } from '@/lib/store/chatStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle, Loader2 } from 'lucide-react';
import { ChatHistorySearch } from './ChatHistorySearch';

export function ChatHistory() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { loadSession, setOpen } = useChatStore();

  const fetchHistory = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await chatbotApi.getHistory(currentPage, 10);
      setHistory(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLoadSession = async (sessionId: string) => {
    try {
      const response = await chatbotApi.loadSession(sessionId);
      const messages = response.data.messages.map((msg) => ({
        id: msg.id?.toString() || '',
        role: 'user' as const,
        content: msg.userMessage,
        timestamp: new Date(msg.createdAt || ''),
        chatId: msg.id,
      }));
      
      loadSession(messages, sessionId);
      setOpen(true);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHistorySearch onSearch={(results) => setHistory(results)} />
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Chưa có lịch sử chat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((chat) => (
              <div
                key={chat.id}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleLoadSession(chat.sessionId)}
              >
                <p className="text-sm font-medium line-clamp-1">
                  {chat.userMessage}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {chat.botResponse}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(chat.createdAt || ''), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHistory(page - 1)}
            disabled={page === 1 || loading}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHistory(page + 1)}
            disabled={page === totalPages || loading}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 6. Chat History Search

**`src/components/chatbot/ChatHistorySearch.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { chatbotApi, ChatMessage } from '@/lib/api/chatbot';

interface ChatHistorySearchProps {
  onSearch: (results: ChatMessage[]) => void;
}

export function ChatHistorySearch({ onSearch }: ChatHistorySearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await chatbotApi.searchHistory(query);
      onSearch(response.data.content);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Tìm kiếm..."
        className="flex-1"
      />
      <Button
        onClick={handleSearch}
        disabled={!query.trim() || loading}
        size="icon"
        variant="outline"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### 7. Chat Rating

**`src/components/chatbot/ChatRating.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { chatbotApi } from '@/lib/api/chatbot';
import { useToast } from '@/components/ui/use-toast';

interface ChatRatingProps {
  chatId: number;
}

export function ChatRating({ chatId }: ChatRatingProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { toast } = useToast();

  const handleRate = async (value: number) => {
    try {
      await chatbotApi.rateChat(chatId, value);
      setRating(value);
      toast({
        title: 'Cảm ơn!',
        description: 'Đánh giá của bạn đã được ghi nhận.',
      });
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-3 w-3 ${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
```

---

## 🎨 Main App Integration

**`src/app/layout.tsx` hoặc `src/App.tsx`**

```tsx
import { ChatButton } from '@/components/chatbot/ChatButton';
import { ChatWindow } from '@/components/chatbot/ChatWindow';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        
        {/* Chatbot */}
        <ChatButton />
        <ChatWindow />
        
        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## 🧪 Testing

### 1. Test Chat Flow

```tsx
// Test component
import { ChatWindow } from '@/components/chatbot/ChatWindow';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Test Chatbot</h1>
      <ChatWindow />
    </div>
  );
}
```

### 2. Test API Connection

```typescript
// Test API
import { chatbotApi } from '@/lib/api/chatbot';

async function testChat() {
  try {
    const response = await chatbotApi.sendMessage({
      message: 'Xin chào',
      sessionId: 'test-session',
    });
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🎨 Styling Tips

### Custom Theme Colors

**`tailwind.config.js`**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(222.2 47.4% 11.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96.1%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
      },
    },
  },
};
```

### Animations

```css
/* Add to globals.css */
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chat-window {
  animation: slide-up 0.3s ease-out;
}
```

---

## 📱 Responsive Design

```tsx
// Mobile-friendly chat window
<Card className="fixed bottom-0 right-0 w-full h-full md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] md:rounded-lg">
  {/* Content */}
</Card>
```

---

## 🔐 Environment Variables

**`.env.local`**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## ✅ Checklist

### Setup
- [ ] Install dependencies
- [ ] Setup ShadCN UI
- [ ] Create folder structure
- [ ] Configure environment variables

### Implementation
- [ ] Create API client
- [ ] Setup Zustand store
- [ ] Implement ChatButton
- [ ] Implement ChatWindow
- [ ] Implement ChatMessage
- [ ] Implement ChatInput
- [ ] Implement ChatHistory
- [ ] Implement ChatHistorySearch
- [ ] Implement ChatRating

### Testing
- [ ] Test chat flow
- [ ] Test history loading
- [ ] Test search functionality
- [ ] Test rating system
- [ ] Test responsive design
- [ ] Test error handling

### Production
- [ ] Update API URL
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Optimize performance
- [ ] Add analytics

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your API URL

# 3. Run development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📚 Resources

- **ShadCN UI**: https://ui.shadcn.com/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **Lucide Icons**: https://lucide.dev/
- **Date-fns**: https://date-fns.org/

---

## 🆘 Troubleshooting

### CORS Error
```typescript
// Add to backend application.properties
cors.allowed-origins=http://localhost:3000
```

### JWT Token Not Sent
```typescript
// Check localStorage
console.log(localStorage.getItem('accessToken'));

// Verify axios interceptor
apiClient.interceptors.request.use((config) => {
  console.log('Headers:', config.headers);
  return config;
});
```

### Chat Not Loading
```typescript
// Check API response
const response = await chatbotApi.sendMessage({...});
console.log('API Response:', response);
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-31  
**Status:** ✅ Ready to Use

**Happy Coding! 🚀**
