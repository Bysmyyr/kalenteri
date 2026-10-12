// Pure helpers for the day submission form (also loaded by node --test).
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.FormLib = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Keep only balanced <b>...</b>; escape every other < and >.
  function sanitizeDescription(text) {
    let open = 0;
    const normalized = String(text).replace(/\r\n?/g, '\n').trim();
    const out = normalized.replace(/<\/?b>|[<>]/gi, token => {
      const lower = token.toLowerCase();
      if (lower === '<b>') {
        open++;
        return '<b>';
      }
      if (lower === '</b>') {
        if (open === 0) return '';
        open--;
        return '</b>';
      }
      return token === '<' ? '&lt;' : '&gt;';
    });
    return out + '</b>'.repeat(open);
  }

  // One line, safe to place after //. JS \s also matches U+2028/U+2029, which end a // comment.
  function flattenComment(text) {
    return String(text).replace(/\s+/g, ' ').trim();
  }

  function roundCoord(n) {
    return Number(Number(n).toFixed(6));
  }

  // Builds the object literal the author pastes into js/locations.js.
  function buildSnippet(data) {
    const entries = [];
    if (data.mode === 'new') {
      entries.push({ text: 'day: 0', comment: `requested: "${flattenComment(data.dayText)}"` });
    } else {
      entries.push({ text: `day: ${data.day}` });
    }
    if (data.image) {
      entries.push({
        text: `image: ${JSON.stringify(data.image)}`,
        comment: data.mode === 'new' ? 'rename to <day>.jpg' : undefined
      });
    }
    entries.push({ text: `description: ${JSON.stringify(sanitizeDescription(data.description))}` });
    const preview = sanitizeDescription(data.previewDescription || '');
    if (preview) {
      entries.push({ text: `previewDescription: ${JSON.stringify(preview)}` });
    }
    entries.push({ text: `lat: ${roundCoord(data.lat)}` });
    entries.push({ text: `lng: ${roundCoord(data.lng)}` });

    const lines = entries.map((entry, i) => {
      const comma = i < entries.length - 1 ? ',' : '';
      return `  ${entry.text}${comma}${entry.comment ? ` // ${entry.comment}` : ''}`;
    });
    return `{\n${lines.join('\n')}\n},`;
  }

  return { sanitizeDescription, flattenComment, roundCoord, buildSnippet };
});
