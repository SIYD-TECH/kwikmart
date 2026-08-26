"use client";

// Same single-turn discipline as OrderChat — one question, one answer, no
// conversation history. Widening the TOPICS it can discuss doesn't mean
// abandoning the "keep it a simple, bounded Q&A tool" interaction pattern.

import { useState } from "react";
import { MessageCircle, X, Loader2, Send } from "lucide-react";
import { askKwikMartQuestion } from "@/app/(storefront)/aiActions";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    setError(null);

    const result = await askKwikMartQuestion(question);
    setIsLoading(false);

    if (result.error) setError(result.error);
    else setAnswer(result.answer);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl border border-border bg-surface p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading font-bold text-primary">
              Ask KwikMart
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mb-3 text-xs text-text-muted">
            Ask about product availability or how ordering works.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Do you have Indomie in stock?"
              className="flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center rounded-xl bg-primary px-3 text-white transition hover:bg-primary-light disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>

          {answer && (
            <p className="mt-3 rounded-xl bg-primary/5 p-3 text-sm text-text">
              {answer}
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-light"
        aria-label="Ask KwikMart"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
