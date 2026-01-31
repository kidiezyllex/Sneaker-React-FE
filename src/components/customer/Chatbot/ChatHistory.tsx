import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatbotApi, ChatMessage as ApiChatMessage } from '@/api/chatbot';
import { useChatStore, Message } from '@/stores/useChatStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Icon from '@mdi/react';
import { mdiMessage, mdiLoading, mdiMagnify } from '@mdi/js';

function ChatHistorySearch({ onSearch }: { onSearch: (results: ApiChatMessage[]) => void }) {
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
                <Icon path={mdiMagnify} size={0.8} />
            </Button>
        </div>
    );
}

export function ChatHistory() {
    const [history, setHistory] = useState<ApiChatMessage[]>([]);
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
            const messages: Message[] = response.data.messages.flatMap((msg) => [
                {
                    id: msg.id?.toString() || '',
                    role: 'user' as const,
                    content: msg.userMessage,
                    timestamp: new Date(msg.createdAt || ''),
                    chatId: msg.id,
                },
                {
                    id: `${msg.id}-bot` || '',
                    role: 'assistant' as const,
                    content: msg.botResponse,
                    timestamp: new Date(msg.createdAt || ''),
                    chatId: msg.id,
                },
            ]);

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
                        <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Icon path={mdiMessage} size={2} className="mb-4 opacity-50" />
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
                                <p className="text-sm font-medium line-clamp-1">{chat.userMessage}</p>
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
