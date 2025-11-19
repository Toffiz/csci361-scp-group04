'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { Message, Thread, User, UserRole, MessageType } from '@/types';

interface ChatThread extends Thread {
  messages: Message[];
}

const mockThreads: ChatThread[] = [
  {
    id: 'thread-1',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    assignedSalesId: 'sales@scp.kz',
    assignedSalesName: 'Bob Johnson',
    unreadCount: 0,
    escalated: false,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-15T14:30:00').toISOString(),
    archived: false,
    messages: [
      {
        id: 'msg-1',
        threadId: 'thread-1',
        senderId: 'consumer@scp.kz',
        senderName: 'Alice Brown',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'Hello! I have a question about your wheat flour. What is the protein content?',
        read: true,
        createdAt: new Date('2024-03-10T10:00:00').toISOString(),
      },
      {
        id: 'msg-2',
        threadId: 'thread-1',
        senderId: 'sales@scp.kz',
        senderName: 'Bob Johnson',
        senderRole: UserRole.SALES,
        type: MessageType.TEXT,
        content: 'Hello Alice! Thank you for your interest. Our premium wheat flour has 12% protein content, perfect for bread making.',
        read: true,
        createdAt: new Date('2024-03-10T10:15:00').toISOString(),
      },
      {
        id: 'msg-3',
        threadId: 'thread-1',
        senderId: 'consumer@scp.kz',
        senderName: 'Alice Brown',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'That sounds great! What about minimum order quantity?',
        read: true,
        createdAt: new Date('2024-03-15T14:20:00').toISOString(),
      },
      {
        id: 'msg-4',
        threadId: 'thread-1',
        senderId: 'sales@scp.kz',
        senderName: 'Bob Johnson',
        senderRole: UserRole.SALES,
        type: MessageType.TEXT,
        content: 'The minimum order quantity is 100 kg. We offer free delivery for orders above 500 kg!',
        read: true,
        createdAt: new Date('2024-03-15T14:30:00').toISOString(),
      },
    ],
  },
  {
    id: 'thread-2',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer2@scp.kz',
    consumerName: 'John Smith',
    assignedSalesId: 'admin@scp.kz',
    assignedSalesName: 'Jane Smith',
    unreadCount: 1,
    escalated: false,
    createdAt: new Date('2024-03-12').toISOString(),
    updatedAt: new Date('2024-03-14T09:45:00').toISOString(),
    archived: false,
    messages: [
      {
        id: 'msg-5',
        threadId: 'thread-2',
        senderId: 'consumer2@scp.kz',
        senderName: 'John Smith',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'Do you offer bulk discounts on sunflower oil?',
        read: true,
        createdAt: new Date('2024-03-12T15:30:00').toISOString(),
      },
      {
        id: 'msg-6',
        threadId: 'thread-2',
        senderId: 'admin@scp.kz',
        senderName: 'Jane Smith',
        senderRole: UserRole.ADMIN,
        type: MessageType.TEXT,
        content: 'Yes! We offer 5% discount for orders above 50L and 10% for orders above 100L.',
        read: true,
        createdAt: new Date('2024-03-14T09:45:00').toISOString(),
      },
    ],
  },
  {
    id: 'thread-3',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer3@scp.kz',
    consumerName: 'Maria Garcia',
    assignedSalesId: 'sales@scp.kz',
    assignedSalesName: 'Bob Johnson',
    unreadCount: 0,
    escalated: false,
    createdAt: new Date('2024-03-08').toISOString(),
    updatedAt: new Date('2024-03-13T11:20:00').toISOString(),
    archived: false,
    messages: [
      {
        id: 'msg-7',
        threadId: 'thread-3',
        senderId: 'consumer3@scp.kz',
        senderName: 'Maria Garcia',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'Can I get a sample of your rice before placing a large order?',
        read: true,
        createdAt: new Date('2024-03-08T13:00:00').toISOString(),
      },
      {
        id: 'msg-8',
        threadId: 'thread-3',
        senderId: 'sales@scp.kz',
        senderName: 'Bob Johnson',
        senderRole: UserRole.SALES,
        type: MessageType.TEXT,
        content: 'Absolutely! We can send you a 5kg sample. Please provide your delivery address.',
        read: true,
        createdAt: new Date('2024-03-08T13:15:00').toISOString(),
      },
      {
        id: 'msg-9',
        threadId: 'thread-3',
        senderId: 'consumer3@scp.kz',
        senderName: 'Maria Garcia',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: '123 Main St, Almaty, Kazakhstan. Thank you!',
        read: true,
        createdAt: new Date('2024-03-13T11:00:00').toISOString(),
      },
      {
        id: 'msg-10',
        threadId: 'thread-3',
        senderId: 'sales@scp.kz',
        senderName: 'Bob Johnson',
        senderRole: UserRole.SALES,
        type: MessageType.TEXT,
        content: 'Perfect! Your sample will be delivered within 2-3 business days.',
        read: true,
        createdAt: new Date('2024-03-13T11:20:00').toISOString(),
      },
    ],
  },
  {
    id: 'thread-4',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer@scp.kz',
    consumerName: 'Alice Brown',
    assignedSalesId: 'admin@scp.kz',
    assignedSalesName: 'Jane Smith',
    unreadCount: 2,
    escalated: false,
    createdAt: new Date('2024-03-14').toISOString(),
    updatedAt: new Date('2024-03-16T16:00:00').toISOString(),
    archived: false,
    messages: [
      {
        id: 'msg-11',
        threadId: 'thread-4',
        senderId: 'consumer@scp.kz',
        senderName: 'Alice Brown',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'Is it possible to schedule deliveries on a weekly basis?',
        read: true,
        createdAt: new Date('2024-03-14T10:00:00').toISOString(),
      },
      {
        id: 'msg-12',
        threadId: 'thread-4',
        senderId: 'admin@scp.kz',
        senderName: 'Jane Smith',
        senderRole: UserRole.ADMIN,
        type: MessageType.TEXT,
        content: 'Yes, we can set up recurring deliveries. What products and quantities are you interested in?',
        read: false,
        createdAt: new Date('2024-03-14T11:30:00').toISOString(),
      },
      {
        id: 'msg-13',
        threadId: 'thread-4',
        senderId: 'consumer@scp.kz',
        senderName: 'Alice Brown',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'I need 200kg wheat flour and 100L sunflower oil every Monday.',
        read: false,
        createdAt: new Date('2024-03-16T16:00:00').toISOString(),
      },
    ],
  },
  {
    id: 'thread-5',
    supplierId: 'supplier-1',
    supplierName: 'Almaty Grain Trading LLC',
    consumerId: 'consumer4@scp.kz',
    consumerName: 'David Kim',
    assignedSalesId: 'sales@scp.kz',
    assignedSalesName: 'Bob Johnson',
    unreadCount: 0,
    escalated: true,
    createdAt: new Date('2024-03-11').toISOString(),
    updatedAt: new Date('2024-03-15T17:45:00').toISOString(),
    archived: false,
    messages: [
      {
        id: 'msg-14',
        threadId: 'thread-5',
        senderId: 'consumer4@scp.kz',
        senderName: 'David Kim',
        senderRole: UserRole.CONSUMER,
        type: MessageType.TEXT,
        content: 'My last order arrived late. This is affecting my business operations.',
        read: true,
        createdAt: new Date('2024-03-11T09:00:00').toISOString(),
      },
      {
        id: 'msg-15',
        threadId: 'thread-5',
        senderId: 'sales@scp.kz',
        senderName: 'Bob Johnson',
        senderRole: UserRole.SALES,
        type: MessageType.TEXT,
        content: 'I sincerely apologize for the delay. Let me escalate this to management immediately.',
        read: true,
        createdAt: new Date('2024-03-11T09:30:00').toISOString(),
      },
      {
        id: 'msg-16',
        threadId: 'thread-5',
        senderId: 'admin@scp.kz',
        senderName: 'Jane Smith',
        senderRole: UserRole.ADMIN,
        type: MessageType.TEXT,
        content: 'Hello David, I am Jane from the management team. We will offer you a 15% discount on your next order as compensation.',
        read: true,
        createdAt: new Date('2024-03-15T17:45:00').toISOString(),
      },
    ],
  },
];

