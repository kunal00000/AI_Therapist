// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, VolumeX, Volume2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "./markdown-renderer";

export default function TherapistChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

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
  }, [isListening, isRecognitionSupported]);

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

  return (
    <Card className="w-full bg-white shadow-sm border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-medium text-gray-700">
          Conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    m.role === "user"
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
      </CardContent>
      <CardFooter className="border-t border-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-grow bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant={isListening ? "destructive" : "secondary"}
            onClick={toggleListening}
            className={
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-200 hover:bg-gray-300"
            }
            disabled={!isRecognitionSupported}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isListening ? "Stop listening" : "Start listening"}
            </span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleSpeaking}
            className="border-gray-200 hover:bg-gray-100"
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isSpeaking ? "Stop speaking" : "Start speaking"}
            </span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
