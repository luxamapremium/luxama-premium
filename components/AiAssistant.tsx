"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I book a consultation?",
  "Which immigration forms do you support?",
  "What are your office hours?",
  "Where is your office located?",
];

const OFFICE_PHONE = "+1 (786) 907-0814";
const OFFICE_PHONE_TEL = "tel:+17869070814";

/**
 * Validates that a link target belongs strictly to the approved internal directory.
 */
function isAllowedRoute(url: string): boolean {
  const target = url.trim();
  if (target.startsWith("//") || target.toLowerCase().includes("javascript:")) {
    return false;
  }
  return (
    target === "/#hero" ||
    target === "/about" ||
    target === "/contact" ||
    target === "/client/bookings" ||
    target.startsWith("/admins/") ||
    target.startsWith("/forms/") ||
    target === OFFICE_PHONE_TEL ||
    target === "mailto:info@luxamapremiumgroup.com"
  );
}

/**
 * Safely parses inline markdown (bold text, links, phone numbers)
 * without ever using dangerouslySetInnerHTML.
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Regex to match markdown links: [label](url), bold: **bold**, and phone number
  const regex =
    /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\+1\s*\(\d{3}\)\s*\d{3}-\d{4})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const href = linkMatch[2];
        if (isAllowedRoute(href)) {
          if (href.startsWith("tel:") || href.startsWith("mailto:")) {
            parts.push(
              <a
                key={match.index}
                href={href}
                className="font-medium text-gold-600 dark:text-gold-400 underline underline-offset-2 hover:opacity-80"
              >
                {label}
              </a>
            );
          } else {
            parts.push(
              <Link
                key={match.index}
                href={href}
                className="font-medium text-gold-600 dark:text-gold-400 underline underline-offset-2 hover:opacity-80"
              >
                {label}
              </Link>
            );
          }
        } else {
          parts.push(label);
        }
      } else {
        parts.push(token);
      }
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.includes("907-0814")) {
      parts.push(
        <a
          key={match.index}
          href={OFFICE_PHONE_TEL}
          className="font-medium text-gold-600 dark:text-gold-400 underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1"
        >
          <Phone className="size-3 inline" />
          {token}
        </a>
      );
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

/**
 * Formats multi-line text with safe paragraphs and bullet points.
 */
function FormattedAssistantMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-1.5 space-y-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const itemText = trimmed.slice(2);
      currentList.push(
        <li key={`li-${index}`} className="text-xs sm:text-sm leading-relaxed">
          {parseInlineFormatting(itemText)}
        </li>
      );
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-xs sm:text-sm leading-relaxed mb-1.5 last:mb-0">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Handle opening and closing dialog focus
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: trimmed.slice(0, 1000),
    };

    const nextMessages = [...messages, userMessage].slice(-20);
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = `ast-${Date.now()}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let errText =
          `I apologize, but I am unable to connect right now. Please try again or call our office at ${OFFICE_PHONE}.`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errText = errData.error;
          }
        } catch {
          // Use default error text
        }
        setErrorMessage(errText);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      // Prepare empty assistant message for streaming
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: streamedContent }
              : msg
          )
        );
      }
    } catch {
      setErrorMessage(
        `We experienced a network connection problem. Please try again shortly or contact our office directly at ${OFFICE_PHONE}.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (question: string) => {
    sendMessage(question);
  };

  const handleResetConversation = () => {
    setMessages([]);
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <Button
          ref={buttonRef}
          onClick={() => setIsOpen(true)}
          className="cursor-pointer fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 size-14 rounded-full bg-navy-900 text-ice-50 dark:bg-gold-500 dark:text-navy-950 border border-gold-500/40 shadow-luxury-lg hover:shadow-gold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center p-0"
          aria-label="Open AI Support Assistant"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="ai-support-panel"
        >
          <MessageCircle className="size-6 text-gold-400 dark:text-navy-950" />
          <span className="sr-only">Open Support Assistant</span>
          
        </Button>
      )}

      {/* Chat Panel / Mobile Full-screen Sheet */}
      {isOpen && (
        <div
          ref={panelRef}
          id="ai-support-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-assistant-heading"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] sm:max-h-[calc(100vh-3rem)] z-50 flex flex-col bg-card sm:rounded-2xl sm:shadow-luxury-lg sm:border sm:border-border/80 overflow-hidden transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-navy-950 text-ice-50 select-none">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2
                  id="ai-assistant-heading"
                  className="font-serif text-sm font-semibold text-ice-50 tracking-wide leading-none"
                >
                  Luxama AI Assistant
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-ice-200/80 leading-none">
                    Customer Support • Kissimmee
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleResetConversation}
                  title="Clear conversation"
                  aria-label="Start new conversation"
                  className="text-ice-200 hover:text-ice-50 hover:bg-navy-800"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Support Assistant"
                className="text-ice-200 hover:text-ice-50 hover:bg-navy-800"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50"
            role="log"
            aria-live="polite"
          >
            {/* Initial Welcome Greeting */}
            <div className="flex gap-2.5 items-start">
              <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Sparkles className="size-3.5 text-gold-500" />
              </div>
              <div className="bg-card border border-border/80 rounded-2xl rounded-tl-xs p-3.5 text-xs sm:text-sm text-card-foreground shadow-xs max-w-[90%]">
                <p className="font-medium text-foreground mb-1">
                  Welcome to Luxama Premium Group!
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  How can I help you today? I can assist with immigration document
                  preparation, tax services, notary authentication, business formation,
                  or booking a consultation with our specialists.
                </p>
              </div>
            </div>

            {/* Suggested Question Chips (Shown on first open) */}
            {messages.length === 0 && (
              <div className="pt-2 pl-9">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  Suggested inquiries:
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleChipClick(question)}
                      aria-label={`Ask: ${question}`}
                      className="text-left text-xs bg-card hover:bg-gold-500/10 hover:border-gold-500/50 text-foreground border border-border/80 rounded-lg px-3 py-2 transition-all shadow-2xs hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 items-start ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Sparkles className="size-3.5 text-gold-500" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3 text-xs sm:text-sm shadow-xs ${
                      isUser
                        ? "bg-navy-900 text-ice-50 dark:bg-gold-500 dark:text-navy-950 rounded-br-xs max-w-[85%]"
                        : "bg-card border border-border/80 text-card-foreground rounded-tl-xs max-w-[90%]"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <FormattedAssistantMessage content={message.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user" ||
                messages[messages.length - 1]?.content === "") && (
                <div className="flex gap-2.5 items-start">
                  <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Sparkles className="size-3.5 text-gold-500" />
                  </div>
                  <div className="bg-card border border-border/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-1.5 rounded-full bg-gold-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="size-1.5 rounded-full bg-gold-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="size-1.5 rounded-full bg-gold-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="sr-only">AI assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

            {/* Error Message Fallback */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
                <p>{errorMessage}</p>
                <div className="mt-2 pt-2 border-t border-destructive/20 flex items-center justify-between">
                  <a
                    href={OFFICE_PHONE_TEL}
                    className="font-medium underline inline-flex items-center gap-1 hover:opacity-80"
                  >
                    <Phone className="size-3" /> Call {OFFICE_PHONE}
                  </a>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-xs hover:underline text-destructive/80"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form & Footer */}
          <div className="p-3 border-t border-border bg-card">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about forms, booking, or hours..."
                maxLength={1000}
                disabled={isLoading}
                aria-label="Ask the AI support assistant"
                className="flex-1 min-w-0 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                size="default"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="bg-navy-900 text-ice-50 hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 shrink-0"
              >
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>

            {/* Small Footer Note */}
            <p className="text-[11px] text-muted-foreground text-center pt-2 select-none">
              AI assistant. Not legal advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

