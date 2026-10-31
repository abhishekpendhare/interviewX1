/**
 * STRATA / InterviewX Content Markdown & Front Matter Engine
 *
 * Implements:
 * 1. YAML front matter extraction & strongly-typed schema parsing
 * 2. AST / Block parsing (headings, lists, tables, code blocks, callouts)
 * 3. Security sanitization (XSS defense: strips <script>, inline event handlers, javascript: URIs)
 * 4. Table of Contents generation with stable anchor IDs
 * 5. Deterministic reading time computation (200 wpm)
 * 6. Code block extraction for test harness verification
 */

function parseFrontMatter(rawContent) {
    if (!rawContent || !rawContent.startsWith('---')) {
        return { frontMatter: {}, body: rawContent || '' };
    }

    const secondDelim = rawContent.indexOf('\n---', 3);
    if (secondDelim === -1) {
        return { frontMatter: {}, body: rawContent };
    }

    const fmText = rawContent.slice(3, secondDelim).trim();
    const body = rawContent.slice(secondDelim + 4).trim();
    const frontMatter = {};

    const lines = fmText.split(/\r?\n/);
    let currentKey = null;
    let currentList = null;
    let currentObjectList = null;
    let currentObj = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim() || line.trim().startsWith('#')) continue;

        // Top-level key: value
        const topMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (topMatch && !line.startsWith(' ') && !line.startsWith('\t')) {
            currentKey = topMatch[1].trim();
            const val = topMatch[2].trim();

            if (val === '') {
                // Potential list or complex object
                currentList = [];
                currentObjectList = [];
                frontMatter[currentKey] = currentList;
            } else if (val.startsWith('[') && val.endsWith(']')) {
                // Inline array: ["a", "b"]
                try {
                    frontMatter[currentKey] = JSON.parse(val);
                } catch {
                    frontMatter[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                }
                currentList = null;
            } else {
                frontMatter[currentKey] = parseScalar(val);
                currentList = null;
            }
            currentObj = null;
            continue;
        }

        // List item with object or scalar
        const itemMatch = line.match(/^\s*-\s+(.*)$/);
        if (itemMatch && currentKey) {
            const itemVal = itemMatch[1].trim();
            if (itemVal.includes(':')) {
                // Object list item: - title: Foo
                currentObj = {};
                const [k, ...vParts] = itemVal.split(':');
                currentObj[k.trim()] = parseScalar(vParts.join(':').trim());
                if (!Array.isArray(frontMatter[currentKey])) {
                    frontMatter[currentKey] = [];
                }
                frontMatter[currentKey].push(currentObj);
            } else {
                // Scalar list item: - tag1
                if (!Array.isArray(frontMatter[currentKey])) {
                    frontMatter[currentKey] = [];
                }
                frontMatter[currentKey].push(parseScalar(itemVal));
                currentObj = null;
            }
            continue;
        }

        // Nested object property: title: Bar
        const subPropMatch = line.match(/^\s+([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (subPropMatch && currentObj) {
            const subKey = subPropMatch[1].trim();
            const subVal = subPropMatch[2].trim();
            currentObj[subKey] = parseScalar(subVal);
            continue;
        }
    }

    return { frontMatter, body };
}

function parseScalar(val) {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        return val.slice(1, -1);
    }
    return val;
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function sanitizeHtml(html) {
    if (!html) return '';
    let clean = html;

    // 1. Remove dangerous script tags and content
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 2. Remove iframe, object, embed, form, input, button tags
    clean = clean.replace(/<\/?(iframe|object|embed|form|input|button)\b[^>]*>/gi, '');

    // 3. Remove inline event handlers (onerror, onload, onclick, etc.)
    clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, '');
    clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');

    // 4. Remove javascript: and data: in href and src
    clean = clean.replace(/\s+(href|src)\s*=\s*(['"])\s*(javascript|data):.*?\2/gi, ' $1="#"');

    return clean;
}

function calculateReadTime(text) {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

function extractHeadings(markdown) {
    const headings = [];
    const lines = markdown.split(/\r?\n/);
    for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '');
            const id = slugify(title);
            headings.push({ level, title, id });
        }
    }
    return headings;
}

function extractCodeBlocks(markdown) {
    const blocks = [];
    const regex = /```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
        blocks.push({
            language: (match[1] || 'text').toLowerCase(),
            code: match[2].trim()
        });
    }
    return blocks;
}

function renderMarkdownToHtml(markdown) {
    if (!markdown) return '';

    let md = markdown;

    // Preserve code blocks with placeholders
    const codeBlocks = [];
    md = md.replace(/```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g, (_, lang, code) => {
        const index = codeBlocks.length;
        const language = (lang || 'text').toLowerCase();
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        codeBlocks.push(
            `<div class="code-block-wrapper my-6 rounded-lg border border-white/10 bg-[#070B12] overflow-hidden">
                <div class="code-block-header flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
                    <span class="text-xs font-mono uppercase text-cyan-400 font-semibold">${language}</span>
                    <button type="button" class="copy-code-btn text-xs font-mono text-white/60 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors" data-code="${Buffer.from(code).toString('base64')}">Copy</button>
                </div>
                <pre class="p-4 overflow-x-auto text-sm font-mono text-slate-200"><code>${escapedCode}</code></pre>
            </div>`
        );
        return `%%%CODE_BLOCK_${index}%%%`;
    });

    // Tables
    md = md.replace(/^(\|.+?\r?\n)+/gm, (tableText) => {
        const lines = tableText.trim().split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return tableText;

        const parseRow = (line) => line.split('|').slice(1, -1).map(c => c.trim());
        const headerCols = parseRow(lines[0]);
        // Skip separator line at index 1 if it has dashes
        const bodyLines = lines.slice(lines[1].includes('---') ? 2 : 1);

        let html = '<div class="overflow-x-auto my-6"><table class="min-w-full text-left text-sm font-mono border border-white/10">';
        html += '<thead class="bg-white/[0.04] border-b border-white/10"><tr>';
        for (const h of headerCols) {
            html += `<th class="px-4 py-3 font-semibold text-cyan-300">${h}</th>`;
        }
        html += '</tr></thead><tbody class="divide-y divide-white/5">';
        for (const bl of bodyLines) {
            const cols = parseRow(bl);
            html += '<tr class="hover:bg-white/[0.02]">';
            for (const col of cols) {
                html += `<td class="px-4 py-3 text-white/80">${col}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        return html;
    });

    // Key Takeaways callout box (> [!NOTE] or > **Key takeaways:**)
    md = md.replace(/^>\s*\*\*Key takeaways:?\*\*\s*([\s\S]*?)(?=\n\n|\n[^\s>])/gm, (_, content) => {
        return `<div class="key-takeaways-box my-6 p-5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-100">
            <div class="flex items-center gap-2 mb-2 font-semibold text-cyan-300 font-mono text-sm uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                Key Takeaways
            </div>
            <div class="text-sm leading-relaxed text-slate-200">${content.trim()}</div>
        </div>`;
    });

    // Headings
    md = md.replace(/^### (.*$)/gim, (_, text) => {
        const id = slugify(text);
        return `<h3 id="${id}" class="text-xl sm:text-2xl font-bold text-white pt-6 pb-2 border-b border-white/10 mt-8 mb-4">${text}</h3>`;
    });
    md = md.replace(/^## (.*$)/gim, (_, text) => {
        const id = slugify(text);
        return `<h2 id="${id}" class="text-2xl sm:text-3xl font-extrabold text-white pt-8 pb-3 border-b border-white/15 mt-10 mb-4">${text}</h2>`;
    });
    md = md.replace(/^# (.*$)/gim, (_, text) => {
        const id = slugify(text);
        return `<h1 id="${id}" class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">${text}</h1>`;
    });

    // Blockquotes
    md = md.replace(/^>\s+(.+)$/gim, '<blockquote class="border-l-4 border-cyan-400 pl-4 py-1 my-4 italic text-slate-300 bg-white/[0.02] rounded-r">$1</blockquote>');

    // Bold & Italics
    md = md.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    md = md.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    md = md.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Inline code
    md = md.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-cyan-300">$1</code>');

    // Markdown Links [Text](url)
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors">$1</a>');

    // Unordered lists
    md = md.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-6 list-disc text-slate-300 leading-relaxed">$1</li>');

    // Ordered lists
    md = md.replace(/^\s*(\d+)\.\s+(.*)$/gim, '<li class="ml-6 list-decimal text-slate-300 leading-relaxed">$2</li>');

    // Paragraphs
    const paragraphs = md.split(/\n{2,}/);
    md = paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<blockquote') || p.startsWith('<table') || p.startsWith('%%%CODE_BLOCK_') || p.startsWith('<li')) {
            return p;
        }
        return `<p class="text-base sm:text-lg leading-relaxed text-slate-300 my-4">${p}</p>`;
    }).join('\n\n');

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
        md = md.replace(`%%%CODE_BLOCK_${index}%%%`, block);
    });

    return sanitizeHtml(md);
}

module.exports = {
    parseFrontMatter,
    renderMarkdownToHtml,
    sanitizeHtml,
    calculateReadTime,
    extractHeadings,
    extractCodeBlocks,
    slugify
};
