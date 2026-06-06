"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { 
          role: "assistant", 
          content: "Welcome to Chronicle. I'm your editorial research assistant. Ask me anything about the software and AI tools we've analyzed today." 
        }
      ]);
    }
  }, []);

  useEffect(() => {
    // Save history to localStorage
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: messages.slice(1), 
          message: userMsg 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.text }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "I'm having trouble retrieving details from our archive at the moment." }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "A connection issue occurred. Please check back shortly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Editorial style, not rounded pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white shadow-[0_4px_16px_rgba(200,80,42,0.25)] hover:bg-accent-hover active:translate-y-[1px] transition-all duration-200 z-50 flex items-center justify-center rounded-[6px]"
          aria-label="Open Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-[0_8px_32px_rgba(26,26,24,0.08)] z-50 flex flex-col h-[520px] border border-border bg-card rounded-[6px]">
          <CardHeader className="p-4 border-b border-border bg-[#1A1A18] text-white flex flex-row items-center justify-between rounded-t-[5px]">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-display font-medium tracking-tight">Chronicle Assistant</CardTitle>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#252521] transition-all"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 overflow-hidden bg-secondary/30">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-border text-xs ${msg.role === "user" ? "bg-primary text-white border-transparent" : "bg-[#1A1A18] text-white"}`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`p-3 text-xs font-sans leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-primary text-white rounded-[6px] rounded-tr-none shadow-sm" 
                          : "bg-card text-foreground border border-border rounded-[6px] rounded-tl-none shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2.5 max-w-[85%] flex-row">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#1A1A18] text-white">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="p-3 bg-card border border-border rounded-[6px] rounded-tl-none text-muted-foreground flex items-center gap-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-3 border-t border-border bg-card">
            <form onSubmit={sendMessage} className="flex w-full gap-2 items-center">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about product reviews..." 
                className="flex-1 bg-secondary text-xs font-sans px-3 py-2 border border-border rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground/60"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-primary hover:bg-accent-hover text-white rounded-[4px] disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