async function fetchThreads(): Promise<ChatThread[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('chatThreads');
  if (!stored) {
    // Initialize with mock data
    localStorage.setItem('chatThreads', JSON.stringify(mockThreads));
    return mockThreads;
  }
  return JSON.parse(stored);
}

async function sendMessage(threadId: string, content: string, sender: User): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const stored = localStorage.getItem('chatThreads');
  const threads = stored ? JSON.parse(stored) : mockThreads;
  
  const newMessage: Message = {
    id: 'msg-' + Date.now(),
    threadId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    type: MessageType.TEXT,
    content,
    read: false,
    createdAt: new Date().toISOString(),
  };
  
  const threadIndex = threads.findIndex((t: ChatThread) => t.id === threadId);
  if (threadIndex !== -1) {
    threads[threadIndex].messages.push(newMessage);
    threads[threadIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('chatThreads', JSON.stringify(threads));
  }
  
  return newMessage;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const { data: threads, isLoading } = useQuery({
    queryKey: ['chatThreads'],
    queryFn: fetchThreads,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      return sendMessage(threadId, content, user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      setMessageInput('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, selectedThread]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  const isConsumer = user.role === UserRole.CONSUMER;
  const userThreads = threads?.filter((t) =>
    isConsumer ? t.consumerId === user.id || t.consumerId === user.email : t.supplierId === user.companyId || t.supplierId === 'supplier-1'
  ) || [];

  const activeThread = userThreads.find((t) => t.id === selectedThread);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedThread) return;
    
    sendMessageMutation.mutate({
      threadId: selectedThread,
      content: messageInput.trim(),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground mt-2">
          Communication with partners
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Thread List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {userThreads.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              )}
              {userThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    selectedThread === thread.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium">
                      {isConsumer ? thread.supplierName : thread.consumerName}
                    </span>
                    {thread.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {thread.messages.length > 0 && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {thread.messages[thread.messages.length - 1].content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(thread.updatedAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2 flex flex-col">
          {!activeThread ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {isConsumer ? activeThread.supplierName : activeThread.consumerName}
                  </CardTitle>
                  {activeThread.escalated && (
                    <Badge variant="destructive">Escalated</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeThread.messages.map((message) => {
                  const isOwn = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <UserIcon className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {message.senderName}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
