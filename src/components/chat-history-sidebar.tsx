"use client";

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSession } from '@/lib/indexeddb';
import { cn } from '@/lib/utils';
import {
    History,
    Menu,
    MessageSquare,
    Plus,
    Trash2,
    TrashIcon,
    X
} from 'lucide-react';
import { useState } from 'react';

interface ChatHistorySidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    isLoading: boolean;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onNewChat: () => void;
    onClearAll: () => void;
}

export function ChatHistorySidebar({
    sessions,
    currentSessionId,
    isLoading,
    onSelectSession,
    onDeleteSession,
    onNewChat,
    onClearAll,
}: ChatHistorySidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Today';
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingSessionId(sessionId);
        await onDeleteSession(sessionId);
        setDeletingSessionId(null);
    };

    const handleSelectSession = (sessionId: string) => {
        onSelectSession(sessionId);
        setIsOpen(false); // Close sidebar on mobile after selection
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                <h1 className="text-sm font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
                    AI Mental Health Assistant
                </h1>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewChat}
                    className="p-2"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    // Mobile: fixed sidebar that slides in
                    "fixed left-0 h-full w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out top-[60px]",
                    // Desktop: relative positioned sidebar that's always visible
                    "md:relative md:top-0 md:translate-x-0 md:z-auto md:h-full md:w-80",
                    // Mobile slide state
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Desktop Header - Hidden on mobile since we have the mobile header bar */}
                    <div className="p-4 border-b border-gray-200 hidden md:block">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <History className="h-5 w-5 mr-2" />
                                Chat History
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onNewChat}
                                className="flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New
                            </Button>
                        </div>

                        {sessions.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onClearAll}
                                className="w-full flex items-center"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    {/* Mobile Header - Visible only on mobile when sidebar is open */}
                    <div className="p-4 border-b border-gray-200 md:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <History className="h-5 w-5 mr-2" />
                                Chat History
                            </h2>
                        </div>

                        {sessions.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onClearAll}
                                className="w-full flex items-center"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    {/* Sessions List */}
                    <ScrollArea className="flex-1">
                        <div className="p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-gray-500">Loading...</div>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                                    <p className="text-sm">No chat history yet</p>
                                    <p className="text-xs mt-1">Start a conversation to see it here</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={cn(
                                                "group relative p-3 rounded-lg cursor-pointer transition-colors",
                                                "hover:bg-gray-50",
                                                currentSessionId === session.id ? "bg-blue-50 border border-blue-200" : "border border-transparent"
                                            )}
                                            onClick={() => handleSelectSession(session.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn(
                                                        "text-sm font-medium truncate",
                                                        currentSessionId === session.id ? "text-blue-800" : "text-gray-800"
                                                    )}>
                                                        {session.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(session.updatedAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {session.messages.length} messages
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 h-6 w-6",
                                                        deletingSessionId === session.id && "opacity-100"
                                                    )}
                                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                                    disabled={deletingSessionId === session.id}
                                                >
                                                    {deletingSessionId === session.id ? (
                                                        <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Chats are saved locally in your browser
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
} 