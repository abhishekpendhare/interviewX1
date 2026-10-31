import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';
import { api } from '@/lib/api';

interface ContactBlock {
  number: string;
  title: string;
  purpose: string;
  actionText: string;
  category: string;
}

const CONTACT_BLOCKS: ContactBlock[] = [
  {
    number: '01',
    title: 'STUDENT SUPPORT',
    purpose: 'Technical platform issues, sandbox execution telemetry, and candidate account queries.',
    actionText: 'CONTACT DESK',
    category: 'STUDENT_SUPPORT'
  },
  {
    number: '02',
    title: 'REPORT A WRONG QUESTION',
    purpose: 'Direct submission loop to our staff calibration team for edge cases or incorrect testcases.',
    actionText: 'SUBMIT AUDIT',
    category: 'QUESTION_REVIEW'
  },
  {
    number: '03',
    title: 'CONTRIBUTE CONTENT',
    purpose: 'Submit verified company interview experiences, novel DSA problem patterns, or STAR rubrics.',
    actionText: 'SHARE EXPERIENCE',
    category: 'CONTENT_CONTRIBUTION'
  },
  {
    number: '04',
    title: 'COLLEGES & PARTNERSHIPS',
    purpose: 'Institutional batch licensing, department telemetry dashboards, and campus bootcamps.',
    actionText: 'CAMPUS ENQUIRY',
    category: 'PARTNERSHIPS'
  },
  {
    number: '05',
    title: 'PRESS & FEEDBACK',
    purpose: 'Architectural collaborations, media inquiries, and platform leadership feedback.',
    actionText: 'DIRECT REACHOUT',
    category: 'PRESS'
  }
];

interface FormState {
  name: string;
  email: string;
  message: string;
}

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export const NumberedContact: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ContactBlock | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [delivery, setDelivery] = useState<'email' | 'saved'>('saved');
  const [formData, setFormData] = useState<FormState>({ name: '', email: '', message: '' });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSubmitStatus('idle');
    setErrorMessage('');
    setTicketId('');
    setDelivery('saved');
    setFormData({ name: '', email: '', message: '' });
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const focusFrame = window.requestAnimationFrame(() => firstFieldRef.current?.focus());
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )).filter(item => item.getClientRects().length > 0);
      if (!items.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleDialogKeys);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleDialogKeys);
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [activeModal, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal || submitStatus === 'sending') return;

    // Client-side pre-validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name or organization.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    setErrorMessage('');
    setSubmitStatus('sending');

    try {
      const result = await api.sendContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        category: activeModal.category
      });

      if (result.success) {
        setTicketId(result.ticketId || '');
        setDelivery(result.delivery || 'saved');
        setSubmitStatus('success');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
        setSubmitStatus('error');
      }
    } catch (err: unknown) {
      const serverMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErrorMessage(serverMsg || 'Failed to send message. Please check your connection and try again.');
      setSubmitStatus('error');
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(''); // Clear error on edit
  };

  return (
    <section id="section-contact" className="relative border-b border-white/10 bg-[#0B1020] py-20 text-white sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-500/[0.08] blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-[110px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <ScrollRevealLeft className="relative mb-12 max-w-3xl space-y-4 sm:mb-14">
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.75)]" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              CONTACT &amp; SUPPORT
            </span>
          </div>
          <h2 className="headline-section text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            How can we help? <br />
            <span className="bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">
              We're one message away.
            </span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Choose the right team for your question, feedback, or partnership idea. We'll help you find the next step.
          </p>
        </ScrollRevealLeft>

        {/* 01 to 05 Numbered Blocks Grid */}
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CONTACT_BLOCKS.map((block, idx) => (
            <ScrollRevealLeft
              key={block.number}
              staggerIndex={idx}
              className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[#10172D]/75 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-[#141C36]/90 sm:p-6"
            >
              <div className="space-y-4">
                <div className="font-mono text-3xl font-bold text-slate-500 transition-colors group-hover:text-cyan-200 sm:text-4xl">
                  {block.number}
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
                    {block.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {block.purpose}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={(event) => { returnFocusRef.current = event.currentTarget; setActiveModal(block); setSubmitStatus('idle'); setErrorMessage(''); setFormData({ name: '', email: '', message: '' }); }}
                  className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-200 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 group-hover:text-cyan-200"
                >
                  <span>{block.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </ScrollRevealLeft>
          ))}
        </div>


      </div>

      {/* Interactive Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/80 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close contact form"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={closeModal}
          />
          <dialog
            open
            ref={dialogRef}
            aria-modal="true"
            aria-labelledby="contact-dialog-title"
            tabIndex={-1}
            className="relative z-10 m-0 w-full max-w-lg space-y-6 rounded-2xl border border-white/10 bg-[#10172D] p-6 text-inherit shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-200">
                  {activeModal.title}
                </span>
                <h4 id="contact-dialog-title" className="font-heading text-lg font-semibold text-white">Send us a message</h4>
              </div>
              <button 
                onClick={closeModal}
                aria-label="Close contact form"
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                ESC
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" aria-hidden="true" />
                <h5 className="font-heading text-lg font-semibold text-white">{delivery === 'email' ? 'Message sent' : 'Support ticket saved'}</h5>
                <p className="text-sm text-slate-400">
                  {delivery === 'email'
                    ? <>Your message was emailed to the configured support inbox. The team can reply to <span className="text-cyan-300">{formData.email}</span>.</>
                    : 'This server saved your request, but has no email notification configured. Contact the site administrator with your ticket ID to ensure it is reviewed.'}
                </p>
                {ticketId && (
                  <p className="text-xs text-slate-500 font-mono">Ticket: {ticketId}</p>
                )}
                <button
                  onClick={closeModal}
                  className="mt-4 rounded-xl border border-white/10 px-6 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-medium text-slate-300">Your name or organization</label>
                  <input
                    id="contact-name"
                    ref={firstFieldRef}
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    disabled={submitStatus === 'sending'}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020]/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/15 disabled:opacity-50"
                    placeholder="e.g., Alex Chen"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-medium text-slate-300">Email address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    disabled={submitStatus === 'sending'}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020]/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/15 disabled:opacity-50"
                    placeholder="alex@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-message" className="text-xs font-medium text-slate-300">How can we help?</label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => handleFieldChange('message', e.target.value)}
                    disabled={submitStatus === 'sending'}
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0B1020]/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/15 disabled:opacity-50"
                    placeholder="Detail the question ID, partnership proposal, or telemetry query..."
                  />
                </div>

                {/* Error banner — shown only on delivery failure, form contents are preserved */}
                {(submitStatus === 'error' || errorMessage) && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorMessage || 'Failed to deliver your message. Please try again.'}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="max-w-[55%] text-[11px] text-slate-500">Category: {activeModal.title}</span>
                  <button
                    type="submit"
                    disabled={submitStatus === 'sending'}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5CFF] to-[#4A72FF] px-6 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(109,92,255,0.22)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'sending' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      'Send message'
                    )}
                  </button>
                </div>
              </form>
            )}

          </dialog>
        </div>
      )}

    </section>
  );
};
