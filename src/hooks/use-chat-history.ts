"use client";

import { toast } from "@/hooks/use-toast";
import { ChatMessage, ChatSession, dbManager } from "@/lib/indexeddb";
import { useCallback, useEffect, useState } from "react";

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate a unique ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Generate a title from the first user message
  const generateTitle = useCallback((messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      // Take first 50 characters and add ellipsis if longer
      const title = firstUserMessage.content.slice(0, 50);
      return title.length < firstUserMessage.content.length
        ? `${title}...`
        : title;
    }
    return `New Chat - ${new Date().toLocaleDateString()}`;
  }, []);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const allSessions = await dbManager.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save current session
  const saveSession = useCallback(
    async (
      messages: { role: string; content: string; id?: string }[],
      customTitle?: string
    ) => {
      if (messages.length === 0) return;

      try {
        const now = Date.now();
        const sessionId = currentSessionId || generateId();

        // Convert messages to our format
        const chatMessages: ChatMessage[] = messages.map((msg, index) => ({
          id: `${sessionId}-${index}`,
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
          timestamp: now + index, // Ensure unique timestamps
        }));

        const session: ChatSession = {
          id: sessionId,
          title: customTitle || generateTitle(chatMessages),
          messages: chatMessages,
          createdAt: currentSessionId
            ? sessions.find((s) => s.id === currentSessionId)?.createdAt || now
            : now,
          updatedAt: now,
        };

        await dbManager.saveSession(session);

        if (!currentSessionId) {
          setCurrentSessionId(sessionId);
        }

        await loadSessions();

        toast({
          title: "Success",
          description: "Chat saved successfully",
        });
      } catch (error) {
        console.error("Failed to save session:", error);
        toast({
          title: "Error",
          description: "Failed to save chat",
          variant: "destructive",
        });
      }
    },
    [currentSessionId, generateId, generateTitle, loadSessions, sessions]
  );

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const session = await dbManager.getSession(sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        return session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          id: msg.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to load session:", error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await dbManager.deleteSession(sessionId);
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
        }
        await loadSessions();

        toast({
          title: "Success",
          description: "Chat deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete session:", error);
        toast({
          title: "Error",
          description: "Failed to delete chat",
          variant: "destructive",
        });
      }
    },
    [currentSessionId, loadSessions]
  );

  // Start a new chat
  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  // Clear all sessions
  const clearAllSessions = useCallback(async () => {
    try {
      await dbManager.clearAllSessions();
      setSessions([]);
      setCurrentSessionId(null);

      toast({
        title: "Success",
        description: "All chats cleared successfully",
      });
    } catch (error) {
      console.error("Failed to clear all sessions:", error);
      toast({
        title: "Error",
        description: "Failed to clear all chats",
        variant: "destructive",
      });
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSessionId,
    isLoading,
    saveSession,
    loadSession,
    deleteSession,
    startNewChat,
    clearAllSessions,
    loadSessions,
  };
};
