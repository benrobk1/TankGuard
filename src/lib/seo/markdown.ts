/**
 * Tiny markdown-to-HTML renderer.
 *
 * Supports the subset SEO articles need: ATX headings, paragraphs,
 * bulleted and numbered lists, fenced code blocks, blockquotes, and
 * inline bold / italic / code / links. Intentionally does not parse
 * tables or raw HTML — articles should stick to plain markdown so the
 * /guides renderer stays auditable without pulling in remark.
 *
 * Returned HTML is safe to drop into `dangerouslySetInnerHTML` because
 * inline content is HTML-escaped before formatting substitution.
 */

function escape(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(text: string): string {
  let out = escape(text);

  // [label](https://example.com) — rel=nofollow for external links only.
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    (_, label, href) => {
      const external = /^https?:\/\//.test(href);
      const rel = external ? ' rel="nofollow noopener noreferrer" target="_blank"' : '';
      return `<a href="${href}"${rel} class="text-blue-600 hover:text-blue-700 underline">${label}</a>`;
    },
  );

  // **bold**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // *italic* (not matched if already inside **)
  out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  // `inline code`
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">$1</code>',
  );

  return out;
}

export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      const langClass = language ? ` class="language-${escape(language)}"` : '';
      out.push(
        `<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4"><code${langClass}>${escape(
          buf.join('\n'),
        )}</code></pre>`,
      );
      continue;
    }

    // Heading.
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInline(headingMatch[2].trim());
      const sizes = ['', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
      out.push(
        `<h${level} class="font-bold text-gray-900 ${sizes[level]} mt-8 mb-3">${content}</h${level}>`,
      );
      i++;
      continue;
    }

    // Blockquote.
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(
        `<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">${renderInline(
          buf.join(' '),
        )}</blockquote>`,
      );
      continue;
    }

    // Unordered list.
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s+/, ''))}</li>`);
        i++;
      }
      out.push(
        `<ul class="list-disc pl-6 my-4 space-y-1 text-gray-700">${items.join('')}</ul>`,
      );
      continue;
    }

    // Ordered list.
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ''))}</li>`);
        i++;
      }
      out.push(
        `<ol class="list-decimal pl-6 my-4 space-y-1 text-gray-700">${items.join('')}</ol>`,
      );
      continue;
    }

    // Blank line.
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — consume until blank line or block-level prefix.
    const paraBuf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/.test(lines[i])
    ) {
      paraBuf.push(lines[i]);
      i++;
    }
    out.push(
      `<p class="text-gray-700 leading-relaxed my-4">${renderInline(paraBuf.join(' '))}</p>`,
    );
  }

  return out.join('\n');
}

/** Pull the first paragraph (for meta description fallback). */
export function firstParagraph(markdown: string): string {
  for (const para of markdown.split(/\n\s*\n/)) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/.test(trimmed)) continue;
    // Strip markdown formatting for the plain-text excerpt.
    return trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
}
