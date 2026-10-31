import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'dsa', label: 'Data structures', path: '/compiler' },
  { id: 'db', label: 'Databases', path: '/foundations' },
  { id: 'os', label: 'Operating systems', path: '/foundations' },
  { id: 'behavioral', label: 'Behavioral', path: '/simulator' },
] as const;

const questions = [
  { category: 'dsa', question: 'How would you solve Two Sum efficiently?', answer: 'Store each number and its index in a hash map. For each value x, check whether target − x is already present; if so, return the two indices. This takes O(n) expected time and O(n) extra space.' },
  { category: 'dsa', question: 'When is a sliding window useful?', answer: 'Use it for contiguous ranges when the range can be adjusted as you move through the input. Expand the right edge to include items, then move the left edge while a constraint is violated. Many such problems run in O(n) because each pointer moves forward at most n times.' },
  { category: 'dsa', question: 'How can you detect a cycle in a linked list?', answer: 'Use slow and fast pointers. Move one pointer by one node and the other by two; if they meet, there is a cycle. If the fast pointer reaches null, the list is acyclic. The method uses O(n) time and O(1) extra space.' },
  { category: 'db', question: 'What does a database index do, and what does it cost?', answer: 'An index keeps an ordered lookup structure so the database can find matching rows without scanning the whole table. It speeds up suitable reads, but takes storage and adds work to inserts, updates, and deletes. Index columns used often in filters and joins, then confirm with the query plan.' },
  { category: 'db', question: 'Explain the ACID properties of a transaction.', answer: 'Atomicity means all-or-nothing; consistency preserves database rules; isolation limits interference between concurrent transactions; durability means committed changes survive failures. Give a short example, such as transferring money between two accounts.' },
  { category: 'db', question: 'When would you normalize or denormalize a schema?', answer: 'Normalize to reduce duplicated data and update anomalies, especially for frequently changed records. Denormalize selectively when measured read patterns benefit from fewer joins, while accounting for synchronization and consistency costs.' },
  { category: 'os', question: 'What is the difference between a process and a thread?', answer: 'A process has its own virtual address space and operating-system resources. Threads run within a process and share its memory, while each thread has its own stack and execution state. Threads can share data efficiently, but shared state requires synchronization.' },
  { category: 'os', question: 'What conditions are required for deadlock?', answer: 'The four conditions are mutual exclusion, hold and wait, no preemption, and circular wait. Preventing any one condition can prevent deadlock. Explain which condition your proposed strategy changes and its tradeoff.' },
  { category: 'os', question: 'What is a context switch?', answer: 'The operating system saves the running thread’s state and restores another thread’s state so execution can move between them. Switching enables multitasking, but takes time and can disrupt CPU caches, so excessive switching hurts throughput.' },
  { category: 'behavioral', question: 'Tell me about a time you disagreed with a teammate.', answer: 'Use STAR: describe the situation and shared goal, explain the disagreement and your action, then share the result. Focus on how you listened, used evidence, and aligned on a decision rather than on who was right.' },
  { category: 'behavioral', question: 'Describe a mistake or failure and what you learned.', answer: 'Choose a specific example you owned. Explain the impact plainly, the steps you took to recover, and the change you made afterward to reduce the chance of it happening again.' },
  { category: 'behavioral', question: 'How do you handle a problem you have never seen before?', answer: 'Clarify the goal and constraints, state what you know, and work through a small example. Compare possible approaches, discuss complexity and edge cases, then refine the solution as you learn more.' },
] as const;

export function InterviewQuestionBank() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]['id']>('dsa');
  const active = categories.find(category => category.id === activeCategory)!;
  const visibleQuestions = questions.filter(question => question.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-5" aria-label="Filter interview questions">
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            aria-pressed={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`min-h-10 px-4 py-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${activeCategory === category.id
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-indigo-400/60'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-3" aria-live="polite">
        {visibleQuestions.map((item, index) => (
          <details key={item.question} className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] open:border-indigo-500/40 transition-colors">
            <summary className="min-h-14 list-none cursor-pointer flex items-center justify-between gap-4 px-4 sm:px-5 py-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              <span className="flex items-start gap-3 text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                <span className="mt-0.5 text-xs font-mono text-indigo-400">0{index + 1}</span>
                {item.question}
              </span>
              <ChevronDown aria-hidden="true" className="w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] leading-relaxed">
              <p className="pt-3">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <Link to={active.path} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
        More {active.label.toLowerCase()} practice <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </Link>
    </div>
  );
}
