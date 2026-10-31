import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, Code2, Mic, Cpu, Award } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'simulator' | 'compiler' | 'advisor' | 'general';
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'simulator',
    question: 'How does the Autonomous Voice Mock Bar Raiser evaluate my answers?',
    answer: 'Unlike generic LLM wrappers that output a single superficial score, our engine uses a 4-dimensional rubric: Correctness (catching false architectural assertions), Completeness (verifying must-hit technical keywords), Clarity (evaluating structured explanation), and Edge-Case Depth (checking Big-O bounds and failure modes). Furthermore, it dynamically generates follow-ups that probe the exact claims you made.'
  },
  {
    id: 'faq-2',
    category: 'compiler',
    question: 'Are the 3,500+ coding problems executed in a real sandbox with test cases?',
    answer: 'Yes. Every problem submitted through the Monaco Code Arena executes against a hardened sandbox supporting Python 3.12, Java 21, C++20, and Node.js. It runs both visible sample test cases and hidden edge cases with precise memory and CPU execution time telemetry.'
  },
  {
    id: 'faq-3',
    category: 'advisor',
    question: 'How does the Neural Advisor remember my weaknesses across sessions?',
    answer: 'The Neural Advisor is backed by your persistent Candidate Context Graph. Every time you complete a coding challenge or mock interview, your mastery radar updates across 8 engineering disciplines, automatically scheduling targeted refresher sprints for concepts where you missed key rubric points.'
  },
  {
    id: 'faq-4',
    category: 'general',
    question: 'Can I upload and document my own algorithmic approaches?',
    answer: 'Yes! Every coding question includes a dedicated "My Approach" field. You can document your time/space complexity invariants and algorithmic strategy, which is persisted directly into your candidate profile and analyzed by the AI mentor for code-to-approach consistency.'
  },
  {
    id: 'faq-5',
    category: 'simulator',
    question: 'What interview tracks and domains are supported?',
    answer: 'We support full end-to-end interview simulations across Data Structures & Algorithms, Java 21 Concurrency & Virtual Threads, Spring Boot & JPA, PostgreSQL ACID/MVCC, Operating Systems & TLB caching, Computer Networks, and Amazon STAR Behavioral Leadership.'
  }
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredFaqs = activeFilter === 'all' 
    ? FAQS 
    : FAQS.filter(f => f.category === activeFilter);

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'simulator', label: 'Mock Bar Raiser' },
          { id: 'compiler', label: 'Code Arena' },
          { id: 'advisor', label: 'Neural Co-Pilot' },
          { id: 'general', label: 'Candidate Workflow' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-indigo-500/40 bg-[var(--bg-card)] shadow-md'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)]/70 hover:border-[var(--border-active)]'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors focus:outline-none"
              >
                <span className="text-sm sm:text-base font-bold font-heading text-[var(--text-primary)] pr-4">
                  {faq.question}
                </span>
                <div className={`p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)]/50 mt-1">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
