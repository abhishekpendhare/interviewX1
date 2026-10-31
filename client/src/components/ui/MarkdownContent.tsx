import type { ReactNode } from 'react';

const inlineTokenPattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(inlineTokenPattern).filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const safeHref = (href.startsWith('/') && !href.startsWith('//')) || /^https?:\/\//i.test(href);
      return safeHref
        ? <a key={key} href={href} target={href.startsWith('/') ? undefined : '_blank'} rel={href.startsWith('/') ? undefined : 'noreferrer'} className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 hover:text-cyan-200">{label}</a>
        : label;
    }
    if (token.startsWith('`')) return <code key={key} className="rounded-md border border-white/10 bg-black/25 px-1.5 py-0.5 font-mono text-[0.92em] text-violet-200">{token.slice(1, -1)}</code>;
    if (token.startsWith('**') || token.startsWith('__')) return <strong key={key} className="font-semibold text-slate-100">{token.slice(2, -2)}</strong>;
    if (token.startsWith('~~')) return <del key={key}>{token.slice(2, -2)}</del>;
    if (token.startsWith('*') || token.startsWith('_')) return <em key={key}>{token.slice(1, -1)}</em>;
    return token;
  });
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] || '';
  return /^```/.test(line) || /^\s{0,3}#{1,6}\s/.test(line) || /^\s*>/.test(line) || /^\s*([-*+]|\d+\.)\s+/.test(line) || /^\s*(---+|\*\*\*+|___+)\s*$/.test(line);
}

export function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    const fence = line.match(/^```\s*([\w+#.-]*)/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) codeLines.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`block-${blocks.length}`} className="max-w-full overflow-x-auto rounded-xl border border-white/10 bg-[#080d19] p-4 text-sm leading-6 text-slate-200"><code className={fence[1] ? `language-${fence[1]}` : undefined}>{codeLines.join('\n')}</code></pre>);
      continue;
    }

    const heading = line.match(/^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const className = level === 1 ? 'text-xl font-semibold text-white' : level === 2 ? 'text-lg font-semibold text-white' : 'text-base font-semibold text-slate-100';
      const children = renderInline(heading[2], `heading-${blocks.length}`);
      const key = `block-${blocks.length}`;
      if (level === 1) blocks.push(<h1 key={key} className={className}>{children}</h1>);
      else if (level === 2) blocks.push(<h2 key={key} className={className}>{children}</h2>);
      else if (level === 3) blocks.push(<h3 key={key} className={className}>{children}</h3>);
      else blocks.push(<h4 key={key} className={className}>{children}</h4>);
      index += 1;
      continue;
    }

    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      blocks.push(<hr key={`block-${blocks.length}`} className="border-white/10" />);
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) quoteLines.push(lines[index++].replace(/^\s*>\s?/, ''));
      blocks.push(<blockquote key={`block-${blocks.length}`} className="border-l-2 border-violet-400/60 pl-4 text-slate-300">{quoteLines.map((quote, quoteIndex) => <p key={quoteIndex}>{renderInline(quote, `quote-${blocks.length}-${quoteIndex}`)}</p>)}</blockquote>);
      continue;
    }

    const listStart = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
    if (listStart) {
      const ordered = /^\d+\./.test(listStart[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
        if (!item || /^\d+\./.test(item[1]) !== ordered) break;
        items.push(item[2]);
        index += 1;
      }
      const itemNodes = items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `list-${blocks.length}-${itemIndex}`)}</li>);
      blocks.push(ordered
        ? <ol key={`block-${blocks.length}`} className="list-decimal space-y-1 pl-5 marker:text-violet-300">{itemNodes}</ol>
        : <ul key={`block-${blocks.length}`} className="list-disc space-y-1 pl-5 marker:text-cyan-300">{itemNodes}</ul>);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) paragraph.push(lines[index++].trim());
    if (paragraph.length === 0) { index += 1; continue; }
    blocks.push(<p key={`block-${blocks.length}`} className="whitespace-pre-wrap">{renderInline(paragraph.join(' '), `paragraph-${blocks.length}`)}</p>);
  }

  return <div className={`space-y-3 break-words leading-7 ${className}`}>{blocks}</div>;
}
