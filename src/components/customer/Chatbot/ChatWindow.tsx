import { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiMessageTextFastOutline, mdiClose, mdiSend, mdiLoading, mdiRobot, mdiAccount, mdiStar, mdiHistory, mdiRobotHappyOutline, mdiRobotLoveOutline, mdiAccountSupervisorCircleOutline } from '@mdi/js';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useChatStore, Message } from '@/stores/useChatStore';
import { chatbotApi } from '@/api/chatbot';
import { useUser } from '@/context/useUserContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ChatHistory } from './ChatHistory';

function TypingIndicator() {
    return (
        <div className="flex gap-3 flex-row">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=bot" />
            </Avatar>

            <div className="flex flex-col gap-1 max-w-[75%] items-start">
                <div className="rounded-md px-4 py-2 bg-muted">
                    <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    const { profile } = useUser();

    const getAvatarUrl = () => {
        if (isUser) {
            const userId = profile?.data?.id || 'user';
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=bot`;
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={getAvatarUrl()} />
            </Avatar>

            <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-md px-4 py-2 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
                <Icon path={mdiSend} size={0.8} />
            </Button>
        </div>
    );
}


export function ChatWindow() {
    const { isOpen, setOpen, messages, isLoading, activeTab, setActiveTab } = useChatStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent className="flex flex-col h-full w-full sm:max-w-[450px] p-0 gap-0 overflow-hidden">
                <SheetHeader className="p-3 px-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-2 text-primary">
                        <Icon path={mdiRobotHappyOutline} size={0.8} className="text-primary" />
                        <SheetTitle className="text-primary font-semibold text-base">
                            Trợ lý AI hỗ trợ mua sắm
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as 'chat' | 'history')}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <TabsList className="grid w-full grid-cols-2 flex-shrink-0 rounded-none border-b h-auto p-0">
                            <TabsTrigger
                                value="chat"
                                className="text-muted-foreground data-[state=active]:text-primary py-3 border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all"
                            >
                                <Icon path={mdiMessageTextFastOutline} size={0.8} className="mr-2" />
                                Chat
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="text-muted-foreground data-[state=active]:text-primary py-3 border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all"
                            >
                                <Icon path={mdiHistory} size={0.8} className="mr-2" />
                                Lịch sử
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden bg-background">
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                                        <Icon path={mdiMessageTextFastOutline} size={2} className="mb-4 opacity-50" />
                                        <p className="text-sm italic">Chào mừng bạn! Tôi có thể giúp gì cho bạn hôm nay?</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <ChatMessage key={message.id} message={message} />
                                        ))}
                                        {isLoading && <TypingIndicator />}
                                    </div>
                                )}
                            </ScrollArea>
                            <Separator className="flex-shrink-0" />
                            <div className="flex-shrink-0 bg-background">
                                <ChatInput />
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="flex-1 mt-0 overflow-hidden bg-background">
                            <ChatHistory />
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}

