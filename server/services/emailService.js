const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function isConfigured() {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendEmail({ to, subject, text, html, replyTo }) {
    if (!isConfigured()) throw new Error('Email delivery is not configured.');
    if (typeof fetch !== 'function') throw new Error('This Node.js version does not support fetch.');

    const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [to],
            subject,
            text,
            html,
            ...(replyTo ? { reply_to: replyTo } : {})
        })
    });

    if (!response.ok) {
        // Avoid logging provider response bodies, which can contain recipient data.
        throw new Error(`Email provider returned HTTP ${response.status}.`);
    }
    return response.json().catch(() => ({}));
}

async function sendPasswordResetEmail(to, resetUrl) {
    const safeUrl = escapeHtml(resetUrl);
    await sendEmail({
        to,
        subject: 'Reset your InterviewX password',
        text: [
            'We received a request to reset your InterviewX password.',
            '',
            'Use this link within one hour:',
            resetUrl,
            '',
            'If you did not request this, you can ignore this email.'
        ].join('\n'),
        html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0B1020;color:#e2e8f0;border-radius:12px;"><h2 style="color:#fff">Reset your password</h2><p style="color:#94a3b8">This link is valid for one hour.</p><a href="${safeUrl}" style="display:inline-block;padding:12px 28px;background:#6D5CFF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reset Password</a><p style="color:#64748b;font-size:12px;margin-top:24px">If you did not request this, you can ignore this email.</p></div>`
    });
}

async function sendContactNotification({ name, email, message, category, ticketId }) {
    const to = process.env.SUPPORT_EMAIL;
    if (!to) throw new Error('Support inbox is not configured.');

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCategory = escapeHtml(category);
    const safeTicket = escapeHtml(ticketId);
    const safeMessage = escapeHtml(message);
    await sendEmail({
        to,
        replyTo: email,
        subject: `[InterviewX Support] ${category} — Ticket ${ticketId}`,
        text: [`Ticket: ${ticketId}`, `Category: ${category}`, `From: ${name} <${email}>`, '', message].join('\n'),
        html: `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0B1020;color:#e2e8f0;border-radius:12px"><h2 style="color:#fff">New support message</h2><p>Ticket <code>${safeTicket}</code> · ${safeCategory}</p><p>From: ${safeName} &lt;${safeEmail}&gt;</p><div style="white-space:pre-wrap;padding:16px;background:#10172D;border-radius:8px">${safeMessage}</div></div>`
    });
}

module.exports = { isConfigured, sendPasswordResetEmail, sendContactNotification };
