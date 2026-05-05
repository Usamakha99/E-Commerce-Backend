/**
 * Plain-text extractor for previews (tables, truncation).
 */
export function stripHtml(html) {
  if (html == null || typeof html !== 'string') return '';
  if (typeof document === 'undefined') {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/** True when HTML has no meaningful text (handles empty Quill state e.g. &lt;p&gt;&lt;br&gt;&lt;/p&gt;). */
export function isRichTextEmpty(html) {
  return stripHtml(html).length === 0;
}

function escapeHtmlText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Legacy highlights were JSON arrays; editors use HTML. Returns HTML safe for RichTextEditor. */
export function normalizeHighlightsForEditor(raw) {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && raw.length > 0) {
    return `<ul>${raw.map((item) => `<li>${escapeHtmlText(item)}</li>`).join('')}</ul>`;
  }
  return '';
}

export function highlightsHaveContent(raw) {
  const html = normalizeHighlightsForEditor(raw);
  return !isRichTextEmpty(html);
}
