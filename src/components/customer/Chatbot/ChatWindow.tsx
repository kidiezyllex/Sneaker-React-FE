import { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiMessage, mdiClose, mdiSend, mdiLoading, mdiRobot, mdiAccount, mdiStar, mdiHistory, mdiMessageText } from '@mdi/js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatStore, Message } from '@/stores/useChatStore';
import { chatbotApi } from '@/api/chatbot';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ChatHistory } from './ChatHistory';

function ChatRating({ chatId }: { chatId: number }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const handleRate = async (value: number) => {
        try {
            await chatbotApi.rateChat(chatId, value);
            setRating(value);
            toast.success('Cảm ơn! Đánh giá của bạn đã được ghi nhận.');
        } catch (error) {
            console.error('Rating failed:', error);
            toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
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
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <Icon
                        path={mdiStar}
                        size={0.5}
                        className={`${star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

function ChatMessage({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={isUser ? 'bg-primary' : 'bg-secondary'}>
                    {isUser ? <Icon path={mdiAccount} size={0.6} /> : <Icon path={mdiRobot} size={0.6} />}
                </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-4 py-2 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), 'HH:mm', { locale: vi })}
                    </span>
                    {!isUser && message.chatId && <ChatRating chatId={message.chatId} />}
                </div>
            </div>
        </div>
    );
}

function ChatInput() {
    const [input, setInput] = useState('');
    const { addMessage, sessionId, isLoading, setLoading } = useChatStore();

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        addMessage('user', userMessage);
        setLoading(true);

        try {
            const response = await chatbotApi.sendMessage({
                message: userMessage,
                sessionId,
            });
            addMessage('assistant', response.data.response);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 flex gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                {isLoading ? (
                    <Icon path={mdiLoading} size={0.6} className="animate-spin" />
                ) : (
                    <Icon path={mdiSend} size={0.6} />
                )}
            </Button>
        </div>
    );
}

export function ChatButton() {
    const { isOpen, setOpen } = useChatStore();

    return (
        <Button
            onClick={() => setOpen(!isOpen)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform z-[9999] bg-primary text-primary-foreground"
        >
            {isOpen ? <Icon path={mdiClose} size={0.8} /> : <Icon path={mdiMessageText} size={0.8} />}
        </Button>
    );
}

export function ChatWindow() {
    const { isOpen, setOpen, messages } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    return (
        <Card className="fixed bottom-20 right-6 w-[400px] h-[calc(100vh-100px)] shadow-2xl z-[9999] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 text-primary">
                    <Icon path={mdiMessage} size={0.8} className="text-primary" />
                    <h4 className="font-semibold text-sm">Trợ lý AI hỗ trợ mua sắm</h4>
                </div>
                <button onClick={() => setOpen(false)}>
                    <Icon path={mdiClose} size={0.8} className="cursor-pointer" />
                </button>

            </div>

            {/* Tabs */}
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="text-muted-foreground data-[state=active]:text-primary">
                        <Icon path={mdiMessage} size={0.6} className="mr-2" />
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-muted-foreground data-[state=active]:text-primary">
                        <Icon path={mdiHistory} size={0.6} className="mr-2" />
                        Lịch sử
                    </TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Icon path={mdiMessage} size={2} className="mb-4 opacity-50" />
                                <p className="text-sm">Xin chào! Tôi có thể giúp gì cho bạn?</p>
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

