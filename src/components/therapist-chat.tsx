// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatHistory } from "@/hooks/use-chat-history";
import { toast } from "@/hooks/use-toast";
import { useChat } from "ai/react";
import { Loader2, Mic, MicOff, Save, Send, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function TherapistChat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
        useChat();
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Chat history functionality
    const {
        sessions,
        currentSessionId,
        isLoading: isHistoryLoading,
        saveSession,
        loadSession,
        deleteSession,
        startNewChat,
        clearAllSessions,
    } = useChatHistory();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;

                recognitionRef.current.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    handleInputChange({
                        target: { value: transcript },
                    } as React.ChangeEvent<HTMLInputElement>);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);
                    if (event.error === "network") {
                        toast({
                            title: "Network Error",
                            description:
                                "Please check your internet connection and try again.",
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "Speech Recognition Error",
                            description: `Error: ${event.error}. Please try again.`,
                            variant: "destructive",
                        });
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            } else {
                setIsRecognitionSupported(false);
                toast({
                    title: "Speech Recognition Not Supported",
                    description:
                        "Your browser doesn't support speech recognition. Please try using a different browser.",
                    variant: "destructive",
                });
            }
        }
    }, [handleInputChange]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!isRecognitionSupported) {
            toast({
                title: "Speech Recognition Not Supported",
                description:
                    "Your browser doesn't support speech recognition. Please try using a different browser.",
                variant: "destructive",
            });
            return;
        }

        if (!isListening) {
            startListening();
        } else {
            stopListening();
        }
    }, [isListening, isRecognitionSupported, startListening, stopListening]);

    const speak = useCallback((text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({
                title: "Text-to-Speech Not Supported",
                description:
                    "Your browser doesn't support text-to-speech. Please try using a different browser.",
                variant: "destructive",
            });
        }
    }, []);

    const toggleSpeaking = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (messages.length > 0) {
            speak(messages[messages.length - 1].content);
        }
    }, [isSpeaking, messages, speak]);

    // Chat history handlers
    const handleSaveChat = useCallback(async () => {
        if (messages.length > 0) {
            await saveSession(messages);
        }
    }, [messages, saveSession]);

    const handleLoadSession = useCallback(async (sessionId: string) => {
        const sessionMessages = await loadSession(sessionId);
        setMessages(sessionMessages);
    }, [loadSession, setMessages]);

    const handleNewChat = useCallback(() => {
        startNewChat();
        setMessages([]);
    }, [startNewChat, setMessages]);

    const handleDeleteSession = useCallback(async (sessionId: string) => {
        await deleteSession(sessionId);
        if (currentSessionId === sessionId) {
            setMessages([]);
        }
    }, [deleteSession, currentSessionId, setMessages]);

    const handleClearAll = useCallback(async () => {
        await clearAllSessions();
        setMessages([]);
    }, [clearAllSessions, setMessages]);

    return (
        <div className="w-full h-full flex bg-white">
            {/* Chat History Sidebar */}
            <ChatHistorySidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                isLoading={isHistoryLoading}
                onSelectSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
                onNewChat={handleNewChat}
                onClearAll={handleClearAll}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden md:p-4">
                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="border-b border-gray-100 p-4 md:rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium text-gray-700">Conversation</h2>
                            {messages.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveChat}
                                    className="flex items-center"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Chat
                                </Button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                        <div className="p-4 space-y-4">
                            {messages.map((m, index) => (
                                <div
                                    key={index}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === "user"
                                            ? "bg-blue-50 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <MarkdownRenderer content={m.content} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="border-t border-gray-100 p-4">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2"
                        >
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Type your message here..."
                                className="flex-grow bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                            />
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={toggleSpeaking}
                                    className="border-gray-200 hover:bg-gray-100 flex-grow md:flex-grow-0"
                                >
                                    {isSpeaking ? (
                                        <VolumeX className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Volume2 className="h-4 w-4 mr-2" />
                                    )}
                                    <span className="md:sr-only">
                                        {isSpeaking ? "Stop" : "Listen"}
                                    </span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={isListening ? "destructive" : "secondary"}
                                    onClick={toggleListening}
                                    className={`flex-grow md:flex-grow-0 ${isListening
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    disabled={!isRecognitionSupported}
                                >
                                    {isListening ? (
                                        <MicOff className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Mic className="h-4 w-4 mr-2" />
                                    )}
                                    <span className="md:sr-only">
                                        {isListening ? "Stop" : "Start"} speaking
                                    </span>
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-grow md:flex-grow-0"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    <span className="md:sr-only">Send</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}